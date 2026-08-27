---
title: "模块 5.5：前后端联调与 CORS"
meta_title: ""
description: "让 React 与 FastAPI 真正连起来，并解决跨域带来的问题。"
date: 2026-07-28T00:00:00+08:00
image: "/images/module-5-5.webp"
categories: ["API与后端"]
tags: ["CORS", "跨源", "前后端联调", "OPTIONS 预检", "CORSMiddleware", "FastAPI", "环境变量", "后端", "全栈"]
weight: 23
draft: false
---

> 这一节让前端和后端真正握上手。走通“输入 → 请求 → 后端计算 → 响应 → 界面更新”的完整链路，并在路上认识浏览器的一道安全规则：CORS。

---

## 这一节要完成什么

这一节结束时：

- **主页**的标题、副标题、作品和座右铭，会来自 `GET /api/profile`；
- **文字实验室**里输入一段文字、点击“开始分析”，结果区会显示 `POST /api/analyze` 返回的结果；
- 认识并解决跨源限制 **CORS**，顺带看清 **OPTIONS 预检**；
- 把散落在代码里的后端地址，收进配置文件。

还记得 4.4 讲“数据与界面分离”时埋的那颗种子吗？当时 `site.js` 里的内容都是写死的，我们说过，它们以后可以从网络接口获取。今天就是兑现这句话的日子。

先把两边都跑起来。需要两个终端：

```bash
# 终端 1：后端
cd ~/zero-to-tech/backend
source .venv/bin/activate
fastapi dev                      # → http://localhost:8000

# 终端 2：前端
cd ~/zero-to-tech
npm run dev                      # → http://localhost:3000
```

一台电脑，两个一直运行的程序：**3000 是前端，8000 是后端**。

---

## 先让后端数据与前端约定一致

正式连接之前，先确认两边说的是同一种“数据语言”。

现在前端 `data/site.js` 里的 `home` 不只有标题和副标题，还有作品与身份信息；但 5.4 的 `/api/profile` 只返回了标题和副标题两个字段——当时我们说过，重点先放在 HTTP 和框架上，数据结构等前端真的来调时再对齐。这一刻到了：如果前端组件按照原来的结构取 `featuredWork.title`，后端却没有返回 `featuredWork`，两边就对不上了。

这就是 5.1 说的：**API 是调用方和被调用方之间的一份约定。** 当前 `/api/profile` 返回的字段还不满足前端的需要，所以先改后端，把 `profile` 补成和 `site.js` 的 `home` 同构。为了等会儿一眼看出数据是否真的来自后端，先在标题后面临时加一个明显的标记：（来自后端）：

```python
profile = {
    "heroTitle": "关于我（来自后端）",  # → 临时加的标记，验证完删掉
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
```

保存后，先用 curl 确认后端这边正常：

```bash
curl http://localhost:8000/api/profile
```

能看到完整 JSON 和“来自后端”的标记，说明接口本身没有问题。

---

## 用现成的前端代码替换

后端准备好了，轮到前端。这一节前端要改的地方不少：主页要改成向后端请求数据，文字实验室的输入卡和结果卡也要接上接口。这些都是很常规的“取数据、发请求”写法，而这一节真正的重点是**联调**——请求为什么不通、怎么排查。所以这里不逐行讲前端代码，直接用改好的版本替换。

