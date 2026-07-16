---
title: "模块 5.2：Python 的安装和环境设置"
meta_title: ""
description: "后端第二课：把 Python 装到电脑上，理清一台机器里多个 Python 的关系，用 venv 给每个项目建一套专属环境；跑起第一个 Python 程序、认一认代码结构，再用 pip 装第三方库（requests）用 Python 调一次 API——venv、pip、requirements.txt 一并落地，后端要用的环境这一节一次备齐。"
date: 2026-07-07T00:00:00+08:00
image: "/images/module-5-2.webp"
categories: ["零到全栈"]
tags: ["Python", "后端", "venv", "虚拟环境", "pip", "requirements", "全栈"]
weight: 20
draft: false
---

> 把 Python 装到电脑上，给项目建好自己的专属环境（venv），跑起第一个 Python 程序、认一认代码结构，再动手装一个第三方库（`requests`）用 Python 调一次 API——pip、requirements.txt 一并落地。后端要用的环境，这一节一次备齐。

---

## 我们需要 Python 了

上一节我们亲手调用了两个 API，也定下了目标：接下来要用 Python，给我们的网站写一个自己的 API。

要运行 Python 写的代码，电脑上得先有 Python。

这个感觉你应该不陌生。如果你已经做过现代前端的学习实战，那很容易想到本地运行 JS 代码之前要先装 Node——因为 Vite、Next 那一套都得靠 Node 才能跑起来。

后端也是同一个道理：**先有运行环境，再谈写代码。** 前端项目的运行环境是 Node，我们后端是用 Python 写的，所以项目的运行环境就是 Python。

这一节把后端要用的环境一次备齐：**装好 Python、给项目建一套自己的专属环境、跑起第一个程序认一认代码，最后动手装一个第三方库、用 Python 调一次 API。**

---

## 装 Python

安装 Python 之前，可以先确认一下你电脑上是否已经安装了 Python：

```bash
python3 --version    # 打印出 Python 3.x 的版本号，就装好了
```

或者（Windows 一般是输入 `python` 而非 `python3`）：

```bash
python --version
```

- 打印出 Python 3.x 的版本号，就说明已经安装了 Python。
- 如果打印出 Python 2.x 的版本号，那要注意一下：2.x 版本的 Python 官方已经不再维护了，我们也不建议再用。

无论你当前电脑上是否已经安装有 Python，我都建议你重新安装一下最新版的 Python（多个不同版本的 Python 可以在电脑上共存，不用担心冲突）。

安装方式和当初装 Node 一样：去官网下载安装包。

1. 打开 Python 官网下载页：<https://www.python.org/downloads/>
2. 下载最新稳定版的安装包（macOS 是一个 `.pkg` 文件，Windows 是 `.exe`）；
3. 双击安装，一路默认下一步即可；
4. 装完后，**重新开一个终端窗口**，验证：

```bash
python3 --version    # 打印出 Python 3.x 的版本号，就装好了
```

或者：

```bash
python --version
```

应该就可以看到刚刚安装的最新版 Python 的版本号了。

---

### `python3` 和 `python`

为什么在 macOS 上敲的命令是 `python3` 而不是 `python` 呢？

和 JavaScript 语言一样，Python 语言诞生也已经有几十年了。在漫长的发展过程中，它也经历过一次**不兼容的大版本升级**。

早期的 Python 世界，几乎所有开发者都在使用 **Python 2**。后来，Python 官方为了修复一些历史设计问题，推出了 **Python 3**。但这一次升级并不像浏览器自动更新那样平滑，Python 3 中有不少语法和行为与 Python 2 不兼容。

这意味着，在很长一段时间里，一台电脑上可能需要同时安装 **Python 2** 和 **Python 3**——因为有些老项目只能运行在 Python 2，而新项目则推荐使用 Python 3。

为了避免混淆，许多 Linux 和 macOS 系统约定：

- `python` 指向 Python 2（或者保留为空）；
- `python3` 明确指向 Python 3。

