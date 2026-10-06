---
title: "模块 7.2：常驻与同源——systemd 与 Nginx 反向代理"
meta_title: ""
description: "使用 systemd 和 Nginx 反向代理，用更优雅的方式实现 zero-to-tech 项目的部署，便于后续维护。"
date: 2026-10-06T00:00:00+08:00
categories: ["部署与运维上线"]
tags: ["部署", "systemd", "systemctl", "journalctl", "进程守护", "守护进程", "daemon", "service 文件", "Nginx", "反向代理", "reverse proxy", "proxy_pass", "同源", "CORS", "127.0.0.1", "安全组", "纵深防御", "访问日志", "README", "后端", "全栈"]
weight: 31
draft: false
---

> 使用systemd和Nginx反向代理，用更优雅的方式实现`zero-to-tech`项目的部署，便于后续维护。

---

## 朴素的部署留下的三笔账

上一节做了项目部署，但是留下了三笔账：

- 后端服务脆弱
- 8000端口裸奔
- 前后端不同源

今天我们一笔一笔来解决。

---

## 第一笔：systemd 取代 nohup

上一节我们为了让后端服务在后台运行，用了nohup命令，所以后端程序的启动方式从

```bash
fastapi run
```

换成了

```bash
nohup .venv/bin/fastapi run > backend.log 2>&1 &
```

这很有效，能够让程序从前台必须占用着 ssh 会话，转变到了即使会话结束也不会死掉了。

但用nohup在后台运行的话，我们操作后端程序的时候就变得有些麻烦了。

比如说我们**想知道后端程序是否还活着**，就没有一条命令可以直接查，要先根据名称去查它的进程号：

```bash
ps aux | grep fastapi
```

执行这个命令之后，会捞出来这样一行信息（注意，可能会查出来两行，那么你需要看哪一行里有python）：

```bash
ubuntu   3701149  0.1 13.2 774360 506288 ?   Sl   Sep19  29:46 /home/ubuntu/zero-to-tech/backend/.venv/bin/python3 .venv/bin/fastapi run
```

如果用空格来分列，**第二列的数字就是进程号（PID）**，进程还在就说明它还活着。

**如果想停掉它**， 同样没有"停止"这条命令，只能通过进程号去杀：

```bash
kill 那个进程号
```

杀掉之后，再看`fastapi`的进程，应该就已经不存在了（这个时候文字实验室的后端也不能工作）。

查个状态要先捞进程号，停个服务还是要先捞进程号，想翻日志得自己记着当初重定向到了哪个文件。**这就属于"没人管"**——我们需要持续关注它的运行情况。

而且还有两件更要紧的事情`nohup` 做不到：**服务器如果重启，后端进程不会重启；进程自己崩了，也不会自己重启**。

所以我们需要有工具或者管家可以帮我们做这些事：

- 如果服务器重启了，能帮我们自动重启我们的程序；
- 如果服务器没重启，但程序自己崩了，希望它可以在崩完之后自动重启继续干活；
- 想要查看程序的状态，能比较方便地查（而不用先找进程号再查询）；
- 程序的输出和报错，有人替我们收着，不用自己惦记当初写到哪个文件去了。

好在 Linux 上就有这样的“管家”。让一个程序专门守着我们的程序、盯着它、护着它，这件事有个正式的名字，叫**进程守护**；Ubuntu 上干这件事的工具，叫 **systemd**。

> systemd 末尾这个 d，是 **daemon**（守护进程）的意思——systemd 就是 system daemon。Linux 上名字末尾带 d 的程序，一般都是守护进程，比如 `httpd`、`crond`。

### 把程序委托给 systemd

我们可以**把程序委托给systemd**，告诉它"这个程序归你管了"，从此不再由我们亲手启动，而是交给它。

systemd 并不新鲜，**我们早就见过它，只是当时我没说破。**

在前面学Nginx的时候，在服务器上装完 Nginx 之后，我们敲过一句命令：

```bash
systemctl status nginx
```

然后看到那行 `Active: active (running)`，我说"这说明 Nginx 已经启动了"，就翻篇了。

再往后学习前端部署，每次改完 Nginx 配置，我们也都会敲一句：

```bash
sudo systemctl reload nginx
```