改好的代码放在课程的 GitHub 仓库 [`zero-to-tech-demos`](https://github.com/joylibo/zero-to-tech-demos) 里。克隆下来，用 `zero-to-tech-5-5/` 里的文件覆盖项目中的同名文件：

```bash
git clone https://github.com/joylibo/zero-to-tech-demos.git
cp zero-to-tech-demos/zero-to-tech-5-5/components/*.jsx  ~/zero-to-tech/components/
cp zero-to-tech-demos/zero-to-tech-5-5/css/lab.css       ~/zero-to-tech/css/
```

替换了哪些文件、各自做了什么，对照一下即可，不必抠语法：

| 文件 | 改动 |
| --- | --- |
| `HomeView.jsx` | 变成客户端组件；打开页面先用 `site.js` 的数据打底，再去 `GET /api/profile`，拿到后端数据后更新界面 |
| `TextLabView.jsx` | 变成客户端组件；把“分析结果”这份状态提升到这里，分别下发给输入卡和结果卡（4.4 学过的“状态提升”）|
| `InputCard.jsx` | 点“开始分析”时，把文字 `POST` 给 `/api/analyze` |
| `ResultCard.jsx` | 改成显示父组件传来的结果，还没有结果时用一份默认占位 |
| `css/lab.css` | 新增一条 `.lab-error` 样式，用于请求失败时的提示 |

有几点先记下来：

- 因为要在浏览器里发请求，`HomeView`、`InputCard` 这些组件顶部都加了 `"use client"`，成了客户端组件——这个概念 4.5 讲 Next.js 时提过，这里不展开。
- 这些组件里，后端地址 `http://localhost:8000` 都是**直接写死**的。现在能跑，但并不理想，这一节最后会把它收进配置文件。
- 请求失败时（后端没跑、跨源被拦等），代码用 `try/catch` 做了基本兜底：主页失败就保持 `site.js` 的打底数据，输入卡失败就在按钮上方给一行提示，界面不会无声崩掉。这属于常规的错误处理，不是本节重点，就不展开讲了。

替换完，保存，打开 `http://localhost:3000`。

按理说，主页大标题应该变成后端返回的“关于我（来自后端）”。但页面上仍然是原来的“关于我”。前端代码是现成的、后端也用 curl 验证过，为什么网页没有拿到数据？

先不要急着改代码。真正的联调，往往就是从这种“结果与预期不一致”开始的。

---

## 第一次撞墙：顺着线索排查

遇到这种情况，不要盯着代码猜，先弄清楚这次请求走到哪一步断的。

一次请求会在三个地方留下线索。按数据流动的顺序，从发出请求的这一头开始，一站一站往下看，每一站回答一个问题：

| 看哪里 | 回答什么问题 |
| --- | --- |
| 浏览器 Network | 请求发出去了吗？ |
| 后端终端 | 后端收到了吗？又是怎么处理的？ |
| 浏览器 Console | 结果为什么没有交到我们的代码手里？ |

### 第一站：浏览器 Network

打开浏览器开发者工具，切到 **Network**，刷新页面，找到 `/api/profile`。请求确实存在——说明它发出去了，不是那段 `fetch` 代码根本没执行。

> 开发环境里如果看到两条相同的 GET，也不用慌。Next.js 的 App Router 默认开启 React 严格模式，开发时会多执行一次 Effect 来帮忙检查副作用；正式构建不会因为这个检查多发一次。

第一个问题有了答案：请求发出去了。那它到没到后端？

### 第二站：后端终端

回到运行后端的终端，可以看到类似：

```text
GET /api/profile HTTP/1.1 200 OK
```

这一行说明两件事：请求已经到达后端，而且后端处理完并返回了 200——在后端看来，这次请求是成功的。

到这里就有点奇怪了：请求发出去了，后端也收到并成功返回了，页面上却没有数据。东西已经送到门口，是谁把它扣下的？

### 第三站：浏览器 Console

切到 **Console**，会看到一段红字：

```text
Access to fetch at 'http://localhost:8000/api/profile'
from origin 'http://localhost:3000'
has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present...
```

把三站的线索连起来看，会发现一个很有意思的现象：

- Network 里能看到请求，说明发出去了；
- 后端日志显示 GET 返回 200，说明收到了也处理成功了；
- 之前用 curl 也能拿到完整 JSON；
- 但网页 JavaScript 仍然拿不到结果。

问题不在接口有没有运行，也不在路径写错，而在浏览器提到的 **CORS**。

---

## CORS 到底拦了什么

**CORS**，中文叫“跨源资源共享”，是浏览器对网页 JavaScript 的一条安全规则。

### 什么叫“跨源”

一个“源”由三部分组成：

```text
协议 + 域名 + 端口
```

任何一项不同，就是不同的源。我们的前端是 `http://localhost:3000`，后端是 `http://localhost:8000`：协议相同、域名相同，但端口不同，所以它们是两个源。网页脚本从 3000 去访问 8000，就是跨源。

### 请求其实已经到达了后端

对刚才这个简单 GET 来说，浏览器已经把请求发给了后端，后端也返回了 200。CORS 拦下的不是“请求到达服务器”，而是：

> **浏览器不允许当前网页的 JavaScript 读取这份未经授权的跨源响应。**

这也解释了为什么 curl 一直畅通无阻：CORS 是浏览器对网页脚本的规则，curl 不是网页，不受这条规则约束。

### 浏览器怎样询问，后端怎样回答

网页发起跨源请求时，浏览器会自动带上：

```text
Origin: http://localhost:3000
```

意思是“这段网页脚本来自哪里”。后端如果愿意让这个来源读取响应，就在响应头里给出：

```text
Access-Control-Allow-Origin: http://localhost:3000
```

这就是后端的许可。请求里说明来源，响应里给出许可；浏览器看到两边对得上，才把响应交给网页 JavaScript。

---

## 给 FastAPI 加上 CORS

要让网页读到响应，就得让后端在响应里带上那行 `Access-Control-Allow-Origin`。我们有两个接口，与其给每个接口都手写响应头，不如用一个现成的**中间件**统一处理。中间件是加在“请求进入、响应离开”必经之路上的一层处理，所有请求和响应都会过它一道。

打开 `backend/main.py`，顶部增加 import：

```python
from fastapi.middleware.cors import CORSMiddleware
```

紧跟在 `app = FastAPI()` 后面增加：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
)
```

`allow_origins` 就是控制 `Access-Control-Allow-Origin` 这行响应头的开关。把前端地址 `http://localhost:3000` 填进去，后端就认这个来源。