久而久之，`python3` 就成为了许多系统和教程中的标准写法。

不过，随着 Python 2 已经停止维护（2020 年正式结束支持），如今越来越多的系统重新把 `python` 指向了 Python 3。例如在 Windows 官方安装器、以及很多现代 Linux 发行版中，直接输入 `python` 就已经启动的是 Python 3。

对于我们使用来说，可以分别试一下，哪个能用就用哪个。

---

## 如果我们电脑里不止一个 Python

对于以前从来没有安装过 Python、但电脑上仍然已经有 Python 的情况——这很正常。它可能是操作系统自带的，也可能是你以前装别的软件时顺带装上的。

我们前面说过，**一台电脑上，可能同时住着好几个 Python。**

那问题来了：我敲 `python3` 的时候，用的到底是哪一个？

有一个终端命令，可以查询并回答这个问题。在 Mac 下可以输入：

```bash
which python3
```

如果是 Windows 或 Linux，可以看如下的对照：

| 操作系统 | 命令 |
| --- | --- |
| macOS | `which python3` |
| Linux | `which python3` 或 `command -v python3` |
| Windows（CMD） | `where python` |
| Windows（PowerShell） | `Get-Command python` 或 `where.exe python` |

它会打印出一条路径——**这就是你现在敲 `python3` 时，真正被执行的那一个。**

还可以更进一步，把候选名单全列出来：

```bash
which -a python3
```

你可能会看到好几条路径（每个人机器不一样，多少不等）——排在最前面的那个，就是当前生效的。

一个值得记住的生存技能：

> 以后遇到“版本不对”“明明装了却找不到”这类怪事，第一招就是 `which python3`（macOS / Linux）或 `where python`（Windows）——先搞清楚**自己此刻用的到底是哪一个 Python**。很多环境问题，看一眼路径就真相大白。

如果某一次我们明确想用其中某一个版本，但它并不是 `python3` 这个命令指向的那个默认版本，该怎么办呢？我们可以直接在 `python` 命令里指明需要用到的版本号。

例如我的电脑上同时安装有 `python3.12` 和 `python3.14`，默认 `python3` 指向的是 `python3.14`：

```bash
% python3 --version
Python 3.14.6
```

但如果我明确想用 `python3.12`，就可以不用 `python3` 这个命令，而是直接用 `python3.12`：

```bash
% python3.12 --version
Python 3.12.9
```

---

## venv 与环境隔离

盘点一下刚才看到的现状：电脑里可能住着好几个 Python，`python` 和 `python3` 还可能各指各的——每次都要靠 `which` 确认“我现在用的到底是哪一个”，这本身就是个负担。这是关于**不同 Python 版本管理**的困境。

此外，还有另一个问题：我们还需要安装一些第三方库、工具包，这些工具包也各自有自己的版本。以后你电脑上不会只有一个基于 Python 开发的项目，它们各自需要的工具包、甚至包的版本都可能不一样，如果全挤在同一份公共 Python 里，早晚会打架。

> 什么叫第三方库？还记得前端的时候我们用过的那个 anime.js 动画库吗？那个就是 JS 生态中的一个第三方库。Python 生态中这样的第三方库也有非常多，我们几乎肯定会用到它们。

所以，事情现在变得复杂了。首先，电脑上会有不同版本的 Python，我们的不同项目可能分别依赖不同版本的 Python；其次，每个项目还会各自依赖一些不同版本的工具包。

![一台电脑上可以住着多个 Python，每个项目用 venv 绑定自己专属的 Python 版本和第三方依赖，互不影响](/images/module-5-2-envs.webp)

在 4.2 讲前端依赖时，我们立过一条规矩——**依赖应该跟着项目走**，每个项目有自己的 `node_modules`。Python 项目应对同样的处境，也有相似的方案。