这都是在使用 systemd，只不过我们敲的命令叫 `systemctl`。

现在我们重新看一看上面两句命令：`systemctl`（读作 system control）是`systemd`的**命令行工具**，`nginx` 是**被委托出去的那个程序**，中间的 `status`、`reload` 是**下给 systemd 的指令**。

所以，现在我们使用的`nginx`就是在委托给`systemd`运行的。

### Nginx 自己也能跑，为什么还要委托

**Nginx 并非离了 systemd 就不能运行。** 我们也可以这样启停Nginx：

```bash
sudo nginx              # 启动
sudo nginx -s reload    # 重载配置
sudo nginx -s stop      # 停
```

> 知道有这么回事就行，别真在你服务器上敲这几句——Nginx 这会儿正由 systemd 管着，手工再起一个只会撞端口。

Nginx本身自己就带有一套终端命令，就和`Uvicorn`或者`FastAPI`一样（`fastapi dev`和`fastapi run`的背后也是`Uvicorn`）。但是自带的这套命令，管的只是"怎么起、怎么停"，却没有systemd那些高阶管理能力。

对于程序自带的命令和systemd的分工可以这样理解：

**程序自带的命令管的是"怎么起、怎么停"；委托给 systemd之后，管的是"开机拉起它、崩了重启它、记录它的运行日志"（当然背后还是要依赖程序自带的命令）。**

### Nginx 是怎么委托的

委托不是一句口头交代，得**明确写一个文件交给 systemd**，告诉它这个程序该怎么运行，以及我们希望 systemd 怎么帮我们管。写的这份文件就叫 **service 文件**。

Nginx 那份service文件就在我们的服务器上，可以用下面这个命令查看：

```bash
systemctl cat nginx
```

> 内容一屏放不下时，会进入分页器，这个时候可以用方向键 ↑↓ 一行一行翻，也可以用**空格**往下翻一页、**`b`** 往上翻一页，看完按 **`q`** 退出。

会打出一份如下所示的文件（版本不同，内容可能略有出入）：

```ini
# /lib/systemd/system/nginx.service
[Unit]
Description=A high performance web server and a reverse proxy server
...

[Service]
Type=forking
ExecStart=/usr/sbin/nginx -g 'daemon on; master_process on;'
ExecReload=/usr/sbin/nginx -g 'daemon on; master_process on;' -s reload
...

[Install]
WantedBy=multi-user.target
```

**看一下整体结构。** 不管多复杂的 service 文件，都是这三段，各回答一个问题：

| 段           | 回答的问题                                 |
| ----------- | ------------------------------------- |
| `[Unit]`    | **这是个什么服务**——叫什么名字、和别的服务什么关系          |
| `[Service]` | **怎么跑它**——用哪条命令、什么身份、挂了怎么办。**这一段是主角** |
| `[Install]` | **什么时候把它带起来**——"开机自启"就在这儿             |

我们不需要完全弄懂这个配置文件怎么写，需要的时候可以让AI帮我们，眼下可以大致挑两行重要的看一看：

- **`ExecStart=`**——拉起 Nginx 的那条命令。**Nginx 也不过是被一条普通命令拉起来的**，和我们之前用的 `nohup .venv/bin/fastapi run ...` 里的命令没有本质区别；
- **`WantedBy=multi-user.target`**——**"开机自启"就是从这一行来的。** 因为写了这一行，每次开机的时候Nginx就会自动启动了。

每个程序支持的命令都不一样，所以委托给systemd的时候写的service必然也不一样，有时候可能会写的很长，**但基本都是在围绕那个程序的命令而写，整体骨架就那么几行。**

接下来，我们可以试着把我们的后端程序也委托给systemd。

### 如何写service文件

委托的手续，就是写一份**我们自己的 service 文件**，放进 systemd 指定的目录 `/etc/systemd/system/`，文件后缀是`.service`，这个文件我们可以自己命名，别跟机器上已有的服务重名就行。

我们为后端程序创建一个名为`zero-backend.service`的文件：

```bash
sudo vim /etc/systemd/system/zero-backend.service
```

创建完这个service文件之后，就可以在其中写如下内容：