中间件还有别的参数，但眼下这个 GET 只差“来源许可”这一项，先加这一行就够；其余等真正遇到问题再补。

保存后，后端自动重启。刷新主页——标题变成了“关于我（来自后端）”，数据终于从 8000 端口流到了 3000 端口的网页。

再看 Network 里的 `/api/profile`，Response Headers 多了一行：

```text
access-control-allow-origin: http://localhost:3000
```

这就是后端发的许可。确认成功后，可以把标题里的“（来自后端）”删掉，恢复正常文案；以后想验证数据是否来自后端，也可以临时改一个字段再刷新页面观察。

---

## 第二次撞墙：POST 被预检拦下

主页的 GET 通了。接下来试文字实验室的 `POST /api/analyze`：这个接口 5.4 已经写好，前端也替换好了，看起来一切就绪。

打开文字实验室，输入一段文字，点击“开始分析”——界面上冒出一行红字：`Failed to fetch`。又撞墙了。

这个提示很笼统，只说“请求失败了”，没说为什么。于是还是老规矩，去现场找线索。

打开 Network，会发现这次和上次不同：我们只点了一次“分析”，列表里却出现了一条**从没写过**的 `OPTIONS` 请求，而且它失败了；真正想发的那条 `POST` 反而没有出现。

```text
OPTIONS /api/analyze     ← 失败
（没有 POST）
```

再看 Console：

```text
...has been blocked by CORS policy:
Method POST is not allowed by Access-Control-Allow-Methods in preflight response.
```

又是 CORS，但和第一堵墙不一样：第一次是请求发出去了、响应被拦回来；这次那条 `POST` 根本没发出去，被这个 `OPTIONS` 挡在了前面。

### 这个 OPTIONS 是浏览器自动发的

它有个专门的名字，叫 **CORS 预检（preflight）**。5.3 认识 HTTP 方法时，OPTIONS 混过一次脸熟——“我能对这个资源做什么”，现在派上了用场。

要点先说清楚：这个 OPTIONS **不是我们写的**，也不是 Next.js 或 React 的功能，而是**浏览器自动发的**，属于 CORS 规则的一部分。这也解释了为什么之前用 curl 从没见过它——curl 不是浏览器，不受 CORS 约束。