Python 官方对这个局面的解法是：**别在系统那堆 Python 里纠结，给每个项目配一套自己专用的环境**——术语叫**虚拟环境**（virtual environment）。Python 自带了一个做这件事的工具，叫 **venv**。

具体怎么做呢？

### 一个示例

假设一个项目的路径是 `~/project_A`，它需要用到 Python 3.12。那么我们就可以先进入项目目录，然后创建一个 `.venv`：

```bash
cd ~/project_A
python3.12 -m venv .venv
```

这个 `.venv` 是一个目录，它会帮我们管理当前目录的 Python 环境——用的是电脑上哪个版本的 Python、安装了哪些第三方包，以及这些包分别是什么版本。

但创建 `.venv` 之后，还无法立即使用（这点与 Node 的 `package.json` 不同）：`.venv` 还需要**激活**才可以。

```bash
source .venv/bin/activate
```

激活之后，终端命令行的最前面，会自动带上 `(.venv)` 的标识。在这种情况下，无论用 `python` 命令（此刻可以用 `python` 命令了，哪怕之前不能用、只能用 `python3`）还是 `python3` 命令，都只会指向 Python 3.12；并且安装第三方库的时候，也只会装到 `~/project_A` 这个项目下的 `.venv` 之中，而不是全局。

如果此时关闭终端会话，再开一个新的终端会话，那么这个 `(.venv)` 就消失了，venv 虚拟环境也就退出了。

或者，我们也可以不关闭终端会话，而是用下面的命令显式要求退出：

```bash
deactivate
```

### 常见疑问

#### 1. 两个项目的虚拟环境目录都叫 `.venv`，激活后都显示 `(.venv)`，怎么区分？

如果有两个项目 `project_A` 和 `project_B`，它们管理虚拟环境的目录都叫 `.venv` 吗？激活之后都是显示 `(.venv)` 这个提示符吗？我该如何判断当前在哪一个虚拟环境？

管理虚拟环境的目录不是必须叫 `.venv`，但这是一个约定俗成的名称，许多配套工具（例如 VS Code）都认得它，尤其是 AI 认得它，不建议变更。

如果想在激活之后让终端有一个不同的提示符，可以在创建 `.venv` 的时候给它一个自定义提示符：

```bash
python3 -m venv --prompt=project_A .venv
```

这样，创建的 venv 目录名仍然是 `.venv`，但在终端上看到的就不再是 `(.venv)` 而是 `(project_A)` 了。

#### 2. 我已经在用 miniconda / anaconda 了，接下来怎么用 venv？

如果你打开终端之后，每次命令行的最前面都会有一个 `(base)` 这样的提示符，那么大概率说明你已经在使用 miniconda / anaconda 了，我们统称为 conda。

conda 也可以管理 Python 虚拟环境。**如果你已经在使用 conda 了，那么就不再建议你使用 venv 进行 Python 环境的管理**——因为 conda 采用的是一个完全不同的环境管理策略，如图所示：

![conda 用一套自己的方式在系统里管理多个独立环境（base、myenv312…），每个环境可装不同的 Python 版本，项目自己不保存环境上下文](/images/module-5-2-conda.webp)

conda 实际上是全局安装的，用一套自己的方式在管理多个不同的 Python 环境，每一个环境都会有一个自己的名字，默认的环境名叫 `base`，用户可以自己创建一个新的环境（比如 `myenv312`），每一个环境中可以安装不同的 Python 版本。

conda 的“侵略性”比较强，一旦按照官方的指引安装了 conda 之后，每次启动终端的时候，conda 都会启动。此时直接输入 `python`，运行的就会是 conda 的默认环境（即 `base` 环境）。

与 Python 内置的 venv 不同的是，conda 并不会在项目中创建一个类似 `.venv` 的目录，所以项目自身并不保存它所依赖的 conda 环境的上下文，需要开发者自己记住项目与环境之间的对应关系。

> 从这个角度来说，在 vibe coding 时代，venv 的方式实际上更有优势——AI Agent 可以在项目中明确地理解到项目的依赖。