> 注意，如果你的服务器上项目的工作目录不是`/home/ubuntu/zero-to-tech/`，或者登录服务器的用户名不是 `ubuntu`，你要根据实际情况来改

```ini
[Unit]
Description=zero-to-tech backend

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/zero-to-tech/backend
ExecStart=/home/ubuntu/zero-to-tech/backend/.venv/bin/fastapi run
Restart=always

[Install]
WantedBy=multi-user.target
```

一共就六行有内容的，逐行看一看（不用记，了解一下就行，真写的时候让AI写）：

- **`Description`**——给人看的名字，待会儿查状态时它会打印出来；
- **`User`**——**用谁的身份跑**。这一行不写的话systemd 默认用 **root**。但我建议不要用root，我们的项目**用不着这么大的权限。** 权限的配置遵循**最小权限**原则——**够用就好，不多给**。
- **`WorkingDirectory`**——工作目录。**这行不能省**，而且要用绝对路径。
- **`ExecStart`**——拉起服务的完整命令。注意写的是 **`.venv` 里的绝对路径**，这里没有"先 activate"这一步。因为**直接指名道姓用哪一份 `fastapi`** 了。而 activate 不过也就是让**终端**优先用 `.venv` 里的那套命令，便于找到这个`fastapi`而已，一样的；
- **`Restart=always`**——进程一死，立刻再拉起来。
- **`WantedBy=multi-user.target`**——刚在 `Nginx` 那份 service 文件里见过它：意思是"开机自动启动"。

### 通过service文件启用委托

service文件写好之后，就可以把我们的后端程序委托给systemd了。需要执行如下四行命令：

> 注意，如果你刚才给service文件命名不是`zero-backend.service`，你要根据实际情况来改

```bash
sudo systemctl daemon-reload          # 新增了 service 文件，让 systemd 重新读一遍
sudo systemctl start zero-backend     # 启动
sudo systemctl status zero-backend    # 查状态
sudo systemctl enable zero-backend    # 开机自启（就是 WantedBy 那行生效）
```

`status` 会打出这样一段（示意，以你实机为准）：

```text
● zero-backend.service - zero-to-tech backend
     Loaded: loaded (/etc/systemd/system/zero-backend.service; enabled; ...)
     Active: active (running) since ...
   Main PID: 12345 (fastapi)
```

看到那行**绿色的 `active (running)`** 就说明已经委托systemd启动成功了。

此时打开浏览器操作一下文字实验室，会发现**分析功能回来了。** 同一个后端，同样的功能，只是这一次是 systemd在帮我们运行。

接下来做一件很厉害的事情：`status` 里那个 `Main PID` 就是进程号，我们亲手把它杀了：

```bash
sudo kill 进程号          # 换成你看到的 Main PID
```

再通过下面这行命令看状态：

```bash
sudo systemctl status zero-backend
```

此时的状态应该**还是 `active (running)`，但 Main PID 换了一个新号码**。这说明进程确实死过，systemd 立刻拉起了一个新的。这就是 `Restart=always`：**崩溃自愈**。以后代码里万一有 bug 把进程弄死了，服务自己会爬起来。

### 用 systemctl 指挥后端程序

委托出去之后，这个后端的日常管理就**全用 `systemctl` 执行**了。有几条常用管理命令，现在挨个试一遍：

| 想干什么        | 命令                                               |
| ----------- | ------------------------------------------------ |
| 看它活着没有      | `sudo systemctl status zero-backend`             |
| 改完代码，重启     | `sudo systemctl restart zero-backend`            |
| 停掉它         | `sudo systemctl stop zero-backend`               |
| 再起来         | `sudo systemctl start zero-backend`              |
| 开机自启 / 取消自启 | `sudo systemctl enable` / `disable zero-backend` |
| 看日志         | `journalctl -u zero-backend -f`                  |

注意，这个表里列出来的`stop`命令，它和刚才`kill`进程号的那种方式不同，这里如果执行`sudo systemctl stop zero-backend`来停掉程序的话，就是真的停掉了，不会自动拉起。除非再通过`sudo systemctl start zero-backend`启动。

可以用下面的命令分别停掉、拉起试一试：

