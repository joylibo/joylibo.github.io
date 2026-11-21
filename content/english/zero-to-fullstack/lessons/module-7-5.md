---
title: "模块 7.5：把存储从 SQLite 切换到 PostgreSQL"
meta_title: ""
description: "把已上线的文字实验室从 SQLite 切换到 PostgreSQL 16。先在本地彩排，再在线上迁移历史记录、核对数据并恢复服务。"
date: 2026-11-22T00:00:00+08:00
categories: ["部署与运维上线"]
tags: ["PostgreSQL", "SQLite", "数据迁移", "部署", "FastAPI", "全栈"]
weight: 34
draft: false
---

> 给一个**已经上线、有真实访客数据**的项目做一次存储升级：把 SQLite 换成 PostgreSQL。

**这一节是加餐。** 若是项目继续用 SQLite，零到全栈一样是完整的。但 PostgreSQL 更值得学。

---

## 第一部分：认识 PostgreSQL

ChatGPT 背后，有一个关键的数据库就是 PostgreSQL。

2026 年 1 月，OpenAI 发了一篇工程文章，讲 [怎么用 PostgreSQL 支撑 8 亿 ChatGPT 用户](https://openai.com/zh-Hans-CN/index/scaling-postgresql/)：一个主库负责全部写入，再加上分布在全球各地的近 50 个只读副本，每秒处理数百万次查询。

这不是个例。Stack Overflow 每年都会调查全世界的开发者在用什么技术，PostgreSQL 从 2023 年起，连续四年是用得最多的数据库。2026 年，回答这道题的开发者里，57.9% 在用它。排第二的是 SQLite，42.1%；MySQL 排第三，35.1%。

![Stack Overflow 2026 开发者调查中的数据库使用情况](/images/module-7-5-stackoverflow-databases-2026.svg)

从这里也可以看得出来，SQLite 虽然小，却一点都不弱，它和 PostgreSQL 各有各的位置。

### 它从哪里来

1986 年，加州大学伯克利分校的 Michael Stonebraker 教授带着团队，开始做一个新的数据库研究项目。Stonebraker 之前做过一个数据库叫 Ingres，新项目想在它的基础上更进一步，于是取名 POSTGRES，意思是"Ingres 之后"（post-Ingres）。Stonebraker 后来因为在数据库领域的贡献，拿到了 2014 年的图灵奖，这是计算机领域的最高奖。

最早的 POSTGRES 并不用 SQL。1994 年，Andrew Yu 和 Jolly Chen 给它加上了 SQL，发布时叫 Postgres95。1996 年，它改成了今天的名字 PostgreSQL，名字后面的 SQL 就是这么来的。所以很多时候人们还习惯叫它 Postgres，或者简称 PG。

### 开源的 PG

微软负责 Azure 数据库的副总裁 Shireesh Thota，在 Stack Overflow 的播客里有一句很传神的评价：

> Postgres 是数据库界的 Linux。（原话："Postgres is the Linux of databases."）

这句话有两层含义，一层表达它是开源的（Linux 也是开源的，不属于任何一家公司），另一层表达它很成功（Linux 俨然已经成为服务器操作系统的霸主）。

这就是 PostgreSQL 的基本身世：从大学实验室里走出来，靠社区一点点打磨了 40 年，长成了今天的样子。

### 为什么到现在才火起来

刚才提到，最近四年 PostgreSQL 都是 Stack Overflow 调查里用得最多的数据库。可到 2026 年，它已经 40 岁了。一个软件在接近“不惑之年”时才真正火起来，这并不常见。

前期不温不火，后面扶摇直上，我把原因总结为一句话：一命二运三风水。

**一命（先天命理）：严谨。** PostgreSQL 从一开始就很严谨，类型和约束都查得很严，宁可报错，也不悄悄存进去一个错的值。这种特质有时候是优点有时候是缺点，取决于时代需要什么。1990 年代末到 2000 年代，网站爆发式增长，大家要的是简单、快、好装，严谨反倒显得重、难上手。而后来，网站上越来越多地跑订单、账户这些真金白银的业务，数据错一条都是事故，严谨就成了大家最想要的东西。

**二运（后天运势）：时来运转。** 早年那波浪潮属于 MySQL：当时建网站的标配叫 LAMP，也就是 Linux、Apache、MySQL、PHP 四件套。PostgreSQL 自己的短板也很明显：2005 年的 8.0 版，才第一次原生支持 Windows；2010 年的 9.0 版，才内置了主从复制。

但短板补齐之后，接下来的几波浪潮，它都踩中了：

- **云**：2013 年，亚马逊 AWS 推出了托管的 PostgreSQL 服务，安装、备份、升级都由云厂商负责，"难运维"这道门槛被拆掉了。
- **NoSQL**：2014 年，PostgreSQL 加入了 JSONB，能高效地存取 JSON 数据，把当时正流行的 NoSQL 数据库（比如 MongoDB）擅长的事也揽了过来。
- **AI**：2021 年，pgvector 扩展发布（扩展就是给 PostgreSQL 装的"插件"）。pgvector 让它能存 AI 用的向量、找出意思相近的内容。几年后 AI 应用爆发，这正是最常用的功能之一，做 AI 应用的团队不用为此再引入一个新的数据库，给 PostgreSQL 又添了一把火。

**三风水（环境气场）：风水轮流转。** 早年，MySQL 背后有一家公司在经营和推广，PostgreSQL 只有社区，没有这样一家公司替它吆喝。后来，这一点反了过来：MySQL 先被 Sun 公司买下，2010 年又跟着 Sun 被甲骨文收购，不少人开始担心它的前途。PostgreSQL 没有这种烦恼：它不属于任何一家公司，没人能把它买下来，也没有哪家公司能单独决定它的方向。社区专注技术本身，一年一个大版本，一直不下牌桌，稳定迭代。

这就是PG的命运，它的严谨和开源，早年是包袱，后来成了优势。靠着 JSONB 和各种扩展，让这个关系型数据库能同时把好几种数据库的活一起干了。所以今天很多团队的做法是：先用一个 PostgreSQL，真不够了再加别的。

### 它和 SQLite 区别在哪

PG 和 SQLite 都是关系型数据库，都用 SQL，区别在于：**SQLite 是嵌入式的，PostgreSQL 是服务式的。**

SQLite 就是硬盘上的一个文件，这让它零维护、特别省心，但在真实业务里也会碰到几个天花板：

- **并发写**：SQLite 同一时刻只允许一个写入，多个请求同时写就得排队；
- **独立备份/恢复**：想把数据库单独拎出来备份、做时间点恢复、扩容，一个文件很难精细操作；
- **按身份分权限**：SQLite 没有用户和密码，能读这个文件，就能看到全部数据；想让一个程序只能读、另一个程序能写，就做不到；
- **跨服务器共享**：同一台机器上的多个程序可以访问同一个 SQLite 文件，但它不是"守端口等连接的服务"。如果多台服务器上的程序要通过网络连接同一个数据库，PostgreSQL 这种服务式数据库就更合适。

这几件事，SQLite 做起来很吃力，对 PostgreSQL 来说却是本分。它是一个独立常驻的服务，监听一个端口，同时接待很多个连接。**SQLite 的天花板，却是 PostgreSQL 的地板。**

用 PostgreSQL 的话，我们需要先安装 PostgreSQL，并且安装之后还需要把它运行起来。它可以运行在后端程序的同一台服务器上，也可以安装运行在一台独立的服务器上。默认它会运行在 5432 端口，我们的后端程序通过这个端口号与 PostgreSQL 进行交互。

PostgreSQL这种运行方式让它有了更强的能力，但也有代价。毕竟 SQLite 只是一个文件，程序不用它的时候，它不会额外占内存；PostgreSQL 是常驻服务，**就算没人访问，也一直占着内存**。所以 PostgreSQL 对服务器的内存要求会更高一些。


### 文字实验室需要它吗

**文字实验室这种小项目，SQLite 其实完全够用。** 我们之前选它，就是图它"零维护、单文件、不用养服务"，这个判断今天依然成立。

那为什么还要换？有两个理由。

第一，**PostgreSQL 值得学。** 它是开发者用得最多的数据库，不管是工作还是做自己的项目，大概率都会遇到它。

第二，**为后面的课程打地基。** 这个系列讲完之后，我们打算讲 Docker，到时候部署的就是换成 PostgreSQL 之后的`zero-to-tech`项目。这不是说 SQLite 不能用 Docker，它一样能跑。只是 SQLite 就是一个文件，跟着后端走；而 PostgreSQL 是独立的服务，后端和数据库分开运行、互相连接。这才是真实项目里常见的样子，也更能体现 Docker 的价值。

---

## 第二部分：动手之前，先想清楚

动手之前，有几件事要先想清楚：

- 服务器的内存够不够；
- PostgreSQL 服务和连接工具分别做什么；
- PostgreSQL 的用户和库是怎么回事；
- 线上怎么切换才不丢数据。

### 服务器的内存够不够

PostgreSQL 是常驻服务，会一直占着内存。假设我们不再增购服务器，那么就需要考虑服务器的内存够不够用，能不能跑得起来 PostgreSQL。

我们此前学过的许多东西都需要使用服务器内存，比如后端（uvicorn）、Nginx，这些都是常驻服务，会一直占用部分内存。此外，前端构建（`npm run build`）时还要临时占一大块内存。虽然是临时占用，构建完成后这些内存会被释放，但构建过程中如果内存不够，构建可能卡住不动，也可能被系统直接杀掉（屏幕上只留下一个 `Killed`）。

查看服务器的内存使用情况是一项很实用的运维基本功，以后服务器变慢、程序莫名其妙被杀，第一件事就是看内存。

#### 还剩多少内存

在 Ubuntu 上可以用这个命令看内存情况：

```bash
free -h
```

会得到如下结果（数字只是示例，以自己服务器上的为准）：

```text
               total        used        free      shared  buff/cache   available
Mem:           1.9Gi       820Mi       180Mi       2.0Mi       1.1Gi       1.1Gi
Swap:             0B          0B          0B
```

不同的列含义如下：

| 列          | 含义                       |
| ---------- | ------------------------ |
| total      | 物理内存总量 1.9 GiB           |
| used       | 已用 820 MiB               |
| free       | 完全空闲 180 MiB             |
| shared     | 多个程序共用的内存 2.0 MiB，一般很小，不用管 |
| buff/cache | 内核缓存 1.1 GiB（可回收）        |
| available  | **真正可给新进程用的估算值 1.1 GiB** |

> 为什么买的是一个 2G 内存的服务器，看到 total 只有 1.9 GiB 甚至 1.8 GiB？这是因为操作系统内核、固件、硬件保留占了一部分。

`free` 这一列很小也不用慌。Linux 会把暂时没用的内存拿去做文件缓存，也就是 `buff/cache`，程序需要时会让出来。**所以看剩余内存要看 `available`，不要看 `free`。**

#### 判断内存够不够用

PostgreSQL 默认配置下的常驻开销通常是几十到一两百 MB，我们按 200 MB 留出余量。用 `available` 减去它，就是换完之后大致还剩多少。以上面的示例来算：

```text
现在可用 1.1 GB - PostgreSQL 200 MB ≈ 还剩 900 MB
```

平时够用了。但还要想到构建：`npm run build` 时，Node 可能要占到 1 GB 左右（粗略估计，不同项目差别很大）。所以这台服务器平时没问题，构建时就有点紧。

#### 内存不够怎么办

内存不够的话，最简单粗暴的方法是花钱加内存，但这是最后一个办法——正经人谁花那个钱啊……

我们优先用两种方法来解决内存的问题：

**1. 内存优化**

内存优化指的是停掉无用的服务，或者缩减一些程序的内存占用。我们可以先看一下服务器的内存都被谁占了：

```bash
ps aux --sort=-%mem | head -n 10
```

这条命令列出占内存最多的几个进程，`%MEM` 是占总内存的比例，`RSS` 是实际占用的大小，单位是 KB。

列出来的进程里，可能有不认识的。可以把结果复制给 AI，问问每个进程是什么、能不能停。**不认识的先别动**；确认没用的服务就停掉，这可以释放一些内存。

**2. 加 swap 应对**

前面执行 `free -h` 命令的时候，我们可能已经注意到了，查到的数据分为两行，一行是 `Mem`，另一行是 `Swap`。

swap 就是用硬盘空间充当备用内存。它比内存慢得多，用它来作为常驻程序的运行内存并不合适，但 swap 很适合用来帮助我们在内存不足的时候撑过一次构建。

先看 `free -h` 里 `Swap` 一行的总量。已有够用的 Swap，就跳过这一步。下面以从未配置过 Swap 的 Ubuntu 服务器为例。

可以用几条命令在 Ubuntu 上开辟一块 swap，这些命令也可以让 AI 写，可以这样问 AI：

```text {.prompt}
我的 Ubuntu 服务器只有 2G 内存，npm run build 时内存不够。帮我加一个 2G 的 swap，重启后也要生效，并告诉我怎么确认加好了。
```

命令：

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

加好之后，`free -h` 的 `Swap` 那一行就有数字了。

### PostgreSQL 会安装什么

安装 PostgreSQL 时，并不是安装一个程序，而是会安装几个不同的程序。其中最重要的就是 PostgreSQL Server，此外还有一个叫做 psql 的程序，也是会一起安装的。如果是用图形化界面安装的话，还可以安装一个叫做 pgAdmin 的程序，它们分别是什么呢？

| 程序 | 做什么 |
| --- | --- |
| **PostgreSQL 服务** | 在后台运行，管理数据库文件、接收连接，按收到的 SQL 存取数据。它默认监听 5432 端口。 |
| **`psql`** | 命令行连接工具。我们在终端里用它连接数据库、输入 SQL，再看数据库返回的结果。 |
| **pgAdmin** | 图形化连接和管理工具，可以通过界面查看库和表、执行 SQL。Windows 安装器提供这个可选组件。 |

`psql` 和 pgAdmin 都叫**客户端**。数据库服务先运行起来，客户端才能连上去做事。使用这些客户端时，要告诉它连接哪个数据库。退出这些工具后，PostgreSQL 服务仍然在后台运行。服务和客户端也可以装在不同的电脑上。 [PostgreSQL 的客户端与服务端](https://www.postgresql.org/docs/16/tutorial-arch.html)

不同的安装方式，会把这些程序组合在一起提供。比如 Windows 安装界面里的 **PostgreSQL Server** 对应数据库服务，**Command Line Tools** 包含 `psql` 等命令行工具，**pgAdmin** 则提供图形界面。本课用 `psql` 操作数据库，本地电脑和服务器上都能沿用这种方式，详情见 [Windows 安装说明](https://www.postgresql.org/download/windows/) 。macOS 和 Linux 如果分别通过 brew 和 apt 安装 PostgreSQL，就不会安装 pgAdmin 这个图形化工具，只会提供 **PostgreSQL Server** 和 `psql` 等命令行工具。

> 我们之前学 SQLite 的时候也见过图形化连接和管理工具，比如 DBeaver，而且 DBeaver也可以连接 PostgreSQL，和 pgAdmin 的作用是一样的。

认识这些程序之后，接下来看看数据库服务里面有哪些东西。
### PostgreSQL 的用户和库

PostgreSQL 和 SQLite 还有一个显著的区别：SQLite 打开文件就能用；PostgreSQL 装好、跑起来之后，还得先有一个"用户"和一个"数据库"，我们的项目才连得上。

我们先把这些搞懂。

之前学习 SQLite 的时候，我们在 Python 程序中连接数据库只有一句：

```python
conn = sqlite3.connect("history.db")
```

这一句背后的事情很简单：

- **数据库就是这个文件。** 所有数据都在 `history.db` 文件里。
- **文件不存在就自动新建。** 所以我们从来没有做过"建库"这件事。
- **没有人问我们是谁。** 程序能读写这个文件，就能动里面的全部数据。

PostgreSQL 则不同，它是一个独立运行的服务，在这个服务的基础上有两个很重要的新概念——数据库和用户。

#### 数据库（DATABASE）

PostgreSQL 里的东西分三层：

```text
PostgreSQL 服务（一个常驻程序，守在 5432 端口）
├── 数据库 textlab
│   └── 表 history
├── 数据库 blog
│   ├── 表 posts
│   └── 表 comments
└── 数据库 shop
    └── 表 orders
```

一个服务里可以放很多个数据库，一个数据库里可以放很多张表。

所以，**SQLite 的一个 `.db` 文件，对应的是 PostgreSQL 里的一个数据库（DATABASE），而不是整个 PostgreSQL 服务。**

也就是说，当一个项目使用 PostgreSQL 的时候，不仅要连接到 PostgreSQL 的服务，还得具体到服务里的某一个数据库（DATABASE）。可以把 PostgreSQL 服务想成一栋楼，数据库是楼里的一套房，每个项目住自己那一套。

数据当然还是以文件的形式存在硬盘上，只是这些文件都由 PostgreSQL 自己管理，放在它的数据目录里。我们不再去找"那个文件"，所有操作都通过 PostgreSQL 的服务来做。

> 严格说，数据库和表之间还有一层 schema，默认的 schema 叫 `public`。这个项目用不上它，以后见到 `public` 和 `schema` 的话知道就行了。

#### 用户（USER）

楼里住了这么多家，就得有门禁。PostgreSQL 守在端口上，等着程序来连，所以它必须先确认来的是谁。这个身份就是**用户（USER）**。连接时要用一个数据库用户名。是否需要密码，取决于这次连接采用的认证方式。

用户管两件事：

- **能不能进来**：这次连接能不能通过身份验证。
- **进来之后能动什么**：用户的权限是什么？能不能建表，能不能读某张表，能不能建新用户。

> 给不同的用户分配不同的权限，够用就好，不多给。这就是最小权限，是很重要的数据安全策略。

不过，"用户"这个词我们之前已经在用了，这里最容易混。现在有三种"用户"：

| 叫"用户"的东西          | 是什么                                | 在哪里                |
| ----------------- | ---------------------------------- | ------------------ |
| 网站的访客             | 打开页面的人，靠 cookie 里的 `session_id` 区分 | `history` 表里的一列数据  |
| 服务器的登录用户          | 比如 `ubuntu`，用来 SSH 登录和运行服务         | 操作系统里              |
| **PostgreSQL 用户** | **连接数据库的身份**                       | **PostgreSQL 服务里** |

所以，“用户”指的并不是网站的访客，而是直接连接 PostgreSQL 的那个身份。访客不会直接访问我们的数据库，在 PostgreSQL 看来，来连接数据库的只有我们的后端这一个身份，也就只需要一个“用户”。

> 官方文档和报错里常写的是 role（角色）。能登录的 role 就是用户，看到时当成"用户"读就行。

#### 刚装好时，服务里有什么

SQLite 的文件不存在时会自动新建，而 PostgreSQL 的库不存在时会报错，连不上。SQLite 替我们省掉的"建库"这一步，现在要我们自己做了。那刚装好的 PostgreSQL 里，有些什么？

- **一个管理员用户。** Ubuntu 和 Windows 上叫 `postgres`；在 macOS 上用 Homebrew 装的话，就是我们登录电脑的那个用户名。管理员用户是超级用户（Superuser），什么都能做。
- **三个自带的库：**
  - `postgres`：用户连接 PostgreSQL 时必须落在某个库上，好在这个`postgres`库是安装时就自动会有的，可以让管理员有地方进来；
  - `template0`、`template1`：建新库时用的模板，不用管。

等会儿动手操作时，我们会进去亲眼看一看。

#### 我们需要建什么

既然刚安装的 PostgreSQL 已经有一个管理员和一个公用的 `postgres` 库，我们的后端程序能不能直接用它们？技术上能，但很不妥：

- **管理员权限太大。** 把这个身份写进后端的配置，后端一旦出漏洞，整个 PostgreSQL 服务就都交出去了。
- **`postgres` 库是公用的落脚点。** 业务数据不该放在这里。一个项目一个库才方便后续做权限管理和数据备份。

所以我们要建两样东西：

- **一个专属的库，我们可以叫它  `textlab`**，只放文字实验室的数据；
- **一个普通用户，我们可以叫它`textlab_backend`**，供后端连接这个库。

名字可以自定，我们这一节就用这两个名字。

此外，我们的数据最终是要放在一个 `history` 表里，这个表也要创建，我们要把它建在`textlab`这个库里面。

#### 用户、库和表怎么建

刚装好时只有管理员，因此创建用户和库这一步，只能用**管理员身份**来做。

我们可以用 `psql` 执行 `CREATE USER` 和 `CREATE DATABASE`分别创建用户和库，但是因为是用管理员身份来建的，这个库的**所有者（OWNER）** 默认是管理员自己。而（PostgreSQL 15 起）默认情况下，`textlab_backend` 不能直接在这个库里建表，会报错：

```text
permission denied for schema public
```

为了让 `textlab_backend` 能在 `textlab` 里建表，我们在建库时就把所有者指定为它。

管理员也能建表，但管理员建的表同样也是默认归管理员所有，而以后我们项目里要用的实际上是`textlab_backend`这个用户。那让 `textlab_backend` 自己建表就是一种更合适的做法。

所以，总结下来就是这样几步：

1. 用管理员身份创建项目用户 `textlab_backend`。
2. 用管理员身份创建项目库 `textlab`，同时把所有者指定为 `textlab_backend`。
3. 用 `textlab_backend` 身份在 `textlab` 库里创建 `history` 表，以后也用这个身份读写数据。

### 迁移历史数据

此前我们上 SQLite 的时候，是**从零开始**，库里是空的，建个表就行。后续给表加 `session_id` 那一列时也没为难我们自己，当时项目还没上线，测试数据也不值钱，我们干脆把 `history.db` 删了重建。

而这一次，项目**已经上线**，`history.db` 里是真实的访客记录，而且是**每个访客各自的那一份**，丢不起。所以除了"换代码、装新库"之外，还多了一个当初**没做、但点过名**的步骤——**数据迁移**，把旧库里的数据，一条不落地搬进新库。
#### 挑战

此前我们的数据存储从 `history.json` 升级为 `history.db`  时说过，真实项目里，数据迁移是一门正经手艺，老数据一条都不能丢。今天，我们就把这门手艺走一遍。也正因为数据搬坏了就回不来，这一节除了"怎么换"，更要紧的是"**怎么确认换对了**"。

在做数据迁移时有三件事要做，它们的节奏不一样：

- **代码更新**。`git pull` 只是换了硬盘上的文件，正在运行的程序用的还是旧代码；服务重启的那一刻，代码就会真正更新。这是一瞬间就能完成的。
- **数据同步**。我们需要把旧库的数据一条一条读出来，并且写入到新的数据库。这并非一瞬间就能完成，数据量很大的时候，甚至可能耗时几个小时乃至更久。
- **访客访问**。随时会有访客打开我们的网站，通过后端读写数据库。这是一个持续的过程，只要网站服务不停，访客数据的读写就不会停。

切换数据库这件事需要我们在服务器上做两个动作：换代码、搬数据。这两件事分不开，因为**新代码只认 PostgreSQL，旧代码只认 SQLite**。而代码更新是瞬间的，数据同步需要时间，访客的读写却一刻不停。

如何保障访客的“无感”，就是真正困难的地方。因为如果不停服务，无论是先搬数据还是先更新代码就都有问题：

| 顺序           | 会发生什么                                               |
| ------------ | --------------------------------------------------- |
| 先搬数据，再重启换新代码 | 搬完到重启之间，访客数据持续往 SQLite 里写。这些新记录没搬过去，就**悄悄丢了**，而且不报错 |
| 先重启换新代码，再搬数据 | 新库是空的，访客打开页面发现**历史全没了**，要等搬完才回来                     |

#### 解法

真要做到完全无感知，业界也有成熟做法，比如**双写**：新代码同时写新旧两个库，等新库核对无误，再把读取切过去。每一步都能退回去，但要多写一套代码、多发几版。

但这个做法太费劲了，成本很高——必须要认识到**无感知不是免费的**。日进斗金的大网站值得付这个代价；文字实验室如果停服，最多会让极少数访客点一下没反应，不值得费这个劲。

我们选的方案是**先让服务停下来，让新数据停止写入，再搬数据，最后让新代码上岗。**

> 停服是一种挺常见的做法。有些网站会在停服之前发布公告，告知访客网站在什么时间段内停止服务；停服期间访客打开网站，看到的是一张停服公告页。

可以用一些方法把这段时间压到最短：

1. **提前准备好数据库。** 装 PostgreSQL、建用户和库、确认权限并验证连接，这些先做完。等后端停下来，再记下旧库的数据量，在原来的项目目录里拉代码、装依赖、写配置、建表和迁移，核对通过后启动新后端。
2. **挑人最少的时候做。** 访客日志和 GA 能告诉我们，一天里什么时候访问最少。

停服时，也可以只停后端，这样还能让页面照样打开，受影响的只有分析和查历史的 `/api/` 请求。

此外，在服务器上动手之前，我们还应该先在本地开发和迁移一遍，本地验证没问题了，再在服务器上安装和迁移，并把代码推到服务器上就可以了。

### 整个过程分几步

方案定下来了，我们把整个过程分成三个阶段：

| 阶段        | 在哪做 | 做什么                                                                 | 影响访客吗     |
| --------- | --- | ------------------------------------------------------------------- | --------- |
| 一、本地改造与测试 | 本地  | 装 PostgreSQL、建用户和库，改代码、建表，把本地数据搬一遍并验证                               | 不影响       |
| 二、服务器切换   | 服务器 | 先准备：检查内存，装 PostgreSQL、建用户和库，确认权限、验证连接；再切换：停服务、数旧库、拉代码、装依赖、写配置、建表、迁移 | 停服之后开始影响  |
| 三、验收与运维   | 服务器 | 核对数据，通过后启动后端，再用浏览器验收并检查内存和端口                                        | 启动后端后恢复服务 |

阶段一都在本地，在我们自己的电脑上把所有的流程都走通，并且测试代码的逻辑无误。这就像彩排，阶段二才是正式演出。

代码只需要写一遍，本地的代码可以直接通过 git 同步到服务器上。但是数据库的安装、设置，以及数据的迁移要在本地和服务器上分别做。

### 搬什么，怎么验

所有的步骤里面最要小心的是数据迁移。它要做的事说起来很简单：**确认目标库的 `history` 表为空 → 读旧库 → 逐条写进新库 → 提交**。数据迁移脚本我们可以让 AI 帮我们写，但是有几个关键的事情是我们自己心里要有数的。

#### 哪些搬，哪些不搬

现在的 `history` 表看起来是这样的

| id  | session_id     | text    | score | label | pinyin                        | created_at                |
| --- | -------------- | ------- | ----- | ----- | ----------------------------- | ------------------------- |
| 1   | 9f3518...00354 | 今晚月色真美  | 0.47  | 中性    | jīn wǎn yuè sè zhēn měi       | 2026-09-05T17:22:52+00:00 |
| 2   | 75738f...848aa | 这个电影真好看 | 0.9   | 偏积极   | zhè ge diàn yǐng zhēn hǎo kàn | 2026-09-05T17:29:09+00:00 |

数据迁移的时候有这样几个tips：

- **`session_id` 一定要搬。** 这是最容易翻车的一项，因为用户就是通过自己浏览器的 cookie 里记录的 `session_id` 来存取历史记录的。如果 `session_id` 搬丢了，这个迁移就失去了意义。
- **这次不搬 `id`。** 这个自增字段没有被赋予任何的业务意义，它只是数据库当初生成的一个自增字段。因此这次可以只搬**业务字段**（会话id、原文、分数、标签、拼音、时间），让新库重新生成一个自增 `id` 即可。
- **目标库的 `history` 表必须为空。** 脚本开头先检查一遍，表里有记录就停下。没有这个检查，脚本不小心跑两遍，每个访客的记录就会多出一份，还不报错。如果新后端提前写入了记录，这道检查也能发现。
- **旧库先别删。** 搬完把旧的 `history.db` 原地保留，确认新库一切正常，再决定它的去留。毕竟**旧的还在，我们才敢动新的。**

> **为什么说 `session_id` 是最容易翻车的一项？**
>
> 因为不搬这一列的话 PostgreSQL 就给这一列填 `NULL`，搬完条数也对得上。业务层面，漏掉它，**程序也不会报错**，只是用户根据 session_id 都查不到自己的历史纪录。记录就成了没人认领的孤儿。
>
> 这是数据迁移最难防的地方：**它很少报错，它只是悄悄地不对。** 所以它才是一门手艺。

#### 怎样才算搬对了

正因为迁移很少报错，"搬对了"的标准要在搬之前就定好。搬之前，先数一数旧库，记下两个数：记录条数和访客数（有几个不同的 `session_id`）。搬完之后，要同时满足四条：

1. **条数要对上**：新库的记录条数和旧库一样；
2. **孤儿为 0**：没有一条记录的 `session_id` 是空的；
3. **访客数要对上**：新库里有几个不同的 `session_id`，和旧库的访客数一样；
4. **用眼睛验**：用同一个浏览器打开文字实验室，自己的那份历史还在。

前三条用 SQL 查，最后一条用浏览器看。

---

## 第三部分：动手

方案和标准都定好了，接下来一步一步做。

### 阶段一：本地改造与测试

前六步都在自己的电脑上做。先在自己的电脑上把迁移走一遍，再到服务器上做同样的事（可以把在本地做的迁移数据看作是彩排，即使搬坏了也不影响线上）。

#### 第一步：在本地装 PostgreSQL

在安装之前要先确定版本号，然后再按自己的操作系统选择对应的安装包。各平台的安装入口都在 [PostgreSQL 官方下载页](https://www.postgresql.org/download/)。

##### 看懂版本号

截至本文发布时（2026 年 11 月），PostgreSQL 的最新稳定版是 **19.0**，于 11 月 19 日发布。

下图是 PostgreSQL 官网 11 月 12 日的版本发布公告。

![PostgreSQL 官网 11 月 12 日的版本发布公告](/images/module-7-5-postgresql-download.png)

以仍在维护的 **18.7** 为例，前面的 **18** 是大版本，后面的 **7** 是小版本。大版本会加入新功能，也可能改变一些默认行为。小版本主要修复漏洞和程序错误。每个大版本由 PostgreSQL 社区维护约五年。详情见 [官方版本说明](https://www.postgresql.org/support/versioning/)

##### 我们这次装哪个版本

不同版本的 Ubuntu 自带的 PostgreSQL 大版本可能不同。例如 Ubuntu 24.04 默认提供 PostgreSQL 16，Ubuntu 26.04 默认提供 PostgreSQL 18。可以先 SSH 登录自己的服务器，通过下面的命令查当前软件源准备装哪个版本。

```bash
apt-cache policy postgresql
```

看 `Candidate` 那一行就可以看到版本号。比如说看到 `16+257build1`，那这个软件包对应的 PostgreSQL 大版本就是 16（这条命令只是帮我们查一下服务器的 apt 默认安装的 PostgreSQL 版本，并不是真正的安装）。

本节用 Ubuntu 24.04 做服务器，它自带的软件源默认提供 PostgreSQL 16，所以我们在本地也装 16。后面的命令和验证结果都以这套环境为例。本地和服务器的大版本保持一致即可，小版本可以不同。

##### 按你的操作系统安装

**macOS（Homebrew）**

Mac 上用 Homebrew 安装。如果还没有装过它，先到 [Homebrew 官网](https://brew.sh/) 按说明安装，并完成安装结束时提示的终端配置。新开一个终端，执行 `brew --version`，能看到版本号就说明 Homebrew 已经安装好了。

下面第一行安装 PostgreSQL 16 的服务和 `psql` 等命令行工具，第二行启动数据库服务。 [Homebrew 的 PostgreSQL 16 安装说明](https://formulae.brew.sh/formula/postgresql@16)

```bash
brew install postgresql@16
brew services start postgresql@16
```

接下来让终端能找到 16 的 `psql` 等命令。在 macOS 默认的 zsh 终端里，执行下面两行。第一行把命令目录写进终端启动时会读取的 `~/.zshrc`，第二行让当前窗口也读入这项配置。

```bash
echo 'export PATH="$(brew --prefix postgresql@16)/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

这项配置做一次即可，以后新开的终端也会优先使用 PostgreSQL 16 的命令。

> 注意，用这种方式在 macOS 本地安装之后，PostgreSQL 的管理员用户名就是 macOS 的系统用户名，比如说我的 macOS系统用户名是 libo，那么安装的 PostgreSQL 的管理员用户名也是 libo

**Windows（安装包）**

从 [PostgreSQL 官网的 Windows 下载页](https://www.postgresql.org/download/windows/) 进入 EDB 的下载页面，选择 **16.x** 的 Windows 安装包。安装向导里保留数据库服务 **PostgreSQL Server** 和包含 `psql` 的 **Command Line Tools**，pgAdmin 可以按需选装。给管理员 `postgres` 设置一个密码并记下来（验证和第二步都要用）。端口用默认的 **5432**，安装结束后可以跳过 Stack Builder。 [EDB 安装说明](https://www.enterprisedb.com/docs/supported-open-source/postgresql/installing/windows/)

装好后，把安装目录下的 `bin` 加进 Windows 的命令搜索路径，这项设置保存一次，以后新开的终端就能找到 `psql`。

1. 在开始菜单搜索并打开“编辑系统环境变量”，点击“环境变量”。
2. 在“系统变量”里选中 `Path`，点击“编辑”，新增 `C:\Program Files\PostgreSQL\16\bin`。如果安装时改过目录，填实际安装目录下的 `bin`。
3. 如果列表里已有其他版本的 PostgreSQL，把 16 的这一项移到它们前面，然后确认保存。
4. 关闭原来的终端窗口，重新打开 PowerShell，继续下面的安装验证。

> 用这种方式安装后，PostgreSQL 的管理员用户名是 `postgres`。
>
> 如果你的项目在 WSL 的 Ubuntu 里开发，就在 WSL 终端按下面的 Ubuntu 步骤安装。运行 `systemctl` 需要 systemd 已启用，配置方法见 [Microsoft 的 WSL 文档](https://learn.microsoft.com/en-us/windows/wsl/systemd)。

**Ubuntu**

本地用 Ubuntu 24.04 的话，直接用 `apt` 安装并启动 PostgreSQL。后面在线上的 Ubuntu 24.04 安装时，也是这组命令。

```bash
sudo apt update
sudo apt install postgresql
sudo systemctl enable --now postgresql
```

如果本地是其他版本的 Ubuntu，先用上面的 `apt-cache policy postgresql` 看默认大版本。如果默认装出来的是别的版本，可以按 [PostgreSQL 官网的 Ubuntu 软件源说明](https://www.postgresql.org/download/linux/ubuntu/) 添加官方软件源，再用 `sudo apt install postgresql-16` 指定版本。其他 Linux 发行版可以从官网下载页进入各自的安装说明。

> 用 `apt` 安装后，Ubuntu 会增加一个叫`postgres`的系统用户， PostgreSQL 的初始管理员也叫 `postgres`。前者用来运行命令，后者用来连接数据库。

##### 用 `psql` 连接数据库

新开一个终端，先查客户端：

```text
psql --version
```

看到 `psql (PostgreSQL) 16.x`，说明终端找到的是 16 的客户端。

下面是用 `psql` 连接 PostgreSQL 的命令格式。方括号里的内容要换成实际的连接信息。

```shell
psql -h [主机名] -p [端口号] -U [用户名] -d [数据库名]
```


- 命令是`psql`，它代表要用`psql`客户端去访问数据库
- `-h` 是 host 参数，意思是要访问的数据库服务在哪个地址上，如果写`localhost`就代表本机。如果不写这个参数，那么默认也是连接到本地
- `-p` 是 port 参数，意思是要访问的数据库服务在哪个端口上，我们讲过 PostgreSQL 默认运行在 5432 端口，所以这里就写 5432. 如果不写这个参数，那么默认就会用 5432
- `-U` 是指定数据库用户名的参数，意思是用哪一个用户访问数据库。如果不指定这个参数，那就默认用运行`psql`的系统用户名
- `-d` 是 database 参数，意思是要访问的是 PostgreSQL 服务里的哪一个库，我们现在还没有建新的库，所以就写一个默认库即可，写 postgres. 如果不写这个参数，那么默认会使用**当前连接用户名**作为数据库名

要以管理员身份连接自带的 `postgres` 库，按你的系统在终端里执行表中的命令。

| 系统                  | 连接命令                                                | 数据库用户                    |
| ------------------- | --------------------------------------------------- | ------------------------ |
| macOS（Homebrew）     | `psql -h localhost -p 5432 -d postgres`             | 与当前 macOS 用户同名的数据库管理员    |
| Ubuntu              | `sudo -u postgres psql -p 5432 -d postgres`         | `postgres`               |
| Windows（PowerShell） | `psql -h localhost -p 5432 -U postgres -d postgres` | `postgres`，按提示输入安装时设置的密码 |

> 在 Ubuntu 上，小写 `-u` 是 `sudo` 的参数。`sudo -u postgres` 让 `psql` 以系统用户 `postgres` 的身份运行。这里省略 `-h`，PostgreSQL 默认会核对这个本机系统身份。

如果用的是本机默认配置，也可以用下面的简写，以管理员身份连接 `postgres` 库。

| 系统                  | 连接命令                    | 数据库用户                    |
| ------------------- | ----------------------- | ------------------------ |
| macOS（Homebrew）     | `psql -d postgres`      | 与当前 macOS 用户同名的数据库管理员    |
| Ubuntu              | `sudo -u postgres psql` | `postgres`               |
| Windows（PowerShell） | `psql -U postgres`      | `postgres`，按提示输入安装时设置的密码 |

连上后会看到这样的提示符。

```text
postgres=#
```

`postgres` 是当前所在的库，`#` 表示当前是数据库超级用户。三个系统进入 `psql` 后，操作都一样。在提示符后输入下面这句 SQL，查询服务端版本。

```sql
SHOW server_version;
```

看到服务端版本也是 **16.x**，就可以继续了。

#### 第二步：建用户、建库

接着在 `postgres=#` 提示符下操作。如果已经退出，就用刚才的命令重新连接。先用 `\du` 看有哪些用户。

```text
\du
```

```text
 Role name |                         Attributes
-----------+------------------------------------------------------------
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS
```

再看有哪些库：

```text
\l
```

输出的列很多，先看前两列：

```text
   Name    |  Owner
-----------+----------
 postgres  | postgres
 template0 | postgres
 template1 | postgres
```

> 按本课的 Homebrew 安装方式，`\du` 的 `Role name` 和 `\l` 的 `Owner` 列都会显示你的 macOS 用户名。

如果底部出现 `(END)` 或 `:`，按 `q` 就能回到提示符。

前面讲过，一个管理员，三个自带的库。

`\du`、`\l` 这种反斜杠开头的，是 `psql` 自己的快捷命令，不是 SQL，不用加分号。

接着，按前面我们定好的名字，在 `postgres=#` 后面输入这两句：

```sql
CREATE USER textlab_backend WITH PASSWORD 'localonly123';
CREATE DATABASE textlab OWNER textlab_backend;
```

每句结尾的分号不能漏。漏了的话，提示符会变成 `postgres-#`，意思是这句话还没写完，补一个 `;` 再回车就行。

成功时，屏幕上会依次出现 `CREATE ROLE` 和 `CREATE DATABASE`。第一个写的是 ROLE，因为用户就是能登录的 role。

再用 `\du` 和 `\l` 看一眼，用户列表里多了 `textlab_backend`，库列表里多了 `textlab`，它的 Owner 是 `textlab_backend`。确认之后退出：

```text
\q
```

**用新身份连一次**

回到终端后，用项目用户连接 `textlab`。macOS、Ubuntu 和 Windows PowerShell 都用下面这条命令。在 Ubuntu 的默认配置下，写上 `-h localhost` 就可以用刚设置的数据库密码连接。

```bash
psql -h localhost -p 5432 -U textlab_backend -d textlab
```

如果提示输密码，就输入刚才为 `textlab_backend` 设置的密码 `localonly123`。

>在macOS上，Homebrew 默认信任本机连接，通常会跳过密码提示。

进入 `textlab=>` 后，输入 `\conninfo` 查看当前的连接信息。

```text
\conninfo
```

确认当前用户是 `textlab_backend`、数据库是 `textlab`，然后用 `\q` 退出。

#### 第三步：改后端代码

改代码前，先在本地用旧后端留一条记录。在项目根目录打开第一个终端，启动前端。

```bash
npm run dev
```

在项目根目录另开一个终端，进入 `backend`，激活虚拟环境并启动后端。

**macOS / Ubuntu**

```bash
cd backend
source .venv/bin/activate
fastapi dev
```

**Windows（PowerShell）**

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
fastapi dev
```

打开页面做一次分析，在历史列表里确认这条记录已经保存，记下原文，迁移后用来核对。前端继续运行，在后端终端按 `Ctrl + C` 停掉后端，避免改代码时自动重载。

接下来先准备驱动和配置，再改代码。

##### 首先是安装驱动

前面我们在 PostgreSQL 中执行 SQL 语句，这是因为有`psql`这个客户端帮我们做连接。但如果 Python 后端要连接 PostgreSQL 数据库服务的话，我们就要给它安装驱动 `psycopg`，由这个库在 Python 程序和数据库之间传递 SQL 和结果。

继续用刚才停掉后端的终端。当前目录是 `backend`，虚拟环境也已激活，可以直接安装驱动并更新依赖清单。如果换了终端，先进入 `backend` 并按上面的方式激活虚拟环境。

```bash
pip install "psycopg[binary]"
pip freeze > requirements.txt
```

##### 然后是写配置文件

驱动装好后，还要告诉后端数据库服务在哪、用什么身份、连哪个库。用 VS Code 打开 `backend/.env`，在原有的 `ALLOWED_ORIGINS` 下面加一行 `DATABASE_URL`。

`DATABASE_URL` 的值叫连接串，格式是 `postgresql://用户名:密码@主机:端口/库名`。用你实际设置的值填写。

```text
# backend/.env
ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=postgresql://textlab_backend:localonly123@localhost:5432/textlab
```

`backend/.env.example` 也要同步加上这一行。但是值写成有指引性的内容即可，千万不能写真实密码：

```text
# backend/.env.example
ALLOWED_ORIGINS=http(s)://[ip]:[port]
DATABASE_URL=postgresql://[用户名]:[密码]@localhost:5432/[库名]
```

##### 代码要改哪里

此前学数据库的时候我们已经把存储逻辑集中到了 `storage.py`。这次就从这个文件看起，先看连接方式，再看建表、保存和查询的 SQL。

改造前（SQLite）：

```python
import sqlite3

DB_FILE = "history.db"

def get_conn():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn
```

改造后（PostgreSQL）：

```python
from pathlib import Path

import psycopg
from dotenv import dotenv_values
from psycopg.rows import dict_row

DATABASE_URL = dotenv_values(Path(__file__).with_name(".env")).get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("请在 backend/.env 里配置 DATABASE_URL")

def get_conn(row_factory=dict_row):
    return psycopg.connect(DATABASE_URL, row_factory=row_factory)
```

变化有三处：

1. **驱动**：`sqlite3`（读写文件）换成了 `psycopg`（连接服务）；
2. **连接方式**：`connect("history.db")` 给的是文件路径，`connect(DATABASE_URL)` 给的是服务的地址；
3. **连接信息进配置**：`DATABASE_URL` 直接从 `backend/.env` 读取，因为连接信息包含密码，不应该放在代码中被 git 追踪。

其中的 `dotenv` 这个包是之前解决 CORS 问题的时候安装的 `python-dotenv`，当时安装它就是为了让Python代码读取 `.env` 配置文件，现在读取配置文件继续用它。

>还有一处看不懂也没关系：就是`row_factory=dict_row` 让查出的每一行以列名作为字典的键，和原来 `sqlite3.Row` 一样，后面的代码还能按列名取值，`dict(row)` 也能继续使用。

**再看一眼没变的东西**

连接之后，拿游标、执行语句、提交和关闭连接这些操作，仍然用 `conn.cursor()`、`cur.execute(...)`、`conn.commit()`、`conn.close()`。

这不是巧合。Python 社区有一份叫 **DB-API** 的约定，规定了数据库驱动该长成什么样：连接、拿游标、执行、提交、关闭，动作和名字都统一。主流的数据库驱动都遵守它，所以换数据库时，这些都不用改。下表列出了需要改的东西和不需要改的东西：

| 会变的 | 不会变的 |
| --- | --- |
| 怎么连（驱动、连接串） | 怎么用（cursor / execute / commit / close） |
| SQL 方言（下面就说） | SQL 的骨架（SELECT、INSERT、WHERE、ORDER BY） |
接下来要检查的是传给 `execute()` 的 SQL。

**两处要改的写法**

建表时，自增主键的写法随数据库变化。保存和查询数据时，参数占位符的写法随 Python 驱动变化。

```text
自增主键（建表 SQL）
SQLite:     id INTEGER PRIMARY KEY AUTOINCREMENT
PostgreSQL: id SERIAL PRIMARY KEY

参数占位符（Python 驱动）
sqlite3:    VALUES (?, ?, ?, ?, ?, ?)
psycopg:    VALUES (%s, %s, %s, %s, %s, %s)
```

`psycopg` 用 `%s` 表示参数的位置，实际的值要作为 `execute()` 的第二个参数传入。

先看自增主键，对应 `init_db()` 中的这一句建表语句：

```python
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
```

现在要换成下面这样的写法（只有 id 的那一行发生了变化）：

```python
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
```

再看占位符。先改 `save_record()` 中的这一句 `INSERT` 语句：
```python
    cur.execute(
        "INSERT INTO history (session_id, text, score, label, pinyin, created_at)"
        "VALUES (?, ?, ?, ?, ?, ?)",
        [session_id, record["text"], record["score"],
         record["label"], record["pinyin"], record["created_at"]],
    )
```

接下来要换成这样的写法：

```python
    cur.execute(
        "INSERT INTO history (session_id, text, score, label, pinyin, created_at)"
        " VALUES (%s, %s, %s, %s, %s, %s)",
        [session_id, record["text"], record["score"],
         record["label"], record["pinyin"], record["created_at"]],
    )
```

`get_history()` 的查询也要改。把 `WHERE session_id = ?` 和 `LIMIT ?` 中的两个占位符都换成 `%s`，查询语句就变成下面这样，后面传入的参数仍是 `[session_id, limit]`。

```python
"SELECT * FROM history WHERE session_id = %s ORDER BY created_at DESC LIMIT %s"
```

三个函数改完如下，存和查的逻辑沿用原来的实现：

```python
def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        session_id TEXT,
        text TEXT,
        score REAL,
        label TEXT,
        pinyin TEXT,
        created_at TEXT
    )
    """)
    cur.execute(
        "CREATE INDEX IF NOT EXISTS idx_history_session_created "
        "ON history(session_id, created_at)"
    )
    conn.commit()
    conn.close()

def save_record(session_id, record):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO history (session_id, text, score, label, pinyin, created_at)"
        " VALUES (%s, %s, %s, %s, %s, %s)",
        [session_id, record["text"], record["score"],
         record["label"], record["pinyin"], record["created_at"]],
    )
    conn.commit()
    conn.close()

def get_history(session_id, limit):
    conn = get_conn()
    cur = conn.cursor()
    rows = cur.execute(
        "SELECT * FROM history WHERE session_id = %s ORDER BY created_at DESC LIMIT %s",
        [session_id, limit],
    ).fetchall()
    conn.close()

    records = []
    for row in rows:
        records.append(dict(row))
    return records
```

到这里，就已经把代码改完了，但是还有三处细节值得讲一讲。
##### 迁移中的三个选择

###### 1. 时间类型的字段

首先就是 `created_at` 字段的类型是用的`TEXT`，当初我们用 `TEXT` 保存时间，因为 SQLite 没有专门的时间类型。而 PostgreSQL 有专门的时间类型 `timestamptz`，为什么还在继续用`TEXT`呢？这是因为我们本节的目标是数据迁移，尽量少做变更。这次先保留 `TEXT`，旧数据就能原样搬过来。以后要改用时间类型，再单独做数据转换。**一次只动一件事**，出了问题也更容易定位。

###### 2. 同名但不同义的 `REAL`

score 字段的类型仍然保持`REAL`，看上去没有变化，但实际上SQLite 和 PostgreSQL 的 `REAL` 名字虽然相同，存储大小和精度却有差别。

|      | SQLite 的 `REAL` | PostgreSQL 的 `REAL` |
| ---- | --------------- | ------------------- |
| 大小   | 8 字节            | 4 字节                |
| 有效数字 | 约 15 位          | 约 6 位               |

同样是`REAL`类型，PostgreSQL 的精度低得多。如果旧库里的数字位数很多，搬过来后面几位就没了（而且不会报错）。

这时有两个选择：
1. 换成 PostgreSQL 的 8 字节类型 `DOUBLE PRECISION`，在精度上和 SQLite 保持一致。
2. 或者继续用 `REAL`，接受精度下降。

遇到这种情况先别急着选，而是根据业务来判断一下。判断的依据不是"两边必须一模一样"，而是这个数据到底需要多精确。

`score` 是 0 到 1 之间的情绪分，后端计算时保留两位小数。`REAL` 的精度足够满足本项目显示情绪分的需求，所以这次继续用它。

这也提醒我们，**换数据库时，不能看到类型名字一样就放心，要看它在新数据库里到底是什么意思，再按业务需要决定。**

###### 3. 建表、建索引的动作

你可能会有一个疑问，那就是我们刚才在创建用户、创建数据库的时候，都是用`psql`直接连到 PostgreSQL 服务上去做的，为什么不顺便在那里就把表和索引建好呢？

确实，有很多开发者在建表、建索引时，就会单独在数据库中去创建。并非一定要把建表语句放在代码中。我们选择在代码中写建表、建索引的语句，是出于两种考虑：

1. 之前用 SQLite 时，`history` 表就由 `init_db()` 创建，沿用这个做法改动更少。
2. 表和索引的定义如果放在代码中，就能随项目一起保存，换台电脑或服务器就能用同一份代码创建。此外如果后续让 AI 帮忙改读写逻辑时，也方便 AI 获取表结构上下文。

#### 第四步：先把新表建出来

代码改好了，库也建好了。现在库里还没有表，但建表语句已经写在 `init_db()` 里。

这个时候，如果我们启动后端服务，其实就会自动调用 `init_db()` 把表和索引在数据库里建出来了，但是这样会有风险：后端服务一旦启动，就可能会有用户数据进来，而我们停服的目的就是不希望这个时候产生新数据，所以这个时候启动后端服务并不妥。

>虽然在本地无所谓，但是我们要在本地模拟一种服务器上的场景。这样本地彩排和服务器切换就按同一个顺序进行——先建好空表，再搬旧数据，核对后才启动后端。

这种情况下我们可以先单独调用`init_db()` 这个建表、建索引的函数。

注意下面的命令要在 `backend` 目录里运行，并且先激活虚拟环境：

**macOS / Ubuntu**

```bash
python3 -c "import storage; storage.init_db()"
```

**Windows（PowerShell）**

```powershell
python -c "import storage; storage.init_db()"
```

这就是不启动后端项目，单独调用 `storage.py` 中的`init_db()`函数的方法。执行完这个命令，表和索引应该就已经在本地 PostgreSQL 的`textlab`数据库中建好了。

这里的 `-c` 让 Python 执行引号里的代码，执行完就退出。正常执行时，终端通常没有输出。

**用 `psql` 确认表建好了。**

在终端重新以 `textlab_backend` 身份连接 `textlab`。如果提示输密码，就用本地项目用户的密码。

```bash
psql -h localhost -p 5432 -U textlab_backend -d textlab
```

在 `textlab=>` 提示符下，先用 `\dt` 列出当前库里可见的表。

```text
\dt
```

看到 `Name` 列里有 `history`，再用下面的命令查看这张表的字段和索引。

```text
\d history
```

能看到 `history` 的字段列表，且 `Indexes` 里有 `idx_history_session_created`，就说明表和索引都建好了。输入 `\q` 回到终端，接下来就可以迁移数据了。

#### 第五步：把旧数据搬进新库

搬之前，先在 `backend` 目录、已激活的虚拟环境里查一下旧库有多少条记录，以及有多少个不同的 `session_id`。

**macOS / Ubuntu**

```bash
python3 -c "import sqlite3; print(sqlite3.connect('file:history.db?mode=ro', uri=True).execute('SELECT count(*), count(DISTINCT session_id) FROM history').fetchone())"
```

**Windows（PowerShell）**

```powershell
python -c "import sqlite3; print(sqlite3.connect('file:history.db?mode=ro', uri=True).execute('SELECT count(*), count(DISTINCT session_id) FROM history').fetchone())"
```

例如输出 `(23, 4)`，就是 23 条记录、4 个有历史记录的会话。记下这两个数，后面要用它们核对。

然后写迁移脚本 `migrate.py`（这个脚本放在 `backend/` 下，你可以让AI帮你写，或者直接复制下面这个）：

```python
import sqlite3
from pathlib import Path

from storage import get_conn

source = Path(__file__).resolve().with_name("history.db")
old = sqlite3.connect(source.as_uri() + "?mode=ro", uri=True)
new = get_conn(row_factory=None)
print(f"源文件：{source}")
print(f"目标库：{new.info.host}:{new.info.port}/{new.info.dbname}，用户：{new.info.user}")
if input("确认源文件和目标库无误后输入 yes：").strip() != "yes":
    raise SystemExit("已取消迁移")
cur = new.cursor()

# ① 目标库的 history 表必须为空，防止重跑把数据搬两遍
existing = cur.execute("SELECT count(*) FROM history").fetchone()[0]
if existing > 0:
    raise SystemExit(f"目标库的 history 表已经有 {existing} 条记录，停止迁移")

# ② 读旧库（SQLite）
rows = old.execute(
    "SELECT session_id, text, score, label, pinyin, created_at FROM history"
).fetchall()

# ③ 写新库（PostgreSQL）
for row in rows:
    cur.execute(
        "INSERT INTO history (session_id, text, score, label, pinyin, created_at)"
        " VALUES (%s, %s, %s, %s, %s, %s)",
        row,
    )
new.commit()
old.close()
new.close()

print(f"迁移完成，共 {len(rows)} 条记录")
```

跑它：

**macOS / Ubuntu**

```bash
python3 migrate.py
```

**Windows（PowerShell）**

```powershell
python migrate.py
```

脚本会显示源文件路径和目标库的连接信息。确认源文件是自己项目里的 `backend/history.db`，目标是本机的 `textlab` 库，连接用户是 `textlab_backend`，再输入 `yes` 并按回车。

```text
迁移完成，共 23 条记录
```

#### 第六步：验证迁移是否正确

在终端连接本地的 `textlab`。

```bash
psql -h localhost -p 5432 -U textlab_backend -d textlab
```

在 `textlab=>` 提示符下，先查新库的记录数。

```sql
SELECT count(*) FROM history;
```

```text
 count
-------
    23
```

确认记录数和旧库一致，再在同一个会话里查有历史记录的会话数，以及没有 `session_id` 的记录数。

```sql
SELECT count(DISTINCT session_id) FROM history;
SELECT count(*) FROM history WHERE session_id IS NULL;
```

如果是正确地迁移了，那么第一条应当和旧库的会话数一致，第二条应当返回 0（也就是说所有的记录都归属于某个 session_id，没有“孤儿”）。

>如果有一项对不上，先停在这里。记录数不一致，就对照旧库的记录数、脚本报告的迁移条数和新库的记录数。会话数不一致，或者出现了“孤儿”，就检查旧记录有没有缺少 `session_id`，以及脚本有没有把这一列原样搬过去。

都核对通过后，就可以启动后端服务了。

输入 `\q` 回到终端，再在 `backend` 目录、已激活的虚拟环境里启动本地后端。

```bash
fastapi dev
```

用刚才迁移数据之前做过文本分析的那个浏览器打开同一个本地网址，如果可以在历史列表中找到之前记下的原文，那就说明旧历史还能查得到。此时换一段文字做一次新的分析，刷新页面后重新打开历史列表。如果还能找到刚刚输入的原文，就说明新记录也保存下来了。

至此，本地彩排就完成了，下一步就可以在服务器上切换了。

此时可以先把本地代码推送到 GitHub 远程仓库，但是千万别 pull 到服务器上。

> **旧的 `history.db` 先别删。** 服务器可以重装、代码可以重拉，唯独数据丢了就是真丢了。先保留几天，等确认新库一切正常，再决定它的去留。

---

### 阶段二：服务器切换

本地跑通了，接下来把同样一套搬到服务器上。这时我们就站在"运维"的视角了，要动的主要不是代码，而是环境。

确认本地改好的代码已经提交并推送到 GitHub，接下来按前面定好的计划，先准备服务器上的数据库，再停掉后端，在原来的项目目录里更新代码、配置和迁移数据。迁移完成后，核对数据，再通过 systemd 启动服务并验收。

#### 第七步：准备好服务器上的 PostgreSQL

先用 `free -h` 记下可用内存，再按 Ubuntu 命令安装 PostgreSQL。

```bash
sudo apt update
sudo apt install postgresql
sudo systemctl enable --now postgresql
```

在服务器终端以管理员身份连接。

```bash
sudo -u postgres psql -p 5432 -d postgres
```

> 也可以用简写模式： `sudo -u postgres psql`

在 `postgres=#` 下，用 `SHOW server_version;` 确认服务端版本是 16.x，再创建项目用户和库。建库时指定 `OWNER textlab_backend`。

```sql
CREATE USER textlab_backend;
CREATE DATABASE textlab OWNER textlab_backend;
```

接着在同一个 `psql` 会话里为项目用户设置密码。

```text
\password textlab_backend
```

按提示输入两次新密码。给服务器上的项目用户另设一份随机密码，可以用字母和数字，方便后面填进连接串。用 `\password` 可以避免把明文密码写进命令历史。

设好密码后输入 `\q` 回到服务器终端，再用和本地一样的命令连接。按提示输入刚才给服务器项目用户设置的密码。

```bash
psql -h localhost -p 5432 -U textlab_backend -d textlab
```

在 `textlab=>` 提示符下，逐条执行下面的命令。

```text
\conninfo
\l textlab
```

用 `\conninfo` 确认当前连的是 `textlab` 库，用户是 `textlab_backend`。再用 `\l textlab` 确认库的所有者也是 `textlab_backend`。检查通过后，输入 `\q` 回到服务器终端。

#### 第八步：停服，更新代码并迁移数据

先用平时访问线上站点的浏览器做一次分析，在历史列表里确认这条记录已经保存，再记下原文。等会儿用同一个浏览器对照。

##### 1. 停后端，记下旧库的数据量

```bash
sudo systemctl stop zero-backend
systemctl is-active zero-backend
```

看到 `inactive` 就代表后端服务已经停了。

接下来进入后端目录，激活原来的虚拟环境，数一遍旧库：

```bash
cd ~/zero-to-tech/backend
source .venv/bin/activate
python3 -c "import sqlite3; print(sqlite3.connect('file:history.db?mode=ro', uri=True).execute('SELECT count(*), count(DISTINCT session_id) FROM history').fetchone())"
```

输出的两个数分别是记录数和会话数，把它们记下来，迁移后用来核对。

##### 2. 拉取代码、安装依赖。

继续在 `~/zero-to-tech/backend` 目录、已经激活的虚拟环境里执行：

```bash
git pull
pip install -r requirements.txt
```

逐条执行，上一条成功才执行下一条。如果在更新代码或安装依赖时报错，要停下来先查清原因，解决后再继续。

##### 3. 写配置、建表

和本地的做法一样，我们需要修改服务器上的后端配置文件，在 `backend/.env` 里保留原有配置，新增 `DATABASE_URL`。主机、端口、库名和密码要与刚验证的连接一致。

```text
DATABASE_URL=postgresql://textlab_backend:这里换成服务器的密码@localhost:5432/textlab
```

保存配置后，收紧权限，再调用建表函数：

```bash
chmod 600 .env
python3 -c "import storage; storage.init_db()"
```

这一步如果遇到报错，需要先检查原因，优先排查是不是连接信息有误或权限不足。

建表成功之后才可以做迁移。
##### 4. 迁移数据

```bash
python3 migrate.py
```

和本地一样，迁移脚本会先显示源路径和目标库，核对正确才输入 `yes`。

迁移完成之后先不要着急启动后端服务，先进入下一步核对数量。

> 如果迁移报错就先查清原因，和本地的做法一样。

### 阶段三：验收与运维

#### 第九步：核对数据，启动后端并验收

##### 1. 核对数据

在服务器终端连接 `textlab`，按提示输入服务器上的项目用户密码。连接信息要与 `backend/.env` 一致。

```bash
psql -h localhost -p 5432 -U textlab_backend -d textlab
```

在 `textlab=>` 提示符下，用 `\conninfo` 确认用户和库名与迁移脚本显示的一致，再在同一个会话里逐条查询。

```sql
SELECT count(*) FROM history;
SELECT count(DISTINCT session_id) FROM history;
SELECT count(*) FROM history WHERE session_id IS NULL;
```

前两个数要和停服后从服务器旧库查到的结果一致，最后一个数应当是 0。核对通过后，输入 `\q` 回到服务器终端。

##### 2. 启动后端

核对通过后，再启动后端：

```bash
sudo systemctl start zero-backend
sudo systemctl status zero-backend
sudo journalctl -u zero-backend -n 30
```

如果看到 `(END)`，按 `q` 回到终端。

看到 `active (running)`，并确认本次启动的日志没有报错，就可以用浏览器验收了。

##### 3. 用浏览器验收

用停服前那个浏览器打开同一个网址，在历史列表里找到停服前记下的原文。再换一段文字做一次分析，刷新页面后重新打开历史列表，确认新原文还在。那就说明服务器端的迁移也完成了，接下来就可以做一些收尾工作了。

#### 第十步：收尾

##### 看一下内存

在服务器上再跑一次前面用过的命令。

```bash
free -h
```

看 `Mem` 那一行的 `available`，和安装 PostgreSQL 前记下的数字对一对，看看数据库换完后，服务器还有多少内存余量。

如果余量偏小，就回到前面“内存不够怎么办”那一节，按那里的办法调整。

##### 确认端口

后端和 PostgreSQL 在同一台服务器上，用 `localhost` 就能连上，所以一定注意不要给公网开 5432 端口。和之前一样，公网还是只开 22、80 和 443 就可以，数据库的 5432 端口留在本机。

##### 更新 README

改了数据库，那么 README.md 也要跟着改，你可以让 AI 帮你写一个新的 README 文档，也可以直接复制这一段：

````markdown
# 文字实验室

零到全栈课程的贯穿项目。输入一段中文，查看情绪分和全文拼音。分析记录存入数据库，每个访客可以查看自己的历史。

## 技术栈

- 前端用 Next.js（静态导出）和 React
- 后端用 FastAPI 和 Uvicorn
- 文本分析用 snownlp 和 pypinyin
- 数据存储用 PostgreSQL 16，线上由 Nginx 提供静态文件并转发 API 请求

## 项目结构

| 路径 | 内容 |
| --- | --- |
| `app/`、`components/` | 页面和 React 组件 |
| `css/`、`public/` | 样式和静态资源 |
| `backend/main.py` | 分析和历史记录 API |
| `backend/storage.py` | 数据库连接、建表和读写 |
| `backend/requirements.txt` | 后端依赖 |

## 准备环境和配置

需要 Node.js 18.18+、Python 3.10+ 和 PostgreSQL 16。先启动 PostgreSQL，用管理员身份创建项目用户和数据库。

```sql
CREATE USER textlab_backend;
CREATE DATABASE textlab OWNER textlab_backend;
```

在同一个 `psql` 会话里用 `\password textlab_backend` 设置密码。首次启动后端时会自动创建历史记录表和索引。

参考项目里的 `.env.example` 和 `backend/.env.example` 准备配置文件。

| 配置 | 本地 | 线上 |
| --- | --- | --- |
| 前端 `NEXT_PUBLIC_API_BASE_URL` | 在 `.env.local` 填 `http://localhost:8000` | 在 `.env.production` 留空，前端用相对路径访问 `/api/` |
| 后端 `ALLOWED_ORIGINS` | `http://localhost:3000` | 站点地址，例如 `https://example.com` |
| 后端 `DATABASE_URL` | 本地数据库的连接串 | 服务器数据库的连接串 |

后端两项都写在 `backend/.env`。连接串形如 `postgresql://textlab_backend:PASSWORD@localhost:5432/textlab`，把 `PASSWORD` 换成对应环境的密码。真实密码只放在各自环境的 `.env` 里。

## 本地运行

在项目根目录打开两个终端。第一个终端用来启动后端，先按系统创建并激活虚拟环境。已有 `.venv` 时，直接激活即可。

**macOS / Ubuntu**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

**Windows（PowerShell）**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

激活后，安装依赖并启动后端。三个系统的写法一样。

```bash
pip install -r requirements.txt
fastapi dev                     # http://localhost:8000
```

在另一个终端从项目根目录启动前端。

```bash
npm install
npm run dev                     # http://localhost:3000
```

## 部署到服务器

服务器另需安装 Nginx。准备好 PostgreSQL 和线上配置后，按下面的顺序部署。

1. **前端**。在项目根目录运行 `npm install` 和 `npm run build`，构建产物在 `out/`。
2. **后端**。在 `backend` 创建并激活虚拟环境，执行 `pip install -r requirements.txt`。将下面的配置保存为 `/etc/systemd/system/zero-backend.service`，按实际部署账号和目录修改。

   ```ini
   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/zero-to-tech/backend
   ExecStart=/home/ubuntu/zero-to-tech/backend/.venv/bin/fastapi run --host 127.0.0.1
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   运行 `sudo systemctl daemon-reload` 和 `sudo systemctl enable --now zero-backend`。

3. **Nginx**。网站根目录指向项目的 `out/`，页面路由用 `try_files $uri $uri.html $uri/ =404;`，在 `/api/` 的配置里用 `proxy_pass http://127.0.0.1:8000;`。预留给后端和数据库的 8000 和 5432 都留在本机。
````

---

## 结尾

这一节，我们把文字实验室的存储从 SQLite 换成了 PostgreSQL。

下一节，我们会把拉代码、构建前端、更新依赖和重启后端这些动作自动化。我们也会看看 CI/CD 怎么在推送代码后自动触发这些步骤。

---

[← 上一节：模块 7.4 看懂流量——访客日志与埋点](/zero-to-fullstack/lessons/module-7-4/) | 下一节：模块 7.6 自动化发布（尚未发布）
