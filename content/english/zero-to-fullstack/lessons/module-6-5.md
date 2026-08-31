---
title: "模块 6.5：重构，在项目中使用 SQLite"
meta_title: ""
description: "先给 main.py 分层、把存储拆进 storage.py，再把文件换成 SQLite——接口一行没破，前端毫无察觉。"
date: 2026-08-28T00:00:00+08:00
categories: ["依赖于数据持久化"]
tags: ["重构", "分层", "存储层", "SQLite", "数据库", "模块化", "换芯不换壳", "职责", "索引", "gitignore", "ORM", "后端", "全栈"]
weight: 28
draft: false
---

> 把文件版的存储系统换成数据库的版本

---

## 这一节的目标

上一节我们已经学习了`SQLite`数据库的用法，但是我们的`zero-to-tech`项目现在还没有用上SQLite，仍然是在用`history.json`这个文件在承担存储的职责。这一节，就可以换成用SQLite做存储了。

这一节我们要改造一下`zero-to-tech`这个项目，但是**只动存储层**：会需要改动不少 python 代码，但**不会破坏接口约定**（`/api/analyze` 和 `/api/history` 对老调用方的行为不变），前端也就"毫无察觉"，因此也不需要改前端代码。

---

## 先给 main.py 分层

"把存储层换成数据库"，听着像一件事，落到代码里其实是好几处。我们把 `backend/main.py` 打开，从头到尾扫一遍，看一看这个文件目前做了哪些事情。

这个文件现在也就几十行，看着是一整块。但仔细看，它里面已经住着**三种不同的职责**：

```python
import json                                     # ← 存储
from datetime import datetime, timezone          # ← 业务（时间戳是 analyze 生成的）

app = FastAPI()                                 # ← 启动/配置区，不归这三层
# ... CORS ...

HISTORY_FILE = "history.json"                   # ← 存储
def load_history(): ...                         # ← 存储
def save_record(record): ...                    # ← 存储

@app.get("/api/profile")                        # ← 接口
def get_profile():...

def score_label(score):...                      # ← 业务

@app.post("/api/analyze")                       # ← 接口
def analyze(req: AnalyzeRequest):
    text = req.text                             # ← 业务
    score = round(SnowNLP(text).sentiments, 2)  # ← 业务
    result = { ... }                            # ← 业务
    save_record(result)                         #   （接口层喊一声存储层）
    return result

@app.get("/api/history")                        # ← 接口
def history():
    records = load_history()                    # ← 存储？
    records.reverse()                           # ← 存储？
    return records[:10]                         # ← 存储？
```

三层各管各的：

- **接口层**——对接前端的API（`@app.post` / `@app.get`），管的是"接收什么、响应什么"；
- **业务层**——算情感分、算拼音、把结果拼成一条记录，管的是"这件事本身怎么做"；
- **存储层**——所有跟"东西存在哪儿、怎么存、怎么取"打交道的代码。

目前这三层的代码都放在`main.py`，在项目还小的时候这么做是没问题的，不一定要分开成不同的文件，因为分层分的是职责，不是文件。

但是，还有个小问题，看 `/api/history` 里那三行：

```python
records = load_history()   # 读出全部
records.reverse()          # 倒序
return records[:10]        # 切前 10 条
```

"读出全部、倒过来、切前十"——这是**取数据的手法**，是地地道道存储层的活儿，可它现在长在接口函数里。可以看出来我们此前写的`main.py`文件，代码的分层设计并不清晰。

分层设计不清晰的代价就是，当我们要改项目背后的存储的时候，因为这个接口函数里直接写了与存储相关的三行代码，我们不得不伸手去改这个接口函数（因为**换成数据库之后，这三行会变成一句 SQL**）。所以，在真正的做存储层的切换之前，我们值得先对`main.py`中的代码做一次小型的重构。

---

## 重构方案

在之前学习前端的时候，我们也做过重构，基本思路就是重新划分代码职责，用一种更易于管理的方式组织代码。我们的`main.py`也可以按照分层思想进行重构，把代码拆成多个文件，再用 `import` 把它们的依赖关系写进代码里。