```bash
sudo systemctl stop zero-backend
curl localhost:8000/api/profile
# curl: (7) Failed to connect ... Connection refused    ← 真的停了

sudo systemctl start zero-backend
curl localhost:8000/api/profile
# JSON 回来了
```

### 后端程序日志

后端程序启动起来之后，我们经常会需要看看它在干什么——来了哪些请求、有没有报错。这个需求就通过日志来实现。我们目前已经见过几种日志形式：

**第一种：实时显示。**

我们在本地开发的时候，在终端里敲 `fastapi dev`，然后那个终端就被它占住了。每来一个请求，屏幕上就多一行；代码里 `print` 的东西、出错时的 traceback，也都直接打在那儿。那时候"看日志"这件事根本不需要学，只要终端在，**日志就一直在我们眼前滚**。

但代价就是**我们必须一直开着那个窗口**，而且窗口一关，之前滚过的日志就全没了。所以这种方式可以算是一种比较落后的方式，正式上线运行肯定不推荐。

**第二种：写进文件。** 

用`nohup`把服务丢到后台之后，终端没了，输出就没地方去了。所以那条命令里专门有一截是管这个的：

```bash
nohup .venv/bin/fastapi run > backend.log 2>&1 &
#                           └──────┬──────┘
#                         把输出接进 backend.log
```

`>` 把正常输出重定向进文件，`2>&1` 让错误输出也跟着进同一个文件（上一节讲过）。然后可以用 `cat backend.log`或者 `tail -f backend.log` 去看。

这样做的好处是日志能留存下来。但我们得一直管理它，比如说写到哪儿、叫什么名字、什么时候清理，全得自己记着、自己管。它还会一天天涨下去，没人帮我们收拾。

**第三种：交给 systemd。** 

systemd会自动帮我们管日志。这正是"委托"的意思：把程序交出去，连带程序的日志一起委托。而且这套日志有容量上限，旧的会被自动清理，不会像 `backend.log` 那样一直涨。

#### 怎么看

看 systemd 管理的日志，用的命令叫 **`journalctl`**（journal 是"日志"，加上 ctl 就是"日志控制"，和 `systemctl` 是一家的）：

```bash
journalctl -u zero-backend            # 这个服务的日志，从头看
journalctl -u zero-backend -n 50      # 只看最后 50 行
journalctl -u zero-backend -f         # 实时跟随，新日志一出现就打出来
```

**`-u` 是必须的参数**（u = unit）。后面跟的名字，就是我们给 service 文件起的那个 `zero-backend`，意思就是指定看`zero-backend`的日志。

#### `-f` 是什么感觉

`-f` 是 **follow**（跟随）。这个参数值得单独试一次，因为它的行为和我们敲过的其它命令都不一样：

```bash
journalctl -u zero-backend -f
```

敲下回车，会打出最近的几行，然后——**光标停在那儿不动了，命令提示符也不回来。**

**这不是卡住了。** 它在等，等后端下一次开口说话。现在别关这个窗口，切到浏览器去点一次"分析"，再切回来看：**终端里立刻多出了一行。** 这次分析请求，被它当场记了下来。

看完按 **`Ctrl + C`** 退出，提示符就回来了。

> 不带 `-f` 的 `journalctl`，日志多的时候也会进入前面看 service 文件时那个**分页器**，操作一样，看完按 **`q`** 退出。

#### 顺手清掉旧的日志文件

既然日志已经归 systemd 管了，`backend.log` 就成了一份永远不会再更新的旧账——**留着只会骗到以后的你**（某天你去查看它，看到的却是很久以前的内容，然后开始怀疑人生）。此时最好的做法就是删掉它。

在服务器上执行：

```bash
rm ~/zero-to-tech/backend/backend.log
```

---

## 第二笔：Nginx 与反向代理

现在我们前后端服务的工作模式是这样的：前端的页面由 **Nginx** 送出去，它监听 80 端口；后端由 **Uvicorn** 跑着，它监听 8000 端口；而这两个进程，**背后都归 systemd 管着了**。

Nginx 和 Uvicorn 这种能够监听端口、对外提供服务的程序，有时候也会被叫做**服务器**（但这种语境下指的是软件，不是硬件）。

### Nginx 与 Uvicorn 的分工

