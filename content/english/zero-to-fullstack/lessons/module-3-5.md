---
title: "模块 3.5：把网页发布到公网"
meta_title: ""
description: "把网页发布到公网：服务器 SSH 信任、git clone、读懂 Nginx 配置、修改 root、跑通一次完整的更新链路。"
date: 2026-06-01T00:00:00+08:00
image: "/images/module-3-5.webp"
categories: ["零到全栈"]
tags: ["部署", "Nginx", "服务器", "SSH", "Git"]
weight: 12
draft: false
---

> 把页面发布到公网，是"写代码"和"做了一个真实的东西"之间的那道门槛。

---

## 现在我们处在哪里

到这一节为止，你手里已经有这些东西了：

- **本地**：`~/zero-to-tech/` 文件夹里有 `index.html`、`style.css`、`script.js`，三个文件分工清楚
- **GitHub**：上面三个文件已经推送到了你的GitHub的 `zero-to-tech` 仓库里
- **服务器**：一台 Ubuntu 云服务器，Nginx 已经跑起来，公网 IP 用浏览器能访问

但你现在打开公网 IP，看到的还是 Nginx 默认的"Welcome to nginx!"那个欢迎页，**不是你写的页面**。

在这一节里，我们实现下面这个目标：

> 把这条链路接通——让任何人打开公网 IP，就能看到你写的那个卡片页面、点击按钮文字会变。

---

## 这条链路长什么样

先在脑子里建一张图，后面每一步对应到这张图的某一段：

```text
你的电脑                GitHub                 云服务器              浏览器
─────────              ─────────              ─────────            ─────────
index.html  ──push──>  zero-to-tech ──pull──> ~/zero-to-tech ──>  公网 IP
style.css                仓库                   ↑
script.js                                   Nginx 把这个目录
                                            当作网站的内容
```

这一节我们要做的，就是把中间那两段连起来：

1. 让服务器从 GitHub 把代码 `pull` 下来
2. 让 Nginx 知道"网站内容现在在新的目录里"

---

## 第 1 步：登录服务器

打开终端，用模块 2.4 里那条 SSH 命令登录：

```bash
ssh ubuntu@你的公网IP
```

关于远程登录服务器的操作，如果你已经不记得了，可以再看一下2.4那一节。

登录成功之后，终端提示符会变成 `ubuntu@your-server:~$`，而不再是你 Mac 上那个了。

从现在开始，**只要这一节里出现的命令前面没有特别说明，都是在服务器上执行的**。需要回到本地执行的命令，我会特别标注。

---

## 第 2 步：确认服务器上有 Git

服务器要能从 GitHub 拉代码，得先有 Git。先看一眼有没有：

```bash
git --version
```

Ubuntu 的云镜像通常会预装 Git，大概率你会看到类似 `git version 2.x.x` 的输出——说明已经装好了，直接跳到下一步。

如果看到的是 `command not found`，再装：

```bash
sudo apt update
sudo apt install -y git
```

第一行刷新软件源索引，第二行装 Git，`-y` 表示安装过程中遇到提示直接确认。

装完再跑一次 `git --version` 确认，你应该就可以看到git的版本号了，出现版本号就表示git已经安装好了。

---

## 第 3 步：让服务器和 GitHub 之间建立 SSH 信任

接下来要把 GitHub 上的代码拉到服务器。我们继续沿用模块 3.4 里建立的习惯——**通过 SSH 和 GitHub 对话**。

> **关于 HTTPS 和 SSH，多说一句**：
>
> GitHub 支持两种 clone 地址。
>
> - **HTTPS**（`https://github.com/...`）：如果你的仓库是 **Public**，clone 和 pull 不需要任何凭证，也就是说，你**可以直接跳过下面这一整步 SSH 配置**。但如果是 **Private**，HTTPS 每次 push / pull 都要你输用户名加一个 token，长期看比较烦。
> - **SSH**（`git@github.com:...`）：无论是Public还是Private，用ssh的话都需要先在这台机器上配一对 key、把公钥交给 GitHub，配过一次以后就一劳永逸。
>
> 我们这门课统一走 SSH，原因是：SSH 不分公私，配过一次就一劳永逸；而且和 3.4 里 Mac 上的流程一致。等以后你真的有 Private 项目，这套流程也是同一套，不用再换。

但这里有一个关键点：

> 每一台机器都需要有自己的一对 SSH key。你 Mac 上那对不能搬到服务器上来用。