重构还有一条铁律要记住：**功能一点都不能变。** 重构只挪位置、不改行为，跑出来但凡有一点不一样，就说明搬错了。这条铁律其实不是额外的纪律，**它就是"重构"这个词的定义**——业内对重构的定义是：在不改变外部可观察行为的前提下，调整代码的内部结构。行为一变，就不叫重构了。（所以严格说，这一节的第二步"把文件换成 SQLite"**不算重构**，那是换实现；只有第一步的搬家、以及后面把 `10` 改成参数，才是重构。）

此外，不要为了重构而重构，现在main.py中的代码比较少，接口层和业务层就那么几行，而且今天一行都不用改；真正要动的只有存储层，它今天整个要被换掉。这种情况下把业务层和接口层拆开几乎换不来任何好处，只会多增加一些来回跳转的成本，而把存储层拆开就很值得。

所以比较合适的方案是只把存储层单独拆出来一个文件，拆完之后是这样两个文件：

```text
backend/
  main.py       ← 接口层 ＋ 业务层：对外的门，和"这件事怎么算"
  storage.py    ← 存储层：数据存在哪儿、怎么存、怎么取
```

那什么时候才该给业务层也开一个文件？**等它也长到"我们一眼看不出它的边界在哪"的时候。** 6.2 那一节我们给业务层换过一次分析内核（从写死的占位值切换到 snownlp），那次没拆文件也很轻松，因为要换的东西就窝在一个函数里。但今天要换的存储层，是散落在文件各处的，**边界看不见了，才需要用文件把它框出来**。

再说文件名。文件名为什么叫 `storage.py`，因为这一层的职责就是存储，无论是用文件实现还是用SQLite实现，哪怕以后改了别的存储实现，它的职责不会变。给边界起名字，要用**职责**起名字，不用**实现**来起名字。这和 `save_record()`、`get_history()` 是一个道理：这两个函数名里，也没有"file"或"SQL"这些字眼。

这么一通分析，今天要干的活儿就清楚了，分**两步**：

1. **搬家**——把存储层原样搬进 `storage.py`。**功能一点不变**，存储还是用`history.json`；
2. **装修**——把 `storage.py` 整个换成 SQLite 版。`main.py` 几乎不用碰。

> 为什么非要分两步、不能一边搬一边改？因为**搬坏了和改坏了，是两种完全不同的问题**。搬完先跑一遍，如果一切没变，说明搬对了；装修之后再跑一遍，如果坏了，那一定是装修弄的。一次只做一件事，出了问题范围就小，这也是一个很值钱的习惯。
>
> 而且这两件事**性质本来就不一样**：搬家是重构，行为必须不变，所以它**自带一把尺子**——跑一遍，不一样就是错了；装修是换实现，行为本来就该变，**它没有这把尺子**。混在一起做，那把尺子就废了：跑出来不对，我们根本分不清是搬错了还是换错了。

---

## 第一步：搬家（功能零变化）

在 `backend/` 里新建一个 `storage.py`，把 `main.py` 里所有属于存储层的东西**原样剪切**过来：

```python
# backend/storage.py
import json

HISTORY_FILE = "history.json"

def load_history():
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_record(record):
    records = load_history()
    records.append(record)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

def get_history():
    records = load_history()
    records.reverse()
    return records[:10]
```

前两个函数是**一个字没改**地搬过来的。最后那个 `get_history`是一个新定义的函数，它里面写的就是我们前面说的那三行职责定义不清晰的部分，现在我们把它们从接口函数里搬到了真正应该属于它的位置，原样包成一个函数。注意连那个写死的 数字`10` 都照抄了过来，**搬家就是搬家，一个字都不改。**

再回到 `main.py`。这一侧要做四件事：

1. 顶上把 `import json` 换成 `from storage import save_record, get_history`；
2. 删掉 `HISTORY_FILE`、`load_history`、`save_record` 这三样（它们已经在 `storage.py` 里了）；
3. `/api/history` 瘦身成一句 `return get_history()`；
4. **其余一个字都不动。**

`from datetime import datetime, timezone` **要留着**：时间戳是 `analyze` 生成的，那是业务层的活儿，不跟着搬家。

搬完之后的 `main.py`，完整长如下这样，**对着核一遍，别搬串了**：