我们的课程后续会使用 venv 来做 Python 环境的管理。如果你现在在用 conda，并且想以后也改用 venv，那么建议先退出 conda。

#### 3. 如何退出 conda

如果每次打开终端都会看到 `(base)` 这样的提示符，那么可以执行下面的命令，关闭 conda 的自动启动：

```bash
conda config --set auto_activate_base false
```

> 这里有个版本差异要注意：**较新版本的 conda（24.9 及以后）** 把这个配置项改名成了 `auto_activate`，所以新版也可以写成：
>
> ```bash
> conda config --set auto_activate false
> ```
>
> 新版用 `auto_activate_base` 仍然有效，只是会多打印一句“该项已弃用”的警告。**两条命令你机器上哪条不报错就用哪条**——旧版认前者，新版两者都认。

执行之后，关闭终端，再打开，就不会看到 `(base)` 提示符了。以后再启动终端，也不会默认进入 conda 的 base 环境了。

上面这个命令只是不再默认启动 conda，并不代表 conda 被移除了。如果以后还需要用到 conda，可以用下面这个命令重新进入：

```bash
conda activate
```

需要退出 conda 的时候，用下面这个命令可以退出：

```bash
conda deactivate
```

---

## 在项目中创建后端目录和 .venv

环境问题搞定了，接下来我们就回到自己的项目，创建一个后端目录，用 Python 小试牛刀。先给我们的后端代码安个家，就放在贯穿全程的项目里：

```bash
cd ~/zero-to-tech
mkdir backend
cd backend
```

> 这里你可能会冒出一个问题：在 `zero-to-tech` 项目下，后端有了自己的 `backend/` 目录，那要不要也建一个 `frontend/`，把前端挪进去，弄得对称一点？
>
> 这里我们选择**不挪。**
>
> 一般而言，新起的全栈仓库确实常见 `frontend/` 和 `backend/` 并列——但我们这个仓库不是设计出来的，是**长出来的**：它从模块 3 的一个静态页开始，一路长成 React、再长成 Next，前端占着根目录，是它成长的年轮。这也是真实老项目的常态：**结构带着历史痕迹，只要不碍事，就不为了对称而重构。** 现在它一点都不碍事——前端在根目录照常 `npm run dev`，后端在 `backend/` 里各干各的，互不打扰；而且 4.6 配好的 Nginx 也全都继续有效。哪天它真碍事了（比如要把前后端拆成两个仓库），再挪不迟——到那时，你自己已经完全有能力挪了。
>
> 顺便，这也回答了“前后端的独立体现在哪”：不在目录的组织方式上，而在**两个独立的进程、两套独立的依赖、两种独立的部署方式**上——这些我们接下来几节会挨个碰到。

然后在 `backend/` 里创建虚拟环境（顺手用上刚学的 `--prompt`，给它起个一眼能认出的名字）：

```bash
python3 -m venv --prompt=zero-to-tech .venv
```

执行完，`ls -a` 看一眼——多了一个 `.venv` 文件夹。**这个文件夹就是虚拟环境本身**：里面放着一份专属于这个项目的 Python（还有一个叫 pip 的工具——它是干什么的，等真正需要的那一刻再说）。

建好了，我们先“激活”（activate）：

```bash
source .venv/bin/activate
```

注意看提示符，前面多了一个 `(zero-to-tech)`：

```text
(zero-to-tech) libo@Mac backend %
```

这个括号在提醒你：**你现在用的，是这个项目自己的那套 Python。** 空口无凭，拿刚学的 `which` 验证一下：

```bash
which python     # → /Users/你的用户名/zero-to-tech/backend/.venv/bin/python
which python3    # → /Users/你的用户名/zero-to-tech/backend/.venv/bin/python3
```

两条路径都指进了 `.venv`——刚才那一堆候选 Python 带来的混乱，在这个项目里就此终结：**`python` 和 `python3` 指向同一份，就是项目自己的这份，再无悬念。**