看似 `Nginx` 和 `Uvicorn` 干着类似的事情，**都在监听一个端口、都在接 HTTP 请求、都在返回响应**，但是它们擅长的事情并不一样。

- **Nginx** 的看家本领是**从磁盘上找文件送出去**。围绕"把东西送给外面的人"这件事，它还攒了一整套配套工具——记访客日志的、加密的、压缩的、挡在最前面的；
- **Uvicorn** 的本领是**跑我们写的 Python**。它存在的全部意义就是把请求交给 `main.py`，把算出来的结果带回去。

一句话总结就是：**Nginx 擅长"对外"，Uvicorn 擅长"算"。**

关于“对外”，这里列了它们的一些对比：

|                | Nginx                  | Uvicorn                    |
| -------------- | ---------------------- | -------------------------- |
| **访客日志**（谁来过、从哪来、看了什么） | 逐条记下来源页面、什么浏览器、传了多少字节  | 没有单独的一份             |
| **加密**（HTTPS）  | 比较方便，一条命令即可            | 自己塞证书、自己管理续期               |
| **提速**（压缩、长缓存） | 现成的，开一下就有              | 没有                         |
| **挡在最前面**      | **这就是它的主业**，二十多年只干这一件事 | 能胜任，但属于“兼职”，本职是跑我们的 Python |

> 这里的"日志"和前面 `journalctl` 看的不是一种。systemd 收着的是**运行日志**：程序自己在干嘛、有没有报错、traceback 是什么。这一行比的是**访客日志**（正式叫法是访问日志，access log）：谁来访问过网站、从哪个页面来、用什么浏览器、传了多少数据。
>
> Nginx 自己单独会写一份访客日志，存在 `/var/log/nginx/access.log`，跟 systemd 无关。Uvicorn 目前没有单独的访客日志，只有systemd的运行日志。

**Nginx 样样都有，Uvicorn 样样都差点意思。** 这不怪 Uvicorn，因为它的对手太专业了。

Nginx 二十多年来就干一件事：**站在最前面**，接住来自互联网上的、什么样都有的请求。这是它的主业，也是它唯一的主业，所以它有一系列的配套手段。

> 你或许会想，能不能不用Uvicorn了，后端也给Nginx跑呢？这不行。Nginx不会跑Python代码，它只擅长做“门房”，不会做业务处理。

如果我们想要让后端服务也用到Nginx的这些能力，那就可以考虑换一下分工：

- **对外的事** → 全归 Nginx
- **算的事** → 全归 Uvicorn

也就是说，两个程序都还在，只是把"对外"这一整块，**从兼职的Uvicorn手里收回来，交给专职的Nginx**。

Nginx 其实**会两件事**：

1. 从磁盘上找文件送出去（我们在做前端部署的时候一直在用这种方式）；
2. 把收到的请求，原样转交给另一个程序，再把回来的结果带出去（我们还没用过）。

第二件就是这一节的关键——**Nginx自己算不了，但它可以站在门口接收用户请求，再派给Uvicorn** ：

> **Nginx 当门房**——守着 80 端口，静态文件自己送，遇到该后端管的请求就转交进屋；
> **Uvicorn 当算手**——在屋里只管跑 Python，只对接Nginx，不直接见公网。

注意这套分工里**没有谁被替代**，Uvicorn 还在服务器内部运行着，只是从今往后，所有找它的请求都得先过Nginx那一关。

### 配置反向代理

具体到我们这个项目中应该怎么做呢？Nginx同时监听80端口和8000端口，然后80端口过来的就给前端，8000端口过来的就给Uvicorn吗？

**不是。**

我们看一下，当用户请求前端的时候，URL都长什么样：

```
/
/text-lab
```

后端呢？URL是这样
```
/api/profile
/api/analyze
/api/history
```

> 除了 `/api/` 开头的这些，FastAPI 还自带了 `/docs` 之类的调试入口——那是给我们开发时用的，**不该对公网开放**。这个顾虑，等下配完就自然解决了。

所以，我们可以这样处理：

Nginx只监听80端口，但是如果是直接访问 `/` 或者 `/xxx`的，就找静态文件，如果是访问`/api/xxx`的，就转发给Uvicorn. 同时Uvicorn仍然监听8000端口，只是这个8000端口就不对外了。