所以模块 3.4 里在 Mac 上做过的事情，现在要**在服务器上原样再做一遍**。流程一模一样，命令也一模一样，只是这次是在 SSH 会话里、对着服务器执行。

### 生成 SSH key

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
```

连续几个提示一路回车就行。完成后，`~/.ssh/` 里会生成两个文件：

- `id_ed25519`：私钥，不要外传
- `id_ed25519.pub`：公钥，下一步要加到 GitHub

### 把公钥加到 GitHub

```bash
cat ~/.ssh/id_ed25519.pub
```

输出是一整行，以 `ssh-ed25519` 开头，以你的邮箱结尾。完整复制这一行。

然后到 GitHub：右上角头像 → **Settings** → 左侧 **SSH and GPG keys** → **New SSH key**。

- **Title** 建议写得能一眼区分出是哪台机器，比如 `云服务器-阿里云`，方便以后管理（GitHub 允许你挂多对 key，Mac 上那一对会继续保留）
- **Key** 粘贴刚才复制的公钥，保存

### 验证连通

回到你的远程服务器上，执行下面这个命令：

```bash
ssh -T git@github.com
```

第一次连接 GitHub 会问 `Are you sure you want to continue connecting?`，输入 `yes` 回车。

如果看到 `Hi 你的用户名! You've successfully authenticated`，就说明服务器和 GitHub 之间的 SSH 通道打通了。

---

## 第 4 步：把代码 clone 到服务器

我们 SSH 登录的是 `ubuntu` 用户，它有自己的家目录 `/home/ubuntu/`。把代码 clone 到这里。

```bash
cd ~
git clone git@github.com:你的用户名/zero-to-tech.git
```

注意几点：

- **用的是 SSH 地址 `git@github.com:...`，不是 HTTPS 地址**——这样以后 `git pull` 就不需要每次输密码或者 token，直接靠刚才配的 SSH key 自动通过。
- **不需要 `sudo`**。家目录是当前用户自己的地盘，写操作不需要任何额外权限。

执行完之后，看一眼：

```bash
ls ~/zero-to-tech
```

应该能看到 `index.html`、`style.css`、`script.js` 三个文件，和你本地一模一样。

这里有一个值得停下来注意的对应：

> 你 Mac 上是 `~/zero-to-tech`，服务器上也是 `~/zero-to-tech`。两边路径完全对称。

之所以能这样，是因为 `~` 代表"当前用户的家目录"——在 Mac 上是 `/Users/你的名字/`，在服务器上是 `/home/ubuntu/`。两边的真实路径不一样，但 `~/zero-to-tech` 这个写法在两边都成立。

---

## 第 5 步：看懂 Nginx 的配置文件

代码已经在服务器上了，但 Nginx 还不知道——它现在还指着默认欢迎页。

接下来这一步要修改 Nginx 的配置，让它指向我们的目录。但在动手改之前，**先花一点时间看懂这个配置文件**。只有理解了每一行在说什么，下一步的修改才不只是"照抄"，而是变成你真正学到的东西。

### 配置文件在哪

先到 Nginx 的配置目录看一眼。在终端里：

```bash
cd /etc/nginx/
ls
```

会看到这样一片东西：

```text
conf.d          koi-win            nginx.conf       sites-enabled
fastcgi.conf    mime.types         proxy_params     snippets
fastcgi_params  modules-available  scgi_params      uwsgi_params
koi-utf         modules-enabled    sites-available  win-utf
```

这里有几件事值得先说清楚。

**第一，这种目录结构是 Ubuntu / Debian 的惯例，不是 Nginx 本身的规定**。

Nginx 是跨平台软件，在不同 Linux 发行版（比如 CentOS、Alpine）里，配置目录的组织方式不一样。你现在看到的这种配置文件的组织形式，是 Ubuntu 的 Nginx 安装包替你做主的整理方案，Debian 系也是同一套。以后碰到非 Ubuntu / Debian 的服务器，配置目录可能完全长得不一样，需要看那台机器的具体情况。

**第二，真正的配置入口是 `nginx.conf`**。

Nginx 启动的时候，**只直接读 `nginx.conf` 这一个文件**。其他你看到的所有目录（`conf.d/`、`sites-enabled/` 等等），都是 `nginx.conf` 用 `include` 指令"包含"进来的。