想退出来的时候，一个词：

```bash
deactivate
```

提示符前的 `(zero-to-tech)` 消失，你又回到了系统环境。感受完就再 `source .venv/bin/activate` 回来。从今往后给自己立个习惯：**进这个项目干活，先激活。**

> - Windows 的同学：激活命令是 `.venv\Scripts\activate`，其余一致。
> - 一个小工具：VS Code 有个微软官方的 **Python 扩展**（左侧“扩展”面板里搜 `Python`，装微软出的那个——它同时也负责 Python 的语法高亮、补全、调试，第一次写 Python 建议装上）。装好之后，它会自动认出项目里的 `.venv`；以后在 VS Code 里**新开一个终端**，它会自动帮我们激活环境。

顺手立一条规矩：**`.venv` 不进 Git。** 它和 `node_modules` 一个性质——本地生成、体积不小、随时可重建。在项目的 `.gitignore` 里加上一行：

```text
backend/.venv/
```

---

## 第一个 Python 程序

环境好了，我们写一个程序运行一下：**用 Python 生成一段 JSON**。

为什么是 JSON？回想上一节——API 回给调用方的，基本都是 JSON。这正是我们的后端马上要天天干的事。

确认自己还在 `backend/` 目录、提示符上带着 `(zero-to-tech)`，然后用 VS Code 打开这个目录，新建一个文件 `first_json.py`，写入：

```python
import json

site_name = "zero-to-tech"

def make_data():
    data = {"message": "hello, world", "from": site_name}
    return json.dumps(data)

print(make_data())
```

回到终端，运行它（运行之前，先确定当前目录下有这个文件）：

```bash
python3 first_json.py
```

终端打印出：

```json
{"message": "hello, world", "from": "zero-to-tech"}
```

一段 JSON 出来了。这就说明我们的 Python 运行环境已经好了。

可以看到，**运行一个 Python 程序，就是“一条 `python3` 命令”＋“一个 `.py` 文件”，就这么直接**——不用构建、不用编译、不用浏览器。以前我们的 JS 代码靠浏览器跑，现在我们的 Python 代码靠 `python3` 跑。

---

## 顺着这几行代码，认一认 Python

先说清楚：**这不是语法课。** 在有 AI 的时代，语法可以边用边查；我们真正需要的，是**认得结构**——看到一段 Python 代码，知道它大致的写法。我们一起看一下（看不懂也没关系）。

刚才这个程序虽然就短短几行，但也已经是比较典型的 Python 代码文件。从上往下看。

### ① 引入库

```python
import json
```

第一行，通过 `import` 引入一个 `json` 库。

Python 在**安装的时候，就自带了一大批现成的工具**，统称**标准库**——要用哪个，`import` 一下就能用，不用另外安装。这个 `json` 就是标准库的一员，它的作用是处理 JSON 这种格式。除了它之外，常见的标准库成员还有：

- `datetime`——日期和时间；
- `random`——随机数；
- `os`——和操作系统打交道（文件、路径、环境变量）；
- `http.server`——一个能接收网络请求的小服务器（注意这个，下一节会用）。

> 有标准库，自然就有**第三方库**——不是 Python 自带的，而是世界各地的开发者写好后发布到网上的库，使用第三方库的时候**要先安装，才能 `import`**。这套逻辑我们在前端见过：比如 anime.js 就是我们用 `npm install` 装回来的第三方库。Python 这边的第三方库**装到哪儿**，你今天其实已经准备好答案了——就装进 `.venv` 这个项目专属的环境里；至于**怎么装**，下一段我们就装一个、用一个，亲眼看它落进 `.venv`。

### ② 变量

```python
site_name = "zero-to-tech"
```

第二行，定义了一个叫 `site_name` 的变量，它的值是 `"zero-to-tech"`。这个写法很容易理解，就是直接 `名字 = 值`。

### ③ 函数，以及缩进