接下来，我们就去Nginx的配置文件里开始做这件事：

```bash
sudo vim /etc/nginx/sites-enabled/default
```

在 server 块里**新增一个 location**，其余一字不动：

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /home/ubuntu/zero-to-tech/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /api/ {                          # ← 新增：路径以 /api/ 开头的请求
        proxy_pass http://127.0.0.1:8000;     # ← 别找文件了，原样转给本机 8000

        proxy_set_header Host              $host;              # 访客敲的是哪个地址
        proxy_set_header X-Real-IP         $remote_addr;       # 访客的真实 IP
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;            # 访客走的是 http 还是 https
    }
}
```

新规则怎么读：**凡是路径以 `/api/` 开头的请求，不要在磁盘上找文件，原样转给 `127.0.0.1:8000`（我们的后端），拿到响应再原样带回给访客**。其余请求不受影响，照旧走 `location /` 找静态文件。一个 server，两个角色，按路径分工。

> 注意`proxy_pass` 的值是 `http://127.0.0.1:8000`，千万别写成`http://127.0.0.1:8000/`（带斜杠） ，会导致**全线 404**。不带斜杠才是原样转发。以后在别处抄 Nginx 配置，这个地方要注意。

顺带，刚才那个顾虑也解决了：**只有 `/api/` 开头的请求会被转进后端**，`/docs` 这类入口会被解析到 `location /`，在静态目录里找不到对应文件，直接 404——**它们从公网已经够不着了。**

> **为什么要多写那四行 `proxy_set_header`？因为转手一次，有些东西会丢。** 比如说每个请求是从哪儿来的、访客敲的是哪个域名、访客走的是 http 还是 https。
>
> 这四行做的事，就是**让 Nginx 在转交之前，把这些信息写成几个额外的请求头一起递进去**——真实 IP、原来的协议、原来的域名、完整的转手链路。名字前面那个 `X-` 是个老约定，意思是"这不是 HTTP 规范里的标准头，是大家约好这么用的"。**它们就是几行普通的请求头**。


刚配出来的这个角色，有个正式名字：**反向代理（reverse proxy）**。

为什么叫这个名字呢？我们逐词看一下：

**"代理"** 就是替人转发请求；
**"反向"** 指它站在**服务器一侧**做转发请求（如果是站在使用者一侧、替人上网的那种，叫正向代理，比如有些公司要求员工上网先过公司的代理服务器）。

Nginx 这种显然是在服务器上做转发，所以就叫反向代理。

配置完成反向代理之后，检查语法并且让 Nginx 重读配置：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

服务器本机验证：

```bash
curl localhost/api/profile
```

JSON 回来了。注意这次 **localhost 后面没写端口**（不写就是 80）。而这次请求，经历的路径就是：

> curl → **Nginx（80）** → **Uvicorn（8000）** → 原路返回

再换我们自己本地电脑，浏览器访问 `http://服务器IP/api/profile`

如果再次不带8000端口就已经跑通了，那么说明我们的反向代理配置就完成了。

### 让 8000 不再对外

现在所有的用户请求都可以走80端口这个正门了，那扇偏门（8000端口）就不该再对外开着了。注意，8000 并没有关——Uvicorn 照样在 8000 上跑，只是从今往后，只有同一台机器上的 Nginx 找得到它。分两步操作：

**第一步：让后端只听本机。**

我们的后端这会儿还听着 `0.0.0.0`——`fastapi run` 的默认值。上一节讲过，与`127.0.0.1`相比，`0.0.0.0`的能力在于可以接收所有网卡，对外敞开。

可是有了Nginx的反向代理，这个后端变成了只服务同一台机器上的 Nginx。外面的访客再也不会直接跟它说话了。

那就回去改 service 文件，给 `ExecStart` 添一个参数：

```bash
sudo vim /etc/systemd/system/zero-backend.service
```

```ini
ExecStart=/home/ubuntu/zero-to-tech/backend/.venv/bin/fastapi run --host 127.0.0.1
```

**改完 service 文件，重新加载并启动**：