```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypinyin import lazy_pinyin, Style
from snownlp import SnowNLP
from datetime import datetime, timezone

from storage import save_record, get_history      # ← 新增：跟存储层打交道，只经过这一行

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
)

profile = {
    "heroTitle": "关于我",
    "heroSubtitle": "项目，创意，灵感，心得，我的作品",
    "featuredWork": {
        "kicker": "作品",
        "title": "文字实验室",
        "copy": "拼音和情绪，挖掘中文里的细节",
        "linkLabel": "打开作品",
    },
    "identity": {
        "motto": "已识乾坤大，尤怜草木青",
        "learning": "零到全栈",
    },
}

class AnalyzeRequest(BaseModel):
    text: str

def score_label(score):
    if score >= 0.6:
        return "偏积极"
    elif score <= 0.4:
        return "偏消极"
    else:
        return "中性"

@app.get("/api/profile")
def get_profile():
    return profile

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    text = req.text
    score = round(SnowNLP(text).sentiments, 2)
    result = {
        "text": text,
        "score": score,
        "label": score_label(score),
        "pinyin": " ".join(lazy_pinyin(text, style=Style.TONE)),
        "created_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    }
    save_record(result)
    return result

@app.get("/api/history")
def history():
    return get_history()
```

改完之后，如果启动应用，访问文字实验室、访问`/api/history`，看到的效果和改之前完全一样，那就说明重构成功了。然后我们再分析一下这次改动之后，两个文件之间是怎么共同工作的。

首先，在通过`fastapi dev`启动应用的时候，`uvicorn`还是只会去找 `main.py`, 但是因为下面这一行`import`，就让`storage.py`文件成功被加载了：
```python
from storage import save_record, get_history
```

可以看出来Python 的 import 很朴素，因为`storage.py` 和 `main.py` 在同一个目录里，所以写 `from storage import save_record` 就能找到，不用写路径，不用写 `.py`。

也就是因为这个原因，`storage.py`一定要建在 `backend/`目录下，和main.py两个文件得在一块儿才行。

---

## 职责真的分干净了吗？

文件拆开了，代码也各就各位，看上去挺整齐。但**整齐从来不是重构的目的**。

回头想一想我们为什么要做这次重构——不是为了让代码好看，是为了**让每一层只管自己该管的事**。分层的价值就在于，如果哪天要换某一层，只动那一层，别人不受牵连。今天我们马上就要换存储层，指望的正是这个。

所以，判断一次重构做到位了没有，标准不是"文件变多了""函数变短了"，而是这么一句追问：

> **这一层里面，还有没有不属于它的东西？**

那接下来我们就拿这把尺子，量一量刚拆出来的 `storage.py`。

`storage.py`这一层的职责是存储， 也就是 **数据存在哪儿、怎么存进去、怎么取出来。** 除此之外的事，都不该由它操心。

再逐行看代码：

```python
def get_history():
    records = load_history()   # 把数据取出来   —— 它的事
    records.reverse()          # 新的排前面     —— 它的事（"怎么取"的一部分）
    return records[:10]        # 只给 10 条     —— ？
```

前两行没有疑问。第三行得停一下。它是不是把**两件事捏在了一起**？

- **"切一刀，只给一部分"** 这个动作——是存储层的活儿没错（等会儿换成数据库，它就是那句 `LIMIT`）；
- **"切在 10 这个位置"** 这个决定——**这应该是它管的事吗？**

想两个场景：

- 哪天业务需求改了，想在手机上显示的时候取出来 20 条——照现在这个写法，我们得去改 `storage.py`。可它是管"数据存储"的，**凭什么把一次取多少条这个事情交给它管理？**
- 反过来问：`storage.py` 需要知道什么时候取10条什么时候取20条吗？知道用户是在手机上看还是在电脑上看吗？——**不知道，也不该知道。**

所以答案很清楚：**动作归存储层，决定归调用方。** 这个数字不属于这一层，它属于调用它的那一层。存储层该说的话只有一句——"你要几条，我给几条"。

**那就把这个数字的决定权交出去。** `storage.py` 里，把写死的数字换成一个参数：

```python
def get_history(limit):
    records = load_history()
    records.reverse()
    return records[:limit]
```

`main.py` 这一侧，由调用方把数字传给它：

```python
@app.get("/api/history")
def history():
    return get_history(10)
```

这样改完之后，功能一点没变，还是最近 10 条，跑一遍结果一模一样；变的只是**这个决定归谁管**。

