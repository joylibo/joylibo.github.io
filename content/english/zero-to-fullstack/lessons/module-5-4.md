---
title: "模块 5.4：从手搓到框架，FastAPI 登场"
meta_title: ""
description: "后端第四课：认识 Flask / Django / FastAPI 三个主流后端框架，弄清 FastAPI 与 uvicorn 的分工；把 5.3 手搓的 GET /api/profile 用 FastAPI 重写成几行，先用 uvicorn 手动挡跑通再换官网同款 fastapi dev；见识 /docs 自动接口文档，用 BaseModel 声明请求体加一个 POST /api/analyze，亲眼看到自动校验（422）与读 traceback 的两步法，最后用 pip freeze 更新依赖清单。"
date: 2026-07-23T00:00:00+08:00
image: "/images/module-5-4.webp"
categories: ["API与后端"]
tags: ["FastAPI", "uvicorn", "API", "后端", "Python", "pydantic", "框架", "全栈"]
weight: 22
draft: false
---

> 认识几个主流后端框架，以及 FastAPI 和 uvicorn 各自负责什么。然后把手搓的接口重写一遍，再顺手加一个 POST

---

## 那些杂活，每个后端都一样

上一节我们手搓了一个 API，也切身体会到它并不轻松。为了把一段 JSON 发出去，我们手写了路由判断、状态码、两行响应头、`dumps`、`encode`、404 兜底……而这才一个接口，还只是 GET。

今天我们开始学一个后端框架。HTTP 的这些事儿，用了框架就会变得轻松很多。

框架这个词我们已经不陌生了。讲 React 的时候我们就说过：**框架，就是管某一摊事的一套规则**——React 管的是“UI 组件”这一摊。后端框架管的则是另一摊：**接住请求、解析内容、把响应发回去**。我们只需要按照框架的规则填上真正关注的部分——“这个路径，该返回什么数据”。

---

## 认识几个主流后端框架

Python 的后端框架不止一个：

- **Flask**——老牌、轻量，长期的入门经典，生态成熟；
- **Django**——“大而全”，自带后台管理界面、用户系统，还有一套操作数据库的 ORM 工具，很多常用功能都有现成方案，适合直接开发大型网站；
- **FastAPI**——最年轻的一个，专为写 API 而生：样板代码极少、**自动生成接口文档**，而且我们把字段和类型写清楚，它就能自动帮我们解析和校验。

我们这门课选 **FastAPI**。主要有三个理由：代码少、类型校验的反馈直接、自动生成接口文档。对于一个以 API 为主、希望快速获得这些能力的 Python 新项目，FastAPI 是很合适的选择。