```bash
sudo systemctl daemon-reload      # service 文件改了，让 systemd 重新读一遍
sudo systemctl restart zero-backend
```

改完这一步之后，如果在服务器本机执行 `curl localhost/api/profile` ，应该还可以照常回 JSON。在服务器本机执行`curl localhost:8000/api/profile`应该也可以照常返回JSON。

但如果换成我们本地的电脑，直接敲 `http://服务器IP:8000/api/profile`，就会**连不上了**。

>此时，我们的文字实验室应该也不能正常分析文字了，因为前端页面还在试图用公网访问8000端口的方式请求后端接口，自然是不通的。等会儿“第三笔”我们就修复这个问题。

**第二步：把安全组/防火墙的 8000 删掉。**

**去云服务器厂商的控制台，把安全组里 8000 的放行规则删掉。**

虽然上一步已经从Uvicorn上改成了监听`127.0.0.1`，只服务本机来的请求，安全组或者防火墙这一侧仍然很有必要再把8000挡在外面。安全无小事，这叫**纵深防御**——别把安全押在单独一道防线上。

经过这样改造之后，前后端同源的条件就具备了：同样的协议(http)，同样的域(同一台服务器的ip)，同样的端口(80)。就差前端配置里那个地址还指着 8000。

---

## 第三笔：前端切生产，把地址整个删掉

因为做了反向代理，现在8000端口不再对外了，但是前端配置文件`.env.production`还是写的老地址：

```text
NEXT_PUBLIC_API_BASE_URL=http://服务器IP:8000
```

我们可以把端口去掉，给它改成：

```text
NEXT_PUBLIC_API_BASE_URL=http://服务器IP
```

这没有问题，不过，我推荐一个更省心的写法：

```text
NEXT_PUBLIC_API_BASE_URL=
```

值留空，`API` 就是空字符串，代码里的 `` `${API}/api/profile` `` 就成了 `/api/profile`——一个**相对路径**。浏览器看到相对路径，会自动补上**当前页面的源**。而我们现在前后端是同源的，自动补上的源也能够访问正确的后端地址。

为什么这么做省心呢？并不仅仅是因为少写了几个字，而是因为后续我们还有很多东西会换：

- IP地址要换成域名
- `http`要换成`https`

直接这样空着，以后就不用再来改了。

现在服务器上改了配置，所以服务器上的前端需要重新构建一下

```bash
cd ~/zero-to-tech
npm run build
```

至此，今天的重构就完成了。

---

## 验证成果

再次访问我们的线上网站 `http://服务器IP/`

分析、拼音、历史记录，一样不少。**和上一节结尾看到的一模一样。**

这正是重点：**用户那一侧什么都没变，底下的地基却整个换了一遍。** 好的重构就该这样——外面看不出来，里面焕然一新。

那怎么证明它真的换了？我们可以分三处看。

**第一处：同源** 

在我们自己浏览器上用 F12 打开 Network 看一看：代码里写的是相对路径，所以请求的 URL **和地址栏里页面的地址同协议、同主机、同端口**，不再走 `:8000` 端口了。

点"分析"，Network 里也没有 `OPTIONS`类型的请求了，只剩一条干干净净的 `POST`。同源的请求，浏览器根本不需要先去问一句。

> 前后端同源了，但**`CORSMiddleware` 别删，`credentials: "include"` 也别删。** 虽然**线上不需要了**；但本地开发时 3000 → 8000 依然是跨源。
>
> 后端那份 `backend/.env` 里的 `ALLOWED_ORIGINS` 同理：线上再没有跨源请求来读它了，但它留着不碍事。


**第二处：8000 端口对外关闭了**

前面已经亲手砍过两刀：一刀在屋里（Uvicorn 只听 `127.0.0.1`），一刀在屋外（安全组删掉 8000）。从本地电脑再访问 `http://服务器IP:8000/api/profile`就连不上了。

**第三处：它自己会重启。** 

关掉 SSH 窗口，网站照常；在服务器上kill掉后端进程，很快又会起来；狠一点的，去云控制台**重启整台服务器**，它还会起来！

这些验证通过，我们的网站就算是真正稳健地完成部署了。

---

## 回头把 README 改了

README 应该是活的，它跟着项目一起长。**一份过时的 README 比没有更糟**。我们既然改了部署方式，那么README文件也需要更新。