```python
def make_data():
    data = {"message": "hello, world", "from": site_name}
    return json.dumps(data)
```

`def` 用来定义函数。注意函数体是**靠缩进**表示的——这是 Python 最显眼的规矩：JS 用花括号 `{}` 圈定代码块，**Python 里缩进本身就是语法**。哪些行缩进对齐，哪些行就属于同一块。

函数里面的最后一行是 `return`，就是这个函数最终会给出一个什么结果。

### ④ 打印

```python
print(make_data())
```

`print` 的意思就是在终端上打印（或者说显示）一些内容，这一行的意思就是把 `make_data()` 这个函数的结果打印到终端。

所以这段代码会把函数里面定义的 `data` 的值以 JSON 格式打印出来。

---

## 装第一个第三方库：用 Python 调一次 API

`first_json.py` 里的 `json` 是**标准库**，`import` 就能用。但让 Python 真正强大的，是那些海量的**第三方库**。刚才只是嘴上说了说，这就来装一个、用一个——顺便把 pip 和依赖清单一次讲透。

装什么好呢？还记得 5.1 我们用 curl 查公网 IP 吗？那件事，Python 也能做。新建一个 `api_demo.py`：

```python
import requests

resp = requests.get("https://api.ipify.org?format=json")
print(resp.json())
```

`requests` 是 Python 世界最有名的第三方库之一，专门用来发网络请求——你可以把它理解成“**代码版的 curl**”。跑跑看：

```bash
python3 api_demo.py
```

结果不是 IP，而是一段**报错**：

```text
ModuleNotFoundError: No module named 'requests'
```

**报错是线索**（这句话这门课会一直强调）。它说得很直白：找不到 `requests` 这个模块——因为它不是标准库，Python 没自带，**得先装**。

### pip：装第三方库的工具

装 Python 第三方库的工具，叫 **pip**——它在你装 Python 时就一起装好了，就是后端世界的 npm（4.2 你用 `npm install` 装过 anime.js，现在轮到 `pip install`）。先确认自己在 `(zero-to-tech)` 环境里（提示符带着括号），然后：

```bash
pip install requests
```

> **一条生存法则，从现在记起：装包之前，先瞄一眼提示符，确认 `(zero-to-tech)` 在。** 最常见的翻车就是忘了激活、把包装到了外面——回头一跑代码报“找不到模块”，人就懵了。

看它滚动的输出——除了 requests 本身，还捎带装了 `certifi`、`charset-normalizer`、`urllib3`、`idna` 几个你没点名的：**依赖还有依赖**，npm 那边如此，pip 这边也一样。

装完，问一个最关键的问题——**它装到哪儿去了？** 看一眼：

```bash
pip show requests
```

```text
Name: requests
Version: 2.34.2
Location: /Users/你的用户名/zero-to-tech/backend/.venv/lib/python3.x/site-packages
```

`Location` 那行，路径**指进了 `.venv`**——正是我们刚建的那间“项目专属的屋子”。requests 只住进了这个项目，没安装到全局环境，所以也不会和别的项目打架。前面讲了半天 venv 的道理，这一刻**落到实处了**。（也可以敲 `ls .venv/lib/python*/site-packages/`，亲眼看到 requests 的目录就躺在里面。）

现在再跑一次 `api_demo.py`：

```bash
python3 api_demo.py
```

```text
{'ip': '114.86.123.45'}
```

**通了。** 我们用 Python 查到了自己的公网 IP——和上一节（5.1）用 curl 干的是同一件事，只不过这回是**程序在调 API**，正是 5.1 说的那句“API 是设计给计算机程序用的”。（往后我们自己的后端，也可以像这样去调别人的 API。）