为什么第一个 GET 没有预检、这个 POST 却有？因为浏览器把跨源请求分成两类。像主页那个 GET，方法普通、也没带特别的头，属于**简单请求**，浏览器直接发，顶多事后拦下响应不给脚本读。而这次的 POST 带了 `Content-Type: application/json`，就成了**不简单**的请求；对这种请求，浏览器会先发一个 OPTIONS 去问后端：允许这个来源吗？允许 POST 吗？允许带这个请求头吗？——预检通过，才发真正的 POST；不通过，POST 根本不会离开浏览器。

> 为什么要多这一道？POST 往往会**改动数据**（比如发一条评论、下一个订单之类的）。要是不问就发，即便响应被拦、脚本读不到，这件事也已经在后端做了。预检“先问后发”，把没授权、又可能产生副作用的请求，挡在发送之前。

### 预检问的，正是我们没回答的

预检失败的原因，Console 已经写明：`Method POST is not allowed`。回头看刚才配的中间件，我们只写了 `allow_origins`——只说了“谁能来”，没说“能用什么方法”。预检由 `CORSMiddleware` 自动应答（不需要我们为 OPTIONS 写任何代码），它一查：来源允许，但方法 POST 不在名单里，于是打回。

补上 `allow_methods` 即可：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET", "POST"],
)
```

`allow_methods` 声明这个接口允许被哪些方法跨源调用。项目用到 GET 和 POST，就如实写这两个。

> 预检其实还会问“能不能带某些请求头”，对应参数是 `allow_headers`。我们带的 `Content-Type` 属于浏览器默认放行的常见头，不必专门声明；将来若请求要带不常见的头（比如登录用的 token），才需要在 `allow_headers` 里列出。

保存后端、自动重启，再点一次“开始分析”。这次结果区出来了：原文正是刚提交的文字，还有分数、判断和占位的拼音。换一段文字再点，原文随之改变——每一次结果都真的来自后端。（分数和拼音目前仍是写死、占位的，模块 6 才会真正计算。）

回到 Network 再看，这次是**两条**请求：先一条 `OPTIONS` 预检（这次通过），紧接一条真正的 `POST`。这就是“先问后发”走通后的样子。

### 同一个 CORS，两副面孔

至此见到了 CORS 的两种场景：

- 简单 GET 已经到达后端，但没有许可时，网页不能读取响应；
- 带 JSON 的 POST 会先发 OPTIONS 预检，通过后才发送真正的 POST。

---

## 最后一步：把写死的地址收进配置

GET 和 POST 现在都正常了，但还留着一个前面提过的小尾巴：前端代码里，后端地址是写死的。用 VS Code 全局搜索：

```text
http://localhost:8000
```

会在 `HomeView.jsx` 和 `InputCard.jsx` 里各找到一次。

一个很现实的问题是：这个地址是会变的。后端换个端口、项目挪到另一台机器、以后要部署到线上——每一种情况，这个地址都得跟着改。现在只有两处，改起来还不费事；可组件一旦多起来，同一个地址散落在十几个文件里，每变一次都要满项目搜索替换，漏掉一处，就是一个特别难找的联调 bug。

再往深一层看：一个地址该填什么，取决于代码跑在哪个环境——开发机、测试机、线上服务器各不相同。这种跟运行环境绑定的值，本就不该写死进组件，让业务代码为了换个环境反复改动。

这说明后端地址不属于组件的业务逻辑，而是一项**配置**。配置应该集中管理。

> 你可能会问：后端 `allow_origins` 里那个 `http://localhost:3000`，不也是把地址写死在代码里了吗？没错，它同样是一个跟环境绑定的配置值，正式项目里也该从配置读取。道理是对称的——这一节先拿前端这一侧当例子，把“地址属于配置”讲透；后端这类配置，留到部署那一节一起处理。

### 创建 `.env.local`

在前端项目根目录，也就是 `package.json` 所在的目录，新建 `.env.local`：

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`NEXT_PUBLIC_` 前缀表示这个值可以进入浏览器代码。正因为如此，它只能放后端地址这类**可以公开**的配置，**不能放 API 密钥、密码等秘密信息**——那些会被打包进浏览器，等于公开。