README 里有两处要动：**「部署到服务器」整节重写**，**「配置说明」里前端那一行跟着改**。

先看部署那一节，换成下面这份：

````markdown
## 部署到服务器

前提：服务器上已装好 Python 3.10+、Node.js 18+ 和 Nginx。

**1. 拉取代码**

```bash
cd ~/zero-to-tech
git pull
```

**2. 前端：装依赖、写配置、构建**

```bash
npm install
cp .env.example .env.production   # 按下面「配置说明」填好（线上留空）
npm run build                     # 产物进 out/，由 Nginx 提供服务
```

**3. 后端：建环境、装依赖、写配置**

```bash
cd backend
python3 -m venv --prompt=zero-to-tech .venv   # 首次部署才需要
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env              # 按下面「配置说明」填好
```

**4. 后端：委托给 systemd**（首次部署才需要）

新建 `/etc/systemd/system/zero-backend.service`：

```ini
[Unit]
Description=zero-to-tech backend

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/zero-to-tech/backend
ExecStart=/home/ubuntu/zero-to-tech/backend/.venv/bin/fastapi run --host 127.0.0.1
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start zero-backend     # 启动
sudo systemctl enable zero-backend    # 开机自启
sudo systemctl status zero-backend    # 看到 active (running) 就对了
```

**5. Nginx：静态文件 ＋ `/api/` 反向代理**（首次部署才需要）

编辑 `/etc/nginx/sites-enabled/default`：

```nginx
server {
    listen 80 default_server;
    server_name _;

    root /home/ubuntu/zero-to-tech/out;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;     # 末尾不要加斜杠

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

**6. 安全组 / 防火墙**

只放行 **22（SSH）** 和 **80（HTTP）**。**8000 不要放行**——后端只监听 `127.0.0.1`，由 Nginx 转发进去。

**7. 验证**

```bash
curl localhost/api/profile        # 服务器本机，注意不带端口
```

浏览器访问 `http://服务器IP`，做一次分析、看一眼历史记录。换个无痕窗口再试，两边的历史应该互相看不到。

## 日常发布

```bash
cd ~/zero-to-tech
git pull

npm run build                          # 前端改了才需要
sudo systemctl restart zero-backend    # 后端改了才需要
```

## 常用运维命令

```bash
sudo systemctl status zero-backend     # 看状态
sudo systemctl restart zero-backend    # 重启
sudo systemctl stop zero-backend       # 停掉
journalctl -u zero-backend -f          # 实时看日志（Ctrl+C 退出）
journalctl -u zero-backend -n 50       # 看最后 50 行

sudo nginx -t                          # 改完 Nginx 配置先验语法
sudo systemctl reload nginx            # 再让它重读
```
````

再改「配置说明」里前端那一行——线上的值现在是**空的**：

````markdown
| 键 | 说明 | 本地 | 线上 |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | 后端接口地址 | `http://localhost:8000` | **留空**——前后端同源，代码里走相对路径 |
````

后端那份 `ALLOWED_ORIGINS` 不用动：线上虽然已经没有跨源请求了，但**这一行不填后端起不来**（代码里 `os.getenv("ALLOWED_ORIGINS")` 取不到就会报错），照旧填 `http://服务器IP`。


改完提交：

```bash
git add README.md
git commit -m "更新部署说明：systemd ＋ 反向代理 ＋ 同源"
git push
```


以后我们也值得养成这样的习惯，代码和部署方案换了，README就跟着换。这条规矩听着朴素，却是绝大多数项目文档烂掉的原因。**文档不是写完就归档的东西，它是项目的一部分**

---

## 结尾

现在的项目已经部署得很稳健了，但是还不是太体面，主要有两处问题：地址是一串IP，没人记得住；地址栏还标着"不安全"，等于是HTTP 明文裸奔。

下一节，我们就给网站接上**自己的域名**和 **HTTPS**。

---

[← 上一节：模块 7.1 先上线——最朴素的部署方案](/zero-to-fullstack/lessons/module-7-1/) | [下一节：模块 7.3 域名与 HTTPS →](/zero-to-fullstack/lessons/module-7-3/)