> 眼尖的你可能发现：这回打印出来的 `{'ip': ...}` 是**单**引号，而刚才 `first_json.py` 打印的 `{"message": ...}` 是**双**引号，怎么不一样？因为它们其实是两种东西：`first_json.py` 里 `json.dumps(...)` 产出的是一段 **JSON 文本**（JSON 规定用双引号）；而这里 `resp.json()` 直接把返回的 JSON **解析成了一个 Python 字典**，打印字典时 Python 习惯用单引号。**字典 ≈ JSON**——这个对应关系以后天天见。

### requirements.txt：给依赖记一本账

现在冒出一个新问题：`.venv` 不进 Git（刚立的规矩），那别人拿到这个项目之后，怎么知道要装 `requests`？或者我们把代码拉到服务器上之后，应该如何安装依赖？

答案和前端一模一样：前端靠 `package.json` 记依赖，Python 靠 **`requirements.txt`**。生成它：

```bash
pip freeze > requirements.txt
```

`cat requirements.txt` 看一眼：

```text
certifi==2026.6.17
charset-normalizer==3.4.8
idna==3.18
requests==2.34.2
urllib3==2.7.0
```

每个包一行，**版本号钉得死死的**（连那几个“依赖的依赖”也一并列上了）。以后任何人拿到项目，一条命令就能装齐一模一样的环境：

```bash
pip install -r requirements.txt
```

这就是后端版的 `npm install`。和 `.venv` 相反，**`requirements.txt` 要进 Git**——它是项目的一部分，得跟着代码走。到模块 7 上服务器时，需要在服务器上安装依赖的时候，这份清单的价值就能体现了。

> 又凑齐一组“角色对应”，前端后端一一对上：
>
> | 前端 | 后端 | 干的活 |
> | --- | --- | --- |
> | `npm` | `pip` | 装第三方包 |
> | `node_modules/` | `.venv/` | 装到哪儿（都不进 Git） |
> | `package.json` | `requirements.txt` | 依赖清单（都进 Git） |

---

## 这一节你应该带走什么

- 后端项目和前端项目一样，**先有运行环境再谈写代码**：Python 从官网装，`python3 --version` 验证。
- **一台电脑可能有多个 Python**；`which python3` 看当前用的是哪一个——排查环境问题的第一招；想用特定版本，直接敲 `python3.12` 这样带版本号的命令。
- **venv 给每个项目一套自己的 Python**：`python3 -m venv .venv` 建（可加 `--prompt=名字` 自定义提示符）、`source .venv/bin/activate` 进（提示符出现 `(.venv)` 或那个自定义名字）、`deactivate` 出；激活之后 `which python` 指进项目里——多 Python 的混乱就此和这个项目无关。**进项目干活，先激活。**
- **`.venv` 不进 Git**（`node_modules` 的老规矩）；conda 是同类环境工具——若你在用，本节也讲了怎么退出、改用 venv。
- 运行 Python 程序 = **一个 `.py` 文件 ＋ 一条 `python3` 命令**。
- 认得四个结构：**`import`、变量、`def` ＋缩进、字典（≈ JSON）**——不用背语法，认得就行。
- **标准库**随 Python 一起安装、`import` 即用（`json`、`datetime`、`random`、`os`、`http.server`……）；**第三方库**（如 `requests`）得先装才能用。
- **`pip install` 装第三方库**，装进当前激活的 `.venv`（`pip show` 看落点）——**装包前先看提示符**；`requests` 让你用 Python 调了一次 API（5.1 curl 的“代码版”）。
- **`requirements.txt` 记依赖清单**（`pip freeze` 生成，`pip install -r` 复现）——它和 `.venv` 相反，**要进 Git**。前端 `npm`/`node_modules`/`package.json` ↔ 后端 `pip`/`.venv`/`requirements.txt`。
- 我们已经能用 Python **生成并收发 JSON**；下一节把它**做成一个真正的服务**——手搓第一个 API。

---

[← 上一节：模块 5.1 究竟什么是 API？](/zero-to-fullstack/lessons/module-5-1/) | [下一节：模块 5.3 看懂 HTTP，手搓 API →](/zero-to-fullstack/lessons/module-5-3/)