这同样是一次重构，搬家挪的是代码的位置，而这一次挪的是决定的归属。看似只是挪了一个数字，但背后其实是关于职责的划分。

---

## 第二步：装修（把文件存储换成 SQLite）

现在 `storage.py` 是一个独立的、边界清清楚楚的文件。但是它目前还是在使用文件版的存储系统。接下来我们就要给它换成SQLite的存储方式。

这次“装修”，我们要改 6 处代码，**全在 `storage.py` 里面**

| #   | 现在（文件版）                         | 改成（数据库版）                       |
| --- | ------------------------------- | ------------------------------ |
| 1   | `import json`                   | `import sqlite3`               |
| 2   | `HISTORY_FILE = "history.json"` | `DB_FILE` ＋ 一个 `get_conn()`    |
| 3   | （文件时代没有这一步）                     | `init_db()`：启动时**建表**          |
| 4   | `save_record`：读全部+追加+整个写回       | 一句 `INSERT`                    |
| 5   | `get_history`：全量读+倒序+切片         | 一句 `SELECT … ORDER BY … LIMIT` |
| 6   | `load_history`                  | **删掉**（数据库不需要"整份读出来"）          |

下面一处一处来

### 第 1 处：换 import

把 `storage.py` 顶上这一行：

```python
import json
```

换成：

```python
import sqlite3
```

换成数据库就不需要再和硬盘上的.json文件打交道了。

### 第 2 处：从"文件名"到"连接"

用json文件做存储的时候，入口就是一个文件名，`open()` 一下就能读写：

```python
HISTORY_FILE = "history.json"
```

而`SQLite`是一个`.db`文件，程序得先通过`sqlite3`**连上**它。所以这一处不是简单换个常量，而是多出一个新概念——把上面那一行，换成下面这一段：

```python
DB_FILE = "history.db"

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row      # 让查询结果带上列名（默认是元组）
    return conn
```

中间 `row_factory` 那行值得说一句。上一节我们在试验田里查出来的每一行都是元组，比如 `(1, '肖申克的救赎', '英语', '1994-09-23', ...)`——**光有值，没有名**。加上这一行之后，查出来的每一行就带上了列名，可以直接用 `dict(row)` 转成一个**带字段名的字典**，而这正好就是要回给前端的 JSON 形状。等会儿第 5 处就会用到它。

注意 `get_conn()` 是个**函数**，它定义了如何连接数据库。下面每个函数需要连接数据库的时候就调用它、用完 `close()`——**用的时候开门、用完关门**，这是最简单也最不容易出错的写法。

### 第 3 处：建表

这一处比较特殊：**文件版里没有对应的代码，是数据库多出来的一步。**

往文件里写，格式想怎么定就怎么定，写之前不用跟谁打招呼；而关系型数据库是**先定表结构、再往里放数据**的。所以多一个"确保表在"的函数。

紧接着 `get_conn()` 下面，新增：

```python
def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()
```

上一节我们已经学过了如何建表，这里只是换了表名和字段，`id` 依旧是自增主键。`CREATE TABLE IF NOT EXISTS` 这个写法的意思是如果还没有这个表就建，如果这个表已经在了就跳过了。

### 第 4 处：`save_record`换成SQL的写法

文件版的 `save_record` 是"读出整个文件 → 内存里追加一条 → 整个写回"三步：

```python
def save_record(record):
    records = load_history()
    records.append(record)
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)
```

用SQLite的实现就是通过SQL的`INSERT`语句来操作：

```python
def save_record(record):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO history (text, score, label, pinyin, created_at) VALUES (?, ?, ?, ?, ?)",
        [record["text"], record["score"], record["label"], record["pinyin"], record["created_at"]],
    )
    conn.commit()
    conn.close()
```

中间那句 `INSERT` 就是往表中插入数据的SQL，注意所有的值都没有直接拼进 SQL 里，而是用 `?` 占位、把值放进后面那个列表交给 `execute`——这就是上一节立下的防 SQL 注入的规矩。

还有个细节值得说一句：**时间戳沿用 Python 生成的那一份。** 上一节我们用的是 SQLite 自带的 `datetime('now')`，图的是省事；而这里我们没有依赖SQLite自己的时间函数，而是用了Python生成的时间。

