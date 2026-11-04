#!/usr/bin/env python3
"""把 LXGW WenKai 拆成「高频包 + 长尾包」，让访客不必下载完整的 8 MB 字体。

- 高频包：全站内容当前用到的字，每个页面都会下载，并在 <head> 里 preload。
- 长尾包：字体里其余的字，切成多个小文件；靠 unicode-range，
  只有页面真的出现这些字时浏览器才会下载。

新课件里出现新字时不用重跑：那个字已经在某个长尾包里。想把新字并进高频包时
才需要运行本脚本（在本机运行，结果提交进仓库，服务器部署步骤不变）：

    pip install fonttools brotli
    python3 scripts/fontSplit.py

文件名带内容哈希，所以重跑后不会被 nginx 的一年缓存挡住。

输出：
    static/fonts/wenkai/*.woff2     字体切片
    assets/css/fonts-generated.css  @font-face 声明
    data/fonts.json                 需要 preload 的高频包路径
"""
import hashlib
import io
import json
import multiprocessing
import pathlib
import shutil
import tempfile

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "scripts" / "fonts-src"
OUT_DIR = ROOT / "static" / "fonts" / "wenkai"
CSS_OUT = ROOT / "assets" / "css" / "fonts-generated.css"
DATA_OUT = ROOT / "data" / "fonts.json"

FAMILY = "LXGW WenKai"
WEIGHTS = {400: "LXGWWenKai-Regular.woff2", 500: "LXGWWenKai-Medium.woff2"}
TAIL_CHARS_PER_SLICE = 600

# 这些目录里的文本决定高频包的内容
SCAN_DIRS = ["content", "data", "i18n", "layouts", "config", "assets/js",
             "themes/hugoplate/layouts", "themes/hugoplate/i18n"]
SCAN_SUFFIXES = {".md", ".html", ".toml", ".yaml", ".yml", ".json", ".js"}
# 不管内容里有没有，这些常用符号始终放进高频包
ALWAYS_CORE = [(0x20, 0x7E), (0xA0, 0xFF), (0x2010, 0x2027), (0x2030, 0x205E),
               (0x3000, 0x303F), (0xFF00, 0xFFEF)]


def site_codepoints():
    cps = set()
    for lo, hi in ALWAYS_CORE:
        cps.update(range(lo, hi + 1))
    for name in SCAN_DIRS:
        for path in (ROOT / name).rglob("*"):
            if path.is_file() and path.suffix in SCAN_SUFFIXES:
                cps.update(map(ord, path.read_text(errors="ignore")))
    return cps


def unicode_range(cps):
    """把码点集合压缩成 CSS unicode-range，相邻码点合并为区间。"""
    parts, cps = [], sorted(cps)
    start = prev = cps[0]
    for cp in cps[1:] + [None]:
        if cp is not None and cp == prev + 1:
            prev = cp
            continue
        parts.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
        start = prev = cp
    return ",".join(parts)


def build_slice(job):
    ttf_path, name, cps = job
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.recalc_timestamp = False
    font = TTFont(ttf_path, recalcTimestamp=False)
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=cps)
    subsetter.subset(font)
    font.flavor = "woff2"
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    filename = f"{name}.{hashlib.sha1(data).hexdigest()[:8]}.woff2"
    (OUT_DIR / filename).write_bytes(data)
    return filename, cps, len(data)


def face(filename, weight, cps):
    return (f"@font-face{{font-family:'{FAMILY}';"
            f"src:url('../fonts/wenkai/{filename}') format('woff2');"
            f"font-weight:{weight};font-style:normal;font-display:swap;"
            f"unicode-range:{unicode_range(cps)}}}")


def main():
    site = site_codepoints()
    shutil.rmtree(OUT_DIR, ignore_errors=True)
    OUT_DIR.mkdir(parents=True)

    css = ["/* 由 scripts/fontSplit.py 生成，不要手动修改 */"]
    core_paths = []
    with tempfile.TemporaryDirectory() as tmp, multiprocessing.Pool() as pool:
        for weight, source in WEIGHTS.items():
            font = TTFont(SRC_DIR / source, recalcTimestamp=False)
            font.flavor = None
            ttf_path = pathlib.Path(tmp) / f"{weight}.ttf"
            font.save(ttf_path)
            cmap = set(font.getBestCmap())

            core = sorted(cmap & site)
            tail = sorted(cmap - site)
            jobs = [(str(ttf_path), f"{weight}-core", core)]
            for i in range(0, len(tail), TAIL_CHARS_PER_SLICE):
                index = i // TAIL_CHARS_PER_SLICE + 1
                jobs.append((str(ttf_path), f"{weight}-t{index:02d}",
                             tail[i:i + TAIL_CHARS_PER_SLICE]))

            results = pool.map(build_slice, jobs)
            css.append(face(results[0][0], weight, results[0][1]))
            for filename, cps, _ in results[1:]:
                # 字库的空位也算进区间：unicode-range 能短很多，而这些码点本来就没字
                css.append(face(filename, weight,
                                set(range(cps[0], cps[-1] + 1)) - site))
            core_paths.append(f"fonts/wenkai/{results[0][0]}")

            sizes = [size for _, _, size in results[1:]]
            print(f"{weight}: 字库 {len(cmap)} 字，高频包 {len(core)} 字 "
                  f"{results[0][2] // 1024} KB，长尾包 {len(sizes)} 个，"
                  f"{min(sizes) // 1024}–{max(sizes) // 1024} KB")

    CSS_OUT.write_text("\n".join(css) + "\n")
    DATA_OUT.write_text(json.dumps({"preload": core_paths}, indent=2) + "\n")
    print(f"CSS {CSS_OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