这种一个主文件+包含其他文件的模式，其实你在[模块 3.2](/zero-to-fullstack/lessons/module-3-2/)里已经见过一次了——还记得吗？我们把 `index.html` / `style.css` / `script.js` 拆成三个文件之后，浏览器并不是直接加载这三个文件，而是只加载 `index.html` 一个；CSS 和 JS 是通过 `<link rel="stylesheet" href="style.css">` 和 `<script src="script.js"></script>` 标签，从 `index.html` 里"引"进来的。

`nginx.conf` 在 Nginx 这边扮演的就是 `index.html` 那个角色——它是唯一的入口，其他所有配置文件都是通过 `include` 被它"引"进来的。

我们打开它实际看一下：

```bash
cat /etc/nginx/nginx.conf
```

`cat` 出来内容不算少，但仔细看会发现里面**绝大部分是注释**（`#` 开头的行）。如果只看真正生效的部分，整个文件其实非常短：

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/access.log;

    gzip on;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

也就二十多行。结构上分三层：**最外面的全局指令** + 一个 `events { ... }` 块 + 一个 `http { ... }` 块。下面一段一段看。

#### 最外层：全局设置（现在可以看不懂）

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;
```

- **`user www-data`**：Nginx 进程以哪个 Linux 用户身份运行。后面如果碰到"浏览器返回 403 Forbidden、Nginx 读不了文件"这种问题，**根源就在这一行**——读文件的是 `www-data` 这个用户，目录或文件没给它读权限，就会 403。
- **`worker_processes auto`**：开几个工作进程，`auto` 表示和 CPU 核数一致。
- **`pid`**：进程 ID 写到哪个文件，给 `systemctl` 这类系统工具用。
- **`error_log`**：错误日志写到哪里，Nginx 出问题时第一时间去这个文件里看。
- **`include modules-enabled/*.conf`**：把动态模块的启用配置读进来——这是文件里第一个 `include`。

#### `events { ... }`：并发处理参数（也可以看不懂）

```nginx
events {
    worker_connections 768;
}
```

每个 worker 进程最多同时处理多少个连接，是性能调优参数，默认值就够用很久。

#### `http { ... }`：HTTP 服务的全部配置（只需要看懂最后一行）

最大的一块，**所有跟 HTTP 服务相关的设置都在这里**。挑几句说：

```nginx
include /etc/nginx/mime.types;
default_type application/octet-stream;
```

把刚才在 `ls` 里看到的 `mime.types` 读进来。这下你就知道 `mime.types` 是怎么"用上"的了——它就是被 `nginx.conf` `include` 进来的。`default_type` 是兜底：扩展名在 `mime.types` 里没有对应规则时，按"二进制流"返回。

```nginx
gzip on;
```

开启 Gzip 压缩，传输文件时自动压缩，省流量。

剩下的 `sendfile`、`tcp_nopush`、`ssl_protocols`、`access_log` 这些，要么是性能优化、要么是 HTTPS / 日志参数，有印象就行。

然后是 `http { ... }` 块**最关键的最后两句**：

```nginx
include /etc/nginx/conf.d/*.conf;
include /etc/nginx/sites-enabled/*;
```

**这两句，就是把整个 `/etc/nginx/` 目录串起来的关键**。一会儿我们要改的 `sites-enabled/default`，之所以能影响整个 Nginx 的行为——**根源就是 `nginx.conf` 在这里 `include` 了它**。

到这里你应该能把整张图在脑子里拼起来：

```text
nginx.conf  (Nginx 启动只读这一个)
  ├─ 顶层：user / worker / pid / error_log
  ├─ events { ... }      并发参数
  └─ http { ... }        HTTP 服务全配置
      ├─ include mime.types
      ├─ include conf.d/*.conf
      └─ include sites-enabled/*   ←  我们要改的网站配置就是从这里被串进来的
```

#### 文件最底下那段 `mail { ... }`

实际 `cat` 的时候，你还会看到文件最底下有一段以 `#` 开头的 `mail { ... }`——整段都是注释。Nginx 除了能做 HTTP 服务器，还能做 IMAP / POP3 邮件代理，那一段就是邮件代理功能的模板，默认整段注释掉了，我们也用不到，不用管它。

**第三，剩下的这些文件 / 目录，这门课里你都不需要碰**。但是大致认一下它们是干嘛的，以后看见也不会慌：

| 名称 | 做什么 |
|------|--------|
| `nginx.conf` | 配置总入口，Nginx 启动时唯一直接读的文件 |
| `sites-available/` | 所有"写出来"的网站配置（Ubuntu 惯例） |
| `sites-enabled/` | 当前"启用中"的网站配置（Ubuntu 惯例） |
| `conf.d/` | 额外的全局配置片段，`nginx.conf` 默认会 include 这里所有 `.conf` 文件 |
| `snippets/` | 可复用的配置片段，需要时自己 include 进来 |
| `modules-available/` / `modules-enabled/` | 动态模块的"可用 / 启用"，模式和 `sites-` 一样 |
| `mime.types` | 文件扩展名到 MIME 类型的映射表，告诉浏览器返回的是 html、png 还是别的 |
| `proxy_params` / `fastcgi_params` / `fastcgi.conf` / `scgi_params` / `uwsgi_params` | 反向代理到后端应用时常用的参数片段，需要时 include 即可 |
| `koi-utf` / `koi-win` / `win-utf` | 历史遗留的俄文 / Cyrillic 字符编码映射，几乎用不上 |

回到正题。**这一节我们只关心这两个**：

```text
/etc/nginx/sites-available/   ← 所有"写出来"的网站配置
/etc/nginx/sites-enabled/     ← 当前"启用中"的网站配置
```

这是一个常见的"草稿夹 / 生效夹"模式：

- `sites-available/` 里放的是你写过的**所有**网站配置，不管启不启用，都在这里留底
- `sites-enabled/` 里只放当前要让 Nginx 真正读到的那几个配置

但是 `sites-enabled/` 里的"文件"其实不是真正的文件，而是指向 `sites-available/` 里某个文件的**软链接（symlink）**——你可以理解为 Windows 里的"快捷方式"。换句话说：

> **改 `sites-enabled/default` 和改 `sites-available/default`，改的是同一份文件。**

这样设计的好处是：

- 想临时停掉一个网站，不用删配置，只要把 `sites-enabled/` 里的快捷方式删掉就行
- 以后想恢复，再把软链接挂回去就好

如果你想看清这个软链接的结构，可以执行：

```bash
ls -l /etc/nginx/sites-enabled/
```

输出大概长这样：

```text
default -> /etc/nginx/sites-available/default
```

那个箭头 `->` 就告诉你：`sites-enabled/default` 实际指向的是 `sites-available/default`。

刚装好的 Nginx 里只挂了 `default` 这一个，对应那个"Welcome to nginx!"欢迎页。看一眼它的内容：

```bash
cat /etc/nginx/sites-enabled/default
```

文件里有很多以 `#` 开头的行，这是 Nginx 的注释（不会被执行）。如果只看真正生效的部分，结构是这样的：

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

我们一段一段来看。

### `server { ... }`：一个网站的定义

最外层这一对大括号叫一个 **server 块**。可以这样理解：

> 一个 server 块 = 一个网站。

如果以后这台服务器上要同时跑多个网站（个人主页、博客 等），就会有多个 server 块并列存在。现在只有一个。

### `listen 80 default_server;`：监听哪个端口

`listen 80` 告诉 Nginx：**监听 80 端口**。

80 是 HTTP 的标准端口。浏览器里输入 `http://你的IP`，没写端口号，浏览器就默认连 80。这也是我们在模块 2.4 里特意放行的那个端口。

后面那个 `default_server` 表示"当没有其他 server 块匹配时，用我"——现在只有一个 server 块，写不写都没差别，但这是默认配置自带的，不用动它。

下一行 `listen [::]:80 default_server;` 是同一件事的 IPv6 版本，先不管。

### `root /var/www/html;`：去哪里找文件

**这是整个配置文件最关键的一行**。

它告诉 Nginx：**当有人来访问时，去 `/var/www/html` 这个目录里找文件返回**。

举几个例子：

- 用户访问 `http://你的IP/about.html` → Nginx 去找 `/var/www/html/about.html`
- 用户访问 `http://你的IP/css/main.css` → Nginx 去找 `/var/www/html/css/main.css`

`root` 就像是 Nginx 的"主目录"——所有 URL 路径都是从这里开始拼出实际的文件路径。

**这节课要做的修改，全部就在这一行上**：把它从 `/var/www/html` 改成 `/home/ubuntu/zero-to-tech`，让 Nginx 改去我们 clone 下来的目录里找文件。

### `index index.html index.htm index.nginx-debian.html;`：默认入口文件

这一行告诉 Nginx：**当用户访问的是一个目录而不是一个具体的文件时，用哪个文件代替**。

举个例子：

- 用户访问 `http://你的IP/`（最后是斜杠，访问的是根目录）
- Nginx 没办法返回一个目录，它必须返回一个文件
- 于是按这一行的顺序去找：先看有没有 `index.html`，没有再找 `index.htm`，再没有就找 `index.nginx-debian.html`

我们的项目里有 `index.html`，所以第一个就命中。

那个 `index.nginx-debian.html`，就是 Nginx 默认欢迎页的文件名——到这里你应该能完整地理解为什么之前打开公网 IP 看到的是欢迎页了：`root` 指向 `/var/www/html`，那个目录里恰好有 `index.nginx-debian.html`，Nginx 就把它返回了。

### `server_name _;`：响应哪个域名

这一行回答："**用户访问什么域名，我才响应？**"

如果你已经买了域名 `example.com`，这里会写 `server_name example.com;`，意思是"只有访问 example.com 的请求才走我这个 server 块"。

如果没有域名，只有 IP。这里就写一个 `_`，是一个占位符，表示"什么域名都接"。

### `location / { try_files $uri $uri/ =404; }`：路由规则

这里出现了一个新结构：**location 块**。

location 块是 Nginx 的"路由规则"，它的意思是：**对某一段 URL 路径，按某种方式处理**。

`location /` 表示"对所有路径都用这条规则"

`try_files $uri $uri/ =404;` 是这条规则的具体内容：

- 这一行的意思是：**先按用户要的路径找文件，找不到就当作目录找，再找不到就返回 404**

这是 Nginx 处理一个静态网站请求时最朴素的逻辑。

### 把这些拼起来

现在再回头看完整的 server 块，你应该能用自己的话翻译它：

> 这台机器监听 80 端口；所有请求都到 `/var/www/html` 目录里找文件；访问根目录就返回 `index.html`；什么域名都接；文件找不到就返回 404。

理解到这一步，下一步"改一行"才有它真正的意义。

---

## 第 6 步：把 root 改成我们自己的目录

用 vim 打开配置文件：

```bash
sudo vim /etc/nginx/sites-enabled/default
```

> 必须加 `sudo`，因为这个文件归 root 所有。

进入 vim 之后：

1. 按 `/` 进入搜索模式
2. 输入 `root /var`，回车
3. 光标会定位到 `root /var/www/html;` 那一行
4. 按 `i` 进入插入模式
5. 把 `/var/www/html` 改成 `/home/ubuntu/zero-to-tech`
6. 改完之后这一行应该是：`root /home/ubuntu/zero-to-tech;`
7. 按 `Esc` 退出插入模式
8. 输入 `:wq`，回车，保存并退出

> 这套 vim 流程和你之前在 2.4 那一节用过的一样：搜索定位 → `i` 插入 → 改 → `Esc` → `:wq`。

---

## 第 7 步：检查配置 + 让 Nginx 重新加载

Nginx 的配置改完之后，**不会立刻生效**。它还在按内存里加载的旧配置运行。

我们需要两步：先校验新配置的语法没问题，然后让 Nginx 重新加载。

**第一步：语法检查**

```bash
sudo nginx -t
```

正常情况下，你会看到：

```text
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

如果看到 `syntax is ok` 和 `test is successful`，就说明配置文件没写错。

如果有错，它会指出错在哪一行——回去用 `sudo vim` 改了再校验一次。**校验失败的时候千万不要直接 reload**，否则 Nginx 可能直接挂掉。

**第二步：重新加载**

```bash
sudo systemctl reload nginx
```

`reload` 和 `restart` 不一样：`reload` 是平滑加载新配置，不中断正在处理的连接；`restart` 是完全重启进程。我们这种情况用 `reload` 就够了。

这条命令没有任何输出，**没有输出就是成功**。

---

## 第 8 步：在浏览器里看见自己的页面

打开浏览器，地址栏输入：

```text
http://你的公网IP
```

> 注意是 `http://` 不是 `https://`。我们还没有配 SSL 证书，那是后面模块的事。

如果一切顺利，你会看到：

- 浅灰色的背景
- 屏幕正中央的白色卡片
- 卡片里的标题和段落
- 一个蓝色的"点我试试"按钮

**点一下按钮，文字会变成"你刚刚触发了一段 JavaScript。"**

这个瞬间值得停一下。

这意味着：你在自己电脑上写的代码，经过 GitHub 中转，跑到了一台远在云端的 Ubuntu 服务器上，再通过 Nginx 用 80 端口暴露给整个公网。世界上任何一个人，只要拿到这个 IP 地址，都能在他自己的浏览器里看到这个页面、点击这个按钮。

这就是"上线"。

---

## 第 9 步：体验一次完整的更新流程

代码上线之后，迟早会要改。我们走一遍标准流程。

**在本地（你的 Mac 上）**，打开 `~/zero-to-tech/index.html`，把里面那一句：

```html
<h1>你好，互联网</h1>
```

改成：

```html
<h1>你好，世界</h1>
```

保存。然后在本地终端执行：

```bash
cd ~/zero-to-tech
git add .
git commit -m "改一下标题"
git push
```

这一步把改动推到了 GitHub。但**服务器上的代码还没有变**——它不知道 GitHub 上发生了什么。

**回到服务器的终端**（也就是你那个 SSH 会话），执行：

```bash
cd ~/zero-to-tech
git pull
```

`git pull` 的意思就是"把远程仓库的最新代码拉下来"。

最后，**回到浏览器**，刷新一下公网 IP 的页面。

标题变成了"你好，世界"。

---

## 这套流程的肌肉记忆

以后每次你改完代码，要让公网生效，就这三段：

```bash
# 本地：保存 + 推送
git add .
git commit -m "写清楚这次改了什么"
git push
```

```bash
# 服务器（SSH 登录后）：拉取
cd ~/zero-to-tech
git pull
```

```text
# 浏览器：刷新
```

这就是最朴素的"持续部署"。后面的模块里我们会学到自动化方案，比如 GitHub 上一推送，服务器自己就去 pull——但本质就是把上面这三步交给机器来做。

---

## 常见问题排查

**问题 1：浏览器还是显示 Nginx 默认欢迎页**

最常见的原因是浏览器缓存。试试：

- 强制刷新：Mac 上 `Command + Shift + R`
- 或者用无痕窗口打开同一个地址

如果还不行，回到服务器 `cat /etc/nginx/sites-enabled/default`，看 `root` 那一行是不是真的改对了，以及有没有忘了执行 `sudo systemctl reload nginx`。

**问题 2：`sudo nginx -t` 报错**

错误信息会指明出错的文件和行号。最常见的几种：

- 漏了行尾的分号 `;`
- 路径写错了（比如多了空格、拼错了目录名）

把错误改掉，再校验一次。**不通过就不要 reload**。

**问题 3：浏览器显示 `403 Forbidden`**

这表示 Nginx 找到了配置、找到了目录，但读不了里面的文件。最常见的原因是家目录的权限不对：

```bash
ls -ld /home/ubuntu
```

输出应该是 `drwxr-xr-x`（也就是 `755`）。如果不是这样，Nginx 那个 `www-data` 用户就没办法进入这个目录。Ubuntu 用 `adduser` 创建的用户默认就是 `755`，正常情况下不会有这个问题。

**问题 4：`git pull` 报错说有冲突或者未提交的改动**

这通常是因为你**手动改了服务器上的文件**。记住一个原则：

> 服务器上的代码目录是 GitHub 的"镜像"，所有改动都应该在本地做，通过 push/pull 同步过去。服务器上不要手改文件。

如果已经改了，最简单的恢复方法是：

```bash
cd ~/zero-to-tech
git checkout .   # 丢弃本地未提交的改动
git pull
```

---

## 这节课结束时，你至少应该做到什么

- 服务器上 `~/zero-to-tech/` 里有完整的项目代码
- Nginx 配置里的 `root` 已指向新目录，并通过了 `nginx -t` 校验
- 浏览器访问公网 IP，能看到你写的卡片页面，按钮点击有响应
- 走通过一次"本地改 → push → 服务器 pull → 浏览器刷新"的完整更新
- 能说出 Nginx 配置里 `server`、`listen`、`root`、`index`、`server_name`、`location` 各自在做什么
- 能说出这条链路里：GitHub 在做什么、Nginx 在做什么、`git pull` 在做什么

---

## 这一模块到这里告一段落

到这一节为止，**模块 3 完整地交付了一件事**：

> 你写的代码，已经能被全世界看见了。

虽然这个页面还很简单——一张卡片、一个按钮、一行会变的文字——但你已经走通了"本地开发 → 版本管理 → 远程托管 → 服务器部署 → 公网访问"这条完整链路。这条链路本身，比任何一个具体页面都更有价值。

接下来的模块 4，我们会让前端"长大"：引入现代前端的工程化方式，让页面能承载更复杂的内容和交互。

---

[← 上一节：模块 3.4 GitHub 与远程同步](/zero-to-fullstack/lessons/module-3-4/) | [下一节：进入下一模块 →](/zero-to-fullstack/)