### 第 5 处：`get_history`——三行变一句

文件版的 `get_history` 是"全量读 → 倒序 → 切片"三行：

```python
def get_history(limit):
    records = load_history()
    records.reverse()
    return records[:limit]
```

现在换成 SQL版：

```python
def get_history(limit):
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM history ORDER BY created_at DESC LIMIT ?",
        [limit],
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        records.append(dict(row))
    return records
```

看点有四个：

- 文件版要自己动手做的三件事（全量读、自己倒序、自己切片），现在**一句 SQL 全包了**。
- 连 `LIMIT` 后面那个数字都走占位符 `[limit]`。**值永远走 `?`，没有例外**——这条规矩的价值就在于，我们不必每次都停下来判断“这个值危不危险”，一律照办就不会漏；
- 末尾的 `.fetchall()`上一节讲过，凡是需要拿到数据作为结果的就要写它；
- 最后那个循环里的 `dict(row)`，可以把数据库查回来的内容直接当 JSON 回给前端。

> **别被 `fetchall` 里的 "all" 骗了。** 这个"all"不是表里全部的数据，而是SQL语句查回来的全部的数据，如果SQL的limit是10 ，那么就只会fetch到10条。

### 第 6 处：把 `load_history` 删掉

这个函数现在没人调用了：

```python
def load_history():
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []
```

**整个删掉。** "把整份数据读进内存"这个动作，从今天起再也不需要了。

### 对一下：换完的 storage.py

六处都改完，`storage.py` 应该长这样。对着核一遍，别漏别错：

```python
# backend/storage.py
import sqlite3

DB_FILE = "history.db"

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()

def save_record(record):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO history (text, score, label, pinyin, created_at) VALUES (?, ?, ?, ?, ?)",
        [record["text"], record["score"], record["label"], record["pinyin"], record["created_at"]],
    )
    conn.commit()
    conn.close()

def get_history(limit):
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM history ORDER BY created_at DESC LIMIT ?",
        [limit],
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        records.append(dict(row))
    return records
```

整个文件里，再也找不到 `json`、`open()`、`history.json`——**存储的实现，从文件彻底换成了数据库。**

（这份还不是最终版：这一节结尾的“善后”里，我们还会往 `init_db()` 里加一行索引。到时候会把最终的样子再贴一次。）

### 那 main.py 呢？只多两行

`storage.py` 整个被换掉了。回头看 `main.py`——**它只多了两行**，都是为了那个新冒出来的建表动作：

```python
from storage import init_db, save_record, get_history   # ← 这一行：import 里多个 init_db

app = FastAPI()
# ... CORS 等原有代码，一个字不动 ...

init_db()                                               # ← 这一行：启动时确保表在
```

在`storage.py`中定义的函数，通过一行import就引入到了main.py中。另外，每次启动的时候都执行一次 `init_db()`，这是为了确保数据库和表都在。正常情况下，只有第一次运行的时候它才会真的建表，以后每次启动都会跳过。

---

## 验证切换成功

把存储从文件系统换成SQLite之后，还需要进行测试来检验我们的存储系统是否切换成功：

- 打开文字实验室，分析一句，结果照常出来（前端用的是 `/api/analyze`，它的路径、请求体、返回字段一个没动，前端自然毫无察觉）；
- 请求 `/api/history` 接口，看到数据库中已经存储有刚才通过文字实验室分析的那行文本。

上面两步验证通过，也只能说明功能和此前一致（除了 `/api/history` 的返回里面多出来了一个 `id` 字段）。如果想看一看数据确实已经被写入到了数据库，还可以用类似 DB Browser 这样的数据库可视化工具打开 `backend/history.db` 看一看——在 Browse Data 里，刚才那句分析应该已经**躺在表里，`id` 也自动发好了**。

顺带一提：`/api/history` 的返回里现在多了个 `id` 字段，是因为 `SELECT *` 把 `id` 也带了出来。我们此前提到过，往返回里加字段并不破坏约定，所以这个 `id` 可以让它继续待在返回里，下一节还会用到它。

还有一件事值得说一句：这一节从头到尾，**我们没有打开过任何一个前端文件**。存储从一个 JSON 文件换成了一个数据库，这是地板下面天翻地覆的改动，可页面上什么都没发生。