另外顺带推荐一下：FastAPI [官网的 User Guide](https://fastapi.tiangolo.com/tutorial/) 写得特别好，不光讲“是什么、怎么用”，还常常讲“为什么”，几乎可以当成一份手把手教程来读，对中文的支持也不错；文档里的 [About](https://fastapi.tiangolo.com/alternatives/) 还专门对比了 Flask、Django 等框架，值得一读。想深入学 FastAPI，官网就是最好的教材。

> 和 4.3 选 React 时说的一样：**框架之间的概念是相通的**。把 FastAPI 用明白了，回头看 Flask、看 Django，都是熟面孔。

---

## 两个角色：FastAPI 和 uvicorn

上一节的 `main.py` 其实同时干了两类工作：

1. 判断路径、组织响应，决定“收到这个请求后返回什么”；
2. 用 `HTTPServer(...)` 和 `serve_forever()` 守住 8000 端口，一直等待请求。

用了 FastAPI 之后，这两类工作交给两个工具分工：

| 5.3 手搓版的职责                          | 现在由谁负责                    |
| ----------------------------------- | ------------------------- |
| `if self.path == ...`、组织响应          | **FastAPI**——负责定义接口       |
| `HTTPServer(...)`、`serve_forever()` | **uvicorn**——负责运行服务器、监听端口 |

所以，**FastAPI 负责“接口该做什么”，uvicorn 负责“让接口跑起来”**。FastAPI 自己不会守着端口等请求；uvicorn 收到请求后，会把它交给 FastAPI 处理。

一会儿我们会**先亲手指挥一次 uvicorn**，把它的命令认清楚；然后再换官网的快捷命令 `fastapi dev`。这样以后在别处教程或报错里遇到 uvicorn 这个名字，就都不陌生了。

## 把 FastAPI 装进来

FastAPI 是第三方包。“装第三方包”这套动作，**5.2 我们已经完整走过一遍了**（那次装的是 `requests`）——pip 装、落进 `.venv`，这次只是换了包名。安装命令用**官网教程的同款**：

先确认自己在 `(zero-to-tech)` 环境里（**装包前先看提示符**，5.2 的老规矩）：

```bash
cd ~/zero-to-tech/backend
source .venv/bin/activate      # 若提示符没带括号
pip install "fastapi[standard]"
```

包名后面的方括号是 pip 的“套餐”写法：`fastapi[standard]` = FastAPI 本体 ＋ 官方推荐的一套标准配件。装完 `pip list` 看一眼，列表一长串——**刚认识的 uvicorn 就在里面**（它就是随这个套餐装进来的），还有 `starlette`、`pydantic`、`fastapi-cli` 等一串我们没点名的包：**依赖还有依赖**，5.2 装 requests 时也见过这现象。

---

## 用 FastAPI 重写 `/api/profile`

铺垫结束，正主登场。先把手搓版留作纪念：

```bash
mv main.py handmade.py
```

新建 `main.py`，写 FastAPI 版：

```python
from fastapi import FastAPI

app = FastAPI()

profile = {
    "heroTitle": "关于我",
    "heroSubtitle": "项目，创意，灵感，心得，我的作品",
}

@app.get("/api/profile")
def get_profile():
    return profile
```

**没了。这就是全部。**

`@app.get("/api/profile")` 这行是一个新面孔（叫“装饰器”）——和 5.3 的 `class` 一样，我们**不用学会它**，读懂意思就行：**“`/api/profile` 这个路径的 GET 请求，交给下面这个函数处理。”**

拿它和 `handmade.py` 对一对，上一节的杂活都去哪了：

| 手搓版（5.3 亲手写的）                      | FastAPI 版                 |
| ---------------------------------- | ------------------------- |
| `if self.path == ...` 路由判断         | `@app.get(...)` 一行装饰器     |
| `send_response(200)`               | 自动                        |
| `send_header("Content-Type", ...)` | 自动设置 JSON 响应的类型           |
| `json.dumps(...).encode(...)`      | 自动把返回的 Python 字典序列化为 JSON |
| `else` 兜底 404                      | 自动（没定义的路径，自动回 404）        |

---

## 跑起来：先用 uvicorn「手动挡」

启动之前，先确认 5.3 的手搓服务已经 `Ctrl + C` 停掉了——**一个端口，同一时间只能由一个程序守着**（还记得模块 2 讲的端口吗）。要是忘了停，下面这条命令会报 `Address already in use`（地址已被占用）——认得这个报错，以后一见到就知道：是端口被别的程序占着呢。

先直接指挥 uvicorn：

```bash
uvicorn main:app --reload
```

`main:app` 可以拆开看：

```text
main : app
文件   变量
```

意思是：让 uvicorn 去找 `main.py` 文件里的 `app`（这里不写 `.py`）。`--reload` 是**改代码自动重启**——我们在前端早就享受过这待遇（`npm run dev` 改代码即时生效），这是后端的同款，开发时开着它，就不用像 5.3 那样每改一次手动 `Ctrl+C` 重启了。

服务跑起来了——uvicorn 守着 8000 端口，把收到的请求交给 `main.py` 里的 `app`。两个角色，就这样接上了头。

## 换官网的快捷命令：fastapi dev

`Ctrl + C` 停掉，再用官网教程的写法跑一遍——注意这次连文件名都不用写：

```bash
fastapi dev
```

启动输出里有几行值得认一认：

```text
FastAPI   Starting development server 🚀
 server   Server started at http://127.0.0.1:8000
 server   Documentation at http://127.0.0.1:8000/docs
    tip   Running in development mode, for production use: fastapi run
   INFO   Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

- 最后一行：**`Uvicorn running`——刚才我们亲手指挥过的 uvicorn，就在这**。`fastapi dev` 干的事，就是替我们把 uvicorn 跑起来：`dev` 是开发模式，等于帮我们带上了 `--reload`；连文件名都不用写——它默认就去找 `main.py`，连 `main:app` 这种写法都省了。
- `tip` 那行说：正式上线用 `fastapi run`（不带自动重启）——到部署的时候我们会再见到它。
- `Documentation` 那行，先卖个关子，一会儿揭晓。

**两条命令都能用，干的是同一件事。** 这门课以后统一用 `fastapi dev` 这种写法——更简洁，也和官网文档一致；在别处教程里见到 `uvicorn main:app --reload`，认得出它是“手动挡”就行。

验证（新开一个终端）：

```bash
curl http://localhost:8000/api/profile
```

和手搓版一模一样的 JSON。

接着再故意访问一个不存在的路径：

```bash
curl http://localhost:8000/nope
```

回来的是 `{"detail":"Not Found"}`——**404 我们一行都没写**，而且它连 404 都带着 JSON 格式的说明，比我们手搓的空 404 还周到。

### 目录里多了一个东西

接口跑通之后，回到 `backend` 目录看一眼：

```bash
ls
```

会发现多出来了一个目录：`__pycache__/`。再看看里面：

```bash
ls __pycache__
```

里面是 Python 运行代码时自动生成的缓存文件。它能让 Python 下次加载代码时更快一点；删掉也没关系，运行代码时还会重新生成。

既然它不是我们亲手写的源码、随时可以重新生成，就和 `.venv`、`node_modules` 一样，**不应该进 Git**。在项目的 `.gitignore` 里加上：

```text
__pycache__/
*.py[cod]
```

第一行忽略所有层级的 `__pycache__` 目录；第二行忽略项目各处的 `.pyc`、`.pyo`、`.pyd` 这几类 Python 生成文件。

### 惊喜：我们的 API 自己长出了文档

浏览器打开：

```text
http://localhost:8000/docs
```

一个**接口文档页面**，列着我们的 `/api/profile`。展开它，依次点击 **Try it out** 和 **Execute**，页面会真的调用一次接口。留意其中的 Request URL、Response body 和 Response code——请求地址、响应内容、状态码都替我们摆好了。

回想 5.1：我们是**照着 DeepSeek 的文档**学会调用它的 API 的——文档是 API 的说明书。而现在，**我们的 API 的说明书，是 FastAPI 自动替我们写的**，代码一改，文档跟着变。这就是“框架把通用的事全包了”的又一个例子。

> 如果 `/docs` 打开是一片空白：多半是网络问题——这个文档页面的样式和脚本，默认从公共 CDN 加载，国内网络偶尔抽风。刷新几次或换个网络通常就好；接口本身不受任何影响。

---

## 加一个 POST 接口：`/api/analyze`

还差文字实验室要用的那个接口：**提交一段文字，返回分析结果**。“提交内容”——5.1 认过脸的，这就是 **POST**。

### 先把需求说清楚：一来一回长什么样

动手之前，先把这一来一回的数据形状定下来——5.1 说过，**API 是一份约定**，写接口的第一步就是把约定说清楚：

**调用方提交什么？** 要分析的那段文字。请求体只需要一个字段：

```json
{ "text": "今天的风很轻" }
```

**我们回什么？** 分析结果。具体一点：文字实验室的结果卡上有四个位置——原文、拼音、分数、情感标签——**约定的形状，来自调用方的需要**。不过真正的分析（拼音、情感分数）要等模块 6 用第三方库来做，今天先把接口的形状立起来：原文照抄回去，其余三个先写死占位：

```json
{
  "text": "今天的风很轻",
  "score": 0.5,
  "label": "偏平静",
  "pinyin": "（模块 6 再说）"
}
```

形状定了，“里面怎么算”以后随时可以换——这也是 5.1 那句话的提供方视角：**约定不变，实现随便换**。

5.3 我们刻意没有手搓 POST 接口，因为它要做的杂活更多：自己读 `Content-Length`、自己收字节、自己解析 JSON、自己校验字段全不全……看看 FastAPI 怎么处理。

### 动手：三步写完

这个接口一共改三处。先一口气把它们敲完，写完再回头讲每一步的意思。

**第一步**，在 `main.py` 顶部的 import 区加一行：

```python
from pydantic import BaseModel
```

**第二步**，在 `profile` 后面加一段请求体的声明：

```python
class AnalyzeRequest(BaseModel):
    text: str
```

**第三步**，在文件末尾加上接口本身：

```python
@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    return {
        "text": req.text,
        "score": 0.5,
        "label": "偏平静",
        "pinyin": "（模块 6 再说）",
    }
```

三步写完，完整的 `main.py` 是这样，核对一下：

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

profile = {
    "heroTitle": "关于我",
    "heroSubtitle": "项目，创意，灵感，心得，我的作品",
}

class AnalyzeRequest(BaseModel):
    text: str

@app.get("/api/profile")
def get_profile():
    return profile

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    return {
        "text": req.text,
        "score": 0.5,
        "label": "偏平静",
        "pinyin": "（模块 6 再说）",
    }
```

### 回头看：这三步在干嘛

**第一步的 `BaseModel`** 是新面孔——它来自 **pydantic**，`pip list` 里见过的那个包，FastAPI 的老搭档，专门管**数据的解析和校验**。`BaseModel` 是它提供的“数据模型”基类：继承它，就能声明“某一类数据长什么样”。

**第二步的 `class AnalyzeRequest(BaseModel)`**，正是用它把刚才定好的请求形状写了下来：这类请求的请求体里，必须有一个 `text` 字段，而且是字符串。注意，这不是在处理请求，而是在**声明请求应该长什么样**。

**第三步的接口**，`@app.post` 和 `@app.get` 是同一个思路：`/api/analyze` 的 POST 请求，交给下面这个函数。关键在参数 `req: AnalyzeRequest`——FastAPI 一看到这份声明，就自动完成了手搓时代最狼狈的全部动作：收字节、解析 JSON、校验字段、转成好用的对象。所以函数里直接 `req.text` 就能拿到调用方提交的文字，返回的正是刚才定好的响应形状：原文，加三个写死的占位值。

| 我们写的声明                | FastAPI 自动完成         |
| --------------------- | -------------------- |
| `text`                | 要求请求体里有这个字段          |
| `: str`               | 要求这个字段是字符串           |
| `req: AnalyzeRequest` | 从 JSON 请求体解析出一个好用的对象 |
| （如果字段缺失或类型不对）         | 返回校验错误               |

那份声明的威力，马上就见分晓。

保存（开发模式已自动重启），测试：

```bash
curl http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "今天的风很轻，适合把想法写下来"}'
```

回来的正是我们定好的形状：原文，加三个写死的占位值。

**这条命令眼熟吗？** `-H "Content-Type: application/json"`、`-d '{...}'`——方法我们压根没写，是 `-d` 自动把它发成了 POST（5.3 讲过的规矩）。**和我们用 curl 调 DeepSeek 那条，形状一模一样**。那时我们是调用方，看不见对面；现在，**我们自己就是“对面”**。

我们再故意发一个错的——字段名写错。这次加上 `-i`，让 curl 把响应头和状态码也显示出来：

```bash
curl -i http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"txt": "字段名写错了"}'
```

先看第一行：`HTTP/1.1 422 Unprocessable Entity`。下面的 JSON 里明明白白指出：缺 `text` 字段。**校验代码我们一行没写。**

再回到 `/docs` 刷新一下：`/api/analyze` 已经自动出现了，展开后还能看到请求体必须有一个字符串类型的 `text`。代码里的声明，不但带来了自动校验，也自动变成了文档。

> 再强调一次：`score`、`label`、`pinyin` 现在都是**写死的占位值**，这个接口今天只负责把“形状”立住。真正的拼音和情感分数，模块 6 会用第三方库换成真的。到时候我们还会亲眼看到 API 的一个好处：**内部实现整个换掉，接口不变，调用方毫无感觉。**

---

## 最后一件事：报错了怎么看

后端阶段的最后一项生存技能。我们故意制造一个 bug——把 `analyze` 里的 `req.text` 少写一个字母，改成 `req.txt`：

```python
        "text": req.txt,   # 故意写错
```

保存，再用刚才那份正确的请求调用一次，同样加上 `-i`：

```bash
curl -i http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "测试"}'
```

第一行是 `HTTP/1.1 500 Internal Server Error`。

**5xx，服务方的问题**——这次，真的是我们的问题。有意思的是：刚才调用方把字段名写错成 `txt`，得到的是 422；现在同一个手误发生在我们自己的代码里，变成了 500——**谁的错，状态码分得清清楚楚**。

再看服务端终端：这一次请求失败了，但服务进程并没有退出，修好之后还能继续接收请求。终端里打出了一大段红字，这就是 **traceback（错误回溯）**。读终端报错有固定套路：

1. **先看最后一行**：`AttributeError: 'AnalyzeRequest' object has no attribute 'txt'`——错误类型和原因，一句话：`AnalyzeRequest` 身上没有 `txt` 这个东西；
2. **再往上找自己的文件**：`File ".../main.py", line XX`——这里会显示实际出错的文件和行号。每个人代码里的空行可能不同，所以看到的数字不一定一样。

两步定位，改回 `req.text`，保存，恢复正常。

> **报错不是事故，是线索**——最后一行说“是什么错”，上面几行说“在哪儿”。实在读不懂，整段复制丢给 AI，它读 traceback 比谁都熟练。从今往后，见到红字先别关终端，先看最后一行。

---

## 收尾：把依赖清单更新好

现在两个接口都写完、依赖也确定了，最后把今天装的东西记到 `requirements.txt` 的账上。5.2 建的 `requirements.txt` 里原本只有 `requests`，重新生成一次：

```bash
pip freeze > requirements.txt
cat requirements.txt
```

`fastapi`、`uvicorn`，连同 `starlette`、`pydantic` 等一整套，都进清单了——`[standard]` 套餐记的账，比 5.2 那份长了一大截。`.venv` 和 `__pycache__` 不进 Git，但 `requirements.txt` 要跟着代码一起进 Git——别人才能照着它重建出同样的环境。

---

## 这一节应该带走什么

- **框架 = 把每个后端都要干的杂活打包复用**；我们手搓过一遍，所以确切知道 FastAPI 替我们干了什么。
- 主流后端框架认脸：Flask / Django / **FastAPI**——概念相通。
- **FastAPI 管定义接口，uvicorn 管运行服务器**；安装用官网同款 `pip install "fastapi[standard]"`。启动两条命令都行：`uvicorn main:app --reload` 是手动挡，`fastapi dev` 替我们把 uvicorn 跑起来——以后统一用后者，更简洁。
- Python 运行后自动生成的 `__pycache__` 是可重建的缓存，所以要补进 `.gitignore`；最终用 `pip freeze` 更新依赖清单。
- `/docs` 自动接口文档——我们的 API 自己长出了说明书。
- 写接口先定约定：请求体、响应各长什么样；POST 的解析和校验，靠一个 `BaseModel`（pydantic 的数据模型基类）声明全自动完成；`/api/analyze` 返回的分析值目前全是写死的占位，模块 6 换真的。
- **读报错先看最后一行**，再往上找自己文件的行号；读不懂就丢给 AI。

下一节，前端后端正式握手：让网页真的来调用这两个接口。

---

[← 上一节：模块 5.3 看懂 HTTP，手搓 API](/zero-to-fullstack/lessons/module-5-3/) | [下一节：模块 5.5 前后端联调与 CORS →](/zero-to-fullstack/lessons/module-5-5/)