在两个组件的 import 下方都增加：

```javascript
const API = process.env.NEXT_PUBLIC_API_BASE_URL;
```

然后把硬编码地址分别改成：

```javascript
fetch(`${API}/api/profile`)
```

和：

```javascript
fetch(`${API}/api/analyze`, {
```

### 创建或修改环境变量后，要重启前端

`.env.local` 是在开发服务器启动时读取的，光保存文件还不够，必须重启：

```bash
# 按 Ctrl + C 停止原来的开发服务器
npm run dev
```

重启后，再分别验证主页 GET 和文字实验室 POST，应该一切正常。

项目的 `.gitignore` 已经包含 `.env*`，所以 `.env.local` 默认不会进入 Git。为什么环境配置通常不直接提交、部署时又怎样提供真实地址，等真正部署后端时再具体处理。

---

## 见证：网站真正活了

现在把这次POST请求的完整链路再看一遍：

```text
输入文字
→ 浏览器发送 POST
→ OPTIONS 预检通过
→ FastAPI 接收并校验请求体
→ Python 计算结果
→ FastAPI 返回 JSON
→ 前端拿到 JSON、更新界面
→ 结果区自动刷新
```

从模块 3 那个双击打开的静态页面，到今天——浏览器里运行着 React，电脑上运行着 Python，中间通过真实的 HTTP 请求交换数据。整条链路是我们自己搭起来的。

主页这类编辑型内容，其实继续留在 `site.js` 完全没问题。把它接到 GET，主要是为了用最简单的数据学习第一次前后端联调。真正非后端不可的，是 `/api/analyze` 这种需要根据用户输入实时计算的功能。

---

## 模块 5 收官

回头看这五节走过的路：

- **5.1**——亲手调用真实 API，理解调用方、被调用方和接口约定；
- **5.2**——安装 Python、建立 venv，用 pip 和 requirements 管理依赖；
- **5.3**——零依赖手搓 API，看清 HTTP 的请求与响应；
- **5.4**——用 FastAPI 重写接口，体验路由、校验和自动文档；
- **5.5**——让 React 与 Python 真正握手，学会联调排查，认识 CORS 与 OPTIONS 预检，并把配置收进环境变量。

现在还有两个明显的欠账：

1. `/api/analyze` 的拼音是占位符，情感分数也只是写死的固定值，还不是真正的分析；
2. 每次分析结果用完就丢，没有历史记录。

下一个模块，我们会使用 Python 生态里的第三方库把分析变成真的，再把结果保存下来。

---

## 这一节应该带走什么

- **联调先找线索，不要看见红字就盲目改代码**：一次请求会在三个地方留下线索，按数据流动的顺序看——浏览器 Network（请求发出去了吗）→ 后端终端（收到了吗、怎么处理的）→ 浏览器 Console（结果为什么没交到我们手里）。
- **CORS 管的是浏览器里的网页脚本能否读取跨源响应**，不是身份验证，也阻止不了 curl；源由协议、域名、端口共同决定。
- **CORS 有两副面孔**：简单跨源 GET 能到达后端，但没有许可网页就读不到响应；带 JSON 的 POST 会先发一个 OPTIONS 预检，通过后才发送真正的 POST。
- **预检是浏览器自动发的**，由 `CORSMiddleware` 应答；`allow_origins` / `allow_methods` 按项目实际需要填写，只放当前用得到的来源和方法。
- **后端地址属于配置**，不应该散落在组件里；公开的前端配置可以放进 `.env.local`，修改后记得重启开发服务器。
- 网站完成了第一次全链路：**输入 → HTTP 请求 → 后端计算 → 响应 → 界面更新**。

下一个模块，我们去领取 Python 生态的红利——让文字实验室真的会分析。

---

[← 上一节：模块 5.4 FastAPI 登场](/zero-to-fullstack/lessons/module-5-4/) | [下一节：模块 6.1 第三方库和 PyPI →](/zero-to-fullstack/lessons/module-6-1/)