这就是 6.2 那句"**换芯不换壳**"，今天又演了一遍——而且这次演了三层：

- `/api/analyze` 和 `/api/history` 这两个 **HTTP 接口**没变，所以前端毫无察觉；
- `save_record()` 和 `get_history()` 这两个**函数**的名字和参数没变，所以 `analyze` 一个字都不用改；
- `storage.py` 这个**文件**对外的样子没变，所以 `main.py` 只多了两行。

同一件事，在接口、函数、文件三个尺度上各成立了一次。**只要边界立得住，边界后面的东西就可以整个换掉。** 模块 7 我们还会再用一次这个红利——那时候要换的是 SQLite 本身。

---

## 善后四件事

**其一：数据不进 Git。** 所以 `.gitignore` 中需要加一行：

```text
backend/*.db
```

道理：数据是**运行时产生的**，每台机器、每个环境都该有自己的数据，它和代码不是一类东西。

这已经是我们立的第三条同类规矩了——前两条是"依赖不进"（`node_modules`、`.venv`）和"产物不进"（`out`、`.next`）。这三条合起来到底意味着什么，等模块 7 我们把项目搬上服务器、在一台全新的机器上 `git pull` 完的那一刻，会看得特别清楚。

**其二：`history.json` 退役。** 直接删掉就可以了。真实项目里“**数据迁移**”是一门正经手艺，老的数据一条都不能丢、格式还得对上。但毕竟我们项目还没上线，里面的历史数据也不值钱，从零开始最干净也最省事儿。

**其三：认识一下ORM。** 真实项目里，很多人不直接手写 SQL，而是用 **ORM**（比如 Python 的 `SQLAlchemy`），它的做法是把表包装成 Python 对象来操作，由框架帮自动生成SQL。这个东西我们没有用到（我们这两句 SQL，手写反而更清楚），我也不打算展开讲，在这里提出来你知道就行。

**其四：给 `created_at` 建一个索引。** 上一节讲索引的时候立过一条原则——**经常拿来排序、或经常拿来筛选的列，才值得建索引**。回头看我们这张 `history`：每次查历史都是 `ORDER BY created_at DESC`，`created_at` 正是那种"天天拿来排序"的列，这是标准的建索引场景。

那就建。回到 `storage.py` 的 `init_db()`，在建表语句后面再加一句：

```python
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at)")
```

`IF NOT EXISTS` 还是老搭档：第一次启动的时候建，以后跳过。名字 `idx_history_created` 是个惯例写法——`idx_表名_列名`，一眼看得出它是给谁建的。

加完这一行，`init_db()` 的最终样子是这样（`storage.py` 里其余的函数都不用再动）：

```python
def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at)")
    conn.commit()
    conn.close()
```

改完记得让后端重启一次，索引才会真的建出来。

**建完去看一眼。** 用 DB Browser 打开 `history.db`，在 Database Structure 那一栏展开——`history` 表下面多了个 **Indices**，`idx_history_created` 就挂在那儿。6.4 我们讲了半天"在正表旁边，多存一份按时间排好序的目录"，那时候它只是个比喻；现在，**它是一个你能点开、能看见的东西了**。

不过我们这张表目前数据量不大， 全表扫一遍比眨眼还快，所以建了之后无法察觉速度的提升，甚至SQLite 的优化器可能压根不会用这个索引，因为走索引还得再回表拿数据，还不如直接扫。索引真正开始省时间，得是几十万、几百万条的时候。

我们建这个索引主要是为了让大家感受如何为一个表创建索引。但是 6.4 那条原则不能忘，我们应该**只给经常排序、经常筛选的列建索引，别每个字段都建**。一张表挂十几个索引的事真有人干，查是快了点，但写的时候能慢到让人受不了。

---

## 还差一步：让历史“分到每个人”

存储层升级完成，历史稳稳落进了 `history.db`。但它现在还是**全站一份**——所有访客的记录混在一张表里，`/api/history` 查的是所有用户的记录。

下一节我们会讲如何通过会话**让每个访客只看到自己的记录**。

---

[← 上一节：模块 6.4 数据库正传](/zero-to-fullstack/lessons/module-6-4/) | [下一节：模块 6.6 会话 →](/zero-to-fullstack/lessons/module-6-6/)
