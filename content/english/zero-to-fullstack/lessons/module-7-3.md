---
title: "模块 7.3：域名与 HTTPS"
meta_title: ""
description: "给网站买域名、配解析，让 Nginx 认领名字；看懂 HTTPS 的握手、证书和 CA，用 certbot 申请 Let's Encrypt 证书，再给 cookie 加上 Secure。"
date: 2026-10-19T00:00:00+08:00
categories: ["部署与运维上线"]
tags: ["部署", "域名", "DNS", "A 记录", "ICP 备案", "Punycode", "Nginx", "server_name", "default_server", "sites-available", "HTTPS", "TLS", "SSL 证书", "证书链", "CA", "Let's Encrypt", "certbot", "snap", "301 重定向", "Cookie", "Secure", "README", "全栈"]
weight: 32
draft: false
---

> 浏览器地址栏里出现自己的域名，"不安全"的标记消失，是我们这一节的目标。

---

## 域名和HTTPS

上一节收官时说网站能用了，但有两处不体面：

1. **地址是一串数字。** `http://120.55.66.77` 这种东西没人记得住；
2. **地址栏标着"不安全"。** 我们还在用 HTTP而不是HTTPS。

一个是**名字**问题，一个是**加密**问题，这一节分别解决。而且这两件事有顺序：**HTTPS需要证书，而我们本节用的证书是签给域名的**，所以必须先有域名，再上HTTPS。

---

## 细说域名

早在2.3那一节讲"输入网址后发生了什么"的时候，我们就说过IP和域名之间的关系，还把"输入网址之后"的整条链路走了一遍。

但当时我们没有把域名本身拆开看一看。今天要自己去买一个、自己去配解析，这一步就绕不过去了。

拿一个域名来拆——`www.example.com`

> `example.com` 是国际上专门留出来做示例用的域名，永远不会属于某个真实的主体，这里只是拿它举例。

**域名可以从右往左读**，越靠右级别越高：

```text
        www    .    example    .    com    [.]
         │              │             │      │
      三级域名       二级域名      顶级域名   根
     （子域名）      （我们买的）    （TLD）  （省略不写）
```

- **顶级域名（TLD）**：最右边那一截，`com`。它不是谁都能创造的，由国际机构统一管理。常见的分两类——一类是**通用顶级域名**，`.com`、`.net`、`.org`、`.xyz`、`.top`；另一类是**国家和地区顶级域名**，`.cn`（中国）、`.hk`（香港）、`.jp`（日本）；
- **二级域名**：`example` 这一截。**这就是我们花钱买的那一截**（多数情况下是这样），买域名，买的其实是"在某个顶级域名底下，占用某个名字"的登记权；
- **三级域名 / 子域名**：`www` 这一截。**它不用买**，域名到手之后，想加多少个都行：假如你已经买了`example.com`，那么`www.example.com`、`api.example.com`、`blog.example.com`对你来说就全是免费的，你可以创建很多个这样的子域名。

> 一个容易被绕晕的地方是，如果严格按层级数，`example.com` 是二级域名、`www.example.com` 是三级域名。但在国内的云控制台和日常口语里，大家通常把 `example.com` 叫"**主域名**"或"顶级域名"，把 `www.example.com`、`api.example.com` 这些叫"**二级域名**"。
>
> 两套叫法都会遇到，不用较真哪个更“正确”，**看清楚说的是哪一截就行。**

### 几种长得不太一样的域名

上面拆的是最标准的样子。实际逛一圈会发现，还有几种长得不太一样的，值得认一认。

**第一种：`.com.cn`、`.gov.cn` 这类"两截后缀"。**

拿 `example.com.cn` 从右往左读：`cn` 才是顶级域名，`com` 是 `.cn` 底下又分出来的一类，`example` 才是买的那一截。也就是说，在这类域名里，**我们买的那一截落到了第三级**。

这种情况下你可以把`.com.cn`理解为一个整体，因为 `.cn` 底下早年是按**类别**来分的：`.com.cn` 给商业机构，`.net.cn` 给网络服务，`.gov.cn` 给政府机关，`.edu.cn` 给教育机构……其中 `.com.cn`、`.net.cn` 这些，今天个人和企业都能买；而 `.gov.cn`、`.edu.cn` 只有政府机关、教育机构才能注册，普通人买不到。

这类"两截后缀"不止`.cn`，英国的 `.co.uk`、香港的 `.com.hk`，都是一个路数。

在买域名的时候，`.com.cn` 以及`.net.cn` 这些也都是作为一个整体列出来的。

**第二种：中文顶级域名。**

顶级域名也可以是中文：`.中国`、`.公司`、`.网络`，还有 `.我爱你` 这种挺有意思的。其中 `.中国` 和 `.cn` 一样，是中国的国家和地区顶级域名，只是换成了中文写法；`.公司`、`.我爱你` 这些则属于通用顶级域名。买法和英文后缀没有区别，在域名频道里一样能搜到。

**第三种：中文的名字。**

还有另一种情况：后缀还是 `.com`，买的那一截是中文。比如李勃老师自己的课件网站，域名就是 `李勃老师.com`。

上面的两种情况都出现了中文，其实除了中文之外，还有一些其他非英语国家会使用本国语言的域名，比如说日语、韩语、俄语等。但这里要知道一件事：**DNS 这套系统，从诞生起就只认英文字母、数字和连字符**，并不认识其他语言。那这类域名是怎么跑起来的呢？

这需要一次转写。比如说中文域名，在进入DNS系统的时候，中文的部分会按一套固定的规则（叫 **Punycode**）编码成只有字母和数字的样子，前面再加上 `xn--` 作为记号：

```text
李勃老师.com   →   xn--ygr25xpohxwz.com
example.中国   →   example.xn--fiqs8s
```

如果在浏览器中输入这样的域名，浏览器会替我们做这件事：在地址栏里显示的是中文，真正拿去查 DNS、写进请求头 `Host` 里的，是 `xn--` 那一串。

**在机器眼里（以及在开发者眼里），`xn--` 那一串才是它的真名。** 平时用户看不到这一串`xn--`开头的东西，但是作为开发者我们必须要理解其背后的原理。

>中文域名并不是一种主流的选择，了解一下即可。我自己的中文域名在使用的时候也会偶尔遇到一些意想不到的烦恼，但是现在再换也比较麻烦了...

### 为什么有的网址前面有 www，有的没有

这是个历史遗留。

早年一个机构里，不同的服务跑在不同的机器上：**网站**在一台机器上，**文件传输**在另一台，**邮件**又在第三台。于是就用最左边那一截来区分是哪台机器——网站那台叫 `www`（World Wide Web），文件那台叫 `ftp`，邮件那台叫 `mail`。

久而久之，就在人们心中形成了固有印象：网站就是`www`开头的。

今天的局面已经发生了很大的变化，一台服务器就能把这些全包了，`www` 这个前缀也就没了实际作用，纯粹是**看着眼熟**而已。所以我们会看到两种都有：有的网站主打带 www，有的不带。

但有一件事必须弄清楚，它会影响我们的操作：

> **在 DNS 眼里，`example.com` 和 `www.example.com` 是两个完全不同的名字。**

它们不会自动互通。要是只配了裸域名（不带 www 的 `example.com`），别人敲 `www.` 就打不开；反过来也一样。所以配DNS解析的时候，如果希望两种方式都能访问到同一个网站的话，那么**这两个名字要各配一条DNS记录**。

---

## 买一个属于自己的域名

**域名在哪买。** 各大云厂商都有域名频道（阿里云、腾讯云等），国外还有 Namecheap、GoDaddy 这些。对我们来说，**最顺的选择就是我们租服务器的那一家**——买域名、做解析、管服务器、办备案，同一个控制台全办了，省去来回切换。

**怎么买。** 流程比想象中简单，就四步：

1. **搜名字**——在域名频道的搜索框里输入想要的名字，它会列出各个后缀的价格和是否已被注册；
2. **挑后缀**——下面会详细说；
3. **下单付款**——按年付费，一次可以买多年；
4. **实名认证**——国内注册商按规定必须做，照控制台提示上传证件即可，一般当天就可以完成认证。**没做实名认证的域名用不了**，也没法备案。

**挑什么后缀。** 不同的后缀价格会有差异，常见后缀几十元一年。`.com` 最老牌、最通用，但稍贵；`.top`、`.xyz`、`.site` 这类便宜不少。

> **下单前注意看续费价。** 防范那些首年几块钱，第二年续费涨到几百的“刺客”。

**挑什么名字看个人喜好，别太长、好记、别撞人家的商标就可以。** 

---

## 域名备案

买完名字并没有结束，在国内制作网站有一个绕不开的事儿，就是ICP备案。

ICP 备案，全称"互联网信息服务备案"，是工信部的规定。**在中国大陆境内的服务器上提供网站服务，网站得先去登记备案。**

关于什么情况下要备案，什么情况下不用备案，判断标准只有一条——**看服务器在哪儿，不是看域名在哪儿买的**：

- 服务器在**中国大陆**（北京、上海、杭州、广州这些区域）→ **必须备案**；
- 服务器在**香港或海外** → **不需要备案**，域名配好解析当天就能用。

提交备案申请是通过**服务器所在的那家云服务商**提交，不是通过域名注册商（虽然常常是同一家）。控制台里都有"备案"入口，跟着引导走即可。

>考考你：如果你在阿里云买了一个域名，又在腾讯云上租了一台位于杭州的服务器上。想要把这个域名解析到这台服务器上，应该在阿里云做ICP备案还是在腾讯云做？

**要准备什么。**

- **主体证件**：个人用身份证，企业用营业执照；
- **域名**：必须已经实名认证，而且顶级域名要在工信部允许的范围内（常见后缀基本都在，冷门的要查一下）。备案填的是**主域名**——`example.com`，而不是 `www.example.com`；备好之后，`www`、`api` 这些子域名都跟着能用，不用一个个去备；
- **服务器**：得是大陆的，而且多数厂商要求剩余时长**三个月以上**；
- **核验**：现在基本都是用厂商的 App 做**人脸核验**（早些年要对着一块"幕布"拍照，现在一般不用了）。

**流程和时间。** 大致是：填资料 → **云厂商初审**（通常一两个工作日）→ 提交**省通信管理局** → 管局审核 → 下发**ICP 备案号**。

管局审核的时长各省不一样，以**工作日**计，一般几天，长的也有两周左右。具体以控制台里显示的进度为准。

**备案期间的域名访问会有限制。** 域名解析到大陆服务器上，**80 和 443 的网页访问会被拦下**——名字买了也暂时用不了。所以如果你在计划网站的上线时间点，那么需要把等待时间提前算进计划。

**拿到备案号之后**还有两件收尾的事：一是**在网站底部展示备案号**，并链接到工信部备案系统；二是部分省市还要求在拿到 ICP 号之后办**公安备案**，控制台一般会提醒。

所以摆在面前的是两条路，按自己的情况选：

| 路线             | 好处            | 代价                             |
| -------------- | ------------- | ------------------------------ |
| **大陆服务器 ＋ 备案** | 国内访问延迟最低、最稳   | 要等，而且等的这段时间网站通过域名打不开（可以通过IP打开） |
| **香港 / 海外服务器** | 免备案，域名配好当天就能用 | 国内访问延迟略高                       |

这不是技术问题，是流程现实——**两条路都是正当的**。

---

## DNS 登记的类型

域名买好了，接下来要做**域名解析**——说白了就是**在 DNS 那本全球通用的字典里，登记属于你自己的解析记录。**

一个域名可以登记多种**记录**，而记录是分类型的。控制台里那个"记录类型"下拉框，打开会看到一长串，常见的是这几个：

| 记录类型      | 登记的是什么                 | 什么时候用                                                         |
| --------- | ---------------------- | ------------------------------------------------------------- |
| **A**     | 这个名字对应哪个 **IPv4 地址**   | **我们要用的就是它**                                                  |
| **AAAA**  | 这个名字对应哪个 **IPv6 地址**   | 服务器有 IPv6 地址时才配                                               |
| **CNAME** | 这个名字是**另一个名字**的别名      | 指向第三方服务时常用（比如托管平台给你一个域名，你把自己的名字指过去）                           |
| **MX**    | 发给这个域名的**邮件**交给哪台服务器   | 想用 `你@自己域名` 收发邮件时配                                            |
| **TXT**   | 一段**任意文本**             | 最常见的用途是**证明"这个域名是我的"**——某个平台让你加一条指定内容的 TXT 记录，它去查到了，就认可你是域名主人 |
| **NS**    | 这个域名交给**哪几台 DNS 服务器**管 | 换解析服务商时才动，平时别碰                                                |

**我们该选哪个？** 我们的情况很清楚：有一台固定 IP 的服务器，要把名字指到那个 IP 上，这种情况下就用**A 记录**，没有第二个选项。

> **裸域名一般不能用 CNAME。** DNS 有条规矩：一个名字如果配了 CNAME，就不能再配别的记录了。而裸域名（`example.com`）身上必须挂着 NS 之类的记录，冲突，所以配不了。
>
> 各家云厂商为此搞了变通方案（叫"别名记录"或"CNAME 展平"之类的），效果等同于 CNAME。**我们用不上，知道有这么回事就行。**

---

## 动手解析 A 记录

道理讲完了，动手。假设名字已经能用了（该备案的已经备完），到域名控制台，找到**域名解析**（或叫"DNS 解析"），添加记录。

> **下面所有写着 `example.com` 的地方，都换成你自己买的那个域名。** 前面拿它举例是因为它是留作示例专用的，真敲进去是不行的。

刚才说过，`example.com` 和 `www.example.com` 在 DNS 眼里是两个名字，所以如果两个都想用，那就要**加两条**记录：

| 记录类型 | 主机记录  | 记录值      | 这一条管的是     |
| ---- | ----- | -------- | ---------- |
| A    | `@`   | 你的服务器 IP | `example.com`     |
| A    | `www` | 你的服务器 IP | `www.example.com` |

"主机记录"这一栏填的就是**最左边那一截**：填 `@` 是个约定，表示**裸域名本身**（什么都不加）；填 `www` 就是 `www.example.com`。

>如果想再加 `api.example.com`之类的，就照样式再来一条、主机记录填 `api` 就行，可以**随便加**。

保存，通常几分钟内它就生效。**可以在终端里用 ping 命令试一下是否生效**：

```bash
ping example.com
# PING example.com (120.55.66.77): 56 data bytes
# 64 bytes from 120.55.66.77: ...
```

看第一行括号里的 IP——**是不是你的服务器**？是，就成了。`www.example.com` 也照样 ping 一次，确认两条都生效了。

停一停品一下这个时刻：你输入的是**域名**，屏幕上出来的是 **IP**，这就是我们此前所说的 “DNS 负责把域名翻译成 IP”。

> **开着代理工具的同学注意**：代理可能接管域名解析，让 ping 显示一个假 IP（比如 `198.18.x.x` 开头的）。这种情况下关掉代理再试就可以看到正确的IP了。

现在浏览器直接访问 `http://example.com/`会通吗？会，但是 Nginx 那边我们还什么都没改，为什么就可以生效了？

这是因为 Nginx 的配置文件中没有指定域名。可以打开 `/etc/nginx/sites-available/default`看一看，开头是这样的：

```nginx
server {
	listen 80 default_server;
	listen [::]:80 default_server;

	root /home/ubuntu/zero-to-tech/out;

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

	server_name _;
	...
```

要读懂其中关键的两行，先得知道一件事：**一个 Nginx 可以同时托管好几个网站**，每个 `server { … }` 块就是一个网站。请求到了 80 端口，Nginx 得先决定交给哪个块处理，这个时候它看的是请求头里的 **`Host`**。浏览器在发起请求的时候，会把地址栏里的域名原样填到Host中。Nginx 拿 `Host` 去和每个块的 `server_name` 比对，对上谁，就交给谁。

带着这个规则，再看这两行：

- **`server_name _;`**——这个块的名字。`_` 并不是"通配符"，只是一个**故意起的、永远不会和真实域名对上的名字**，意思是"我暂时没有名字"。所以 `Host: example.com` 来了，它对不上；
- **`listen 80 default_server;`**——监听 80 端口，并且声明自己是这个端口上的**默认块**：所有名字都对不上的请求，一律交给它 **兜底**。下面那行 `listen [::]:80 default_server;` 意思一样，只是管的是 IPv6 的访问。

两行合起来，就是一个**没有名字、但负责兜底**的块。这台 Nginx 上又只有它一个块，于是不管 `Host` 写的是 `example.com`、`www.example.com`，还是一个IP地址，统统对不上名字，最终会统统落进这个兜底的块——**来者不拒**。

所以这个`/etc/nginx/sites-available/default`文件中的规则之所以能作用于我们的域名，仅仅是因为它是个“兜底”配置。

---

## 在 Nginx 上配置域名规则

把我们的网站的运行寄托在一个“兜底”方案上肯定不是一个好方法，接下来我们要为当前的域名专门写一个配置，当用户通过`example.com`和`www.example.com`访问的时候，就使用这个专门的配置，不再走兜底配置了。

>单独给域名写配置不只是为了更“优雅”，其实是必须要做的事情。因为等会儿我们申请 HTTPS 证书的时候，certbot 需要读 `server_name`。

一个nginx配置文件中支持写多个`server { … }` 块，所以如果我们不想要依赖兜底配置，那么我们可以在`/etc/nginx/sites-available/default`中给`example.com`和`www.example.com`写一个新的`server { … }` 块。

但其实我们有更好的做法——我们不把这个新的`server { … }` 块写在`/etc/nginx/sites-available/default`中，而是专门写到`/etc/nginx/sites-available/`目录下的一个新的文件里面，这个文件可以叫做`example.com`

这样做的好处是：
- 文件名称就有了语义，`default`文件放默认兜底配置，`example.com`文件放example.com这个域名的配置
- 我们能够通过`sites-available`和`sites-enabled`的机制更灵活地管理多个域名的网站，想要启用/停用哪个网站，就在`sites-enabled`中单独给这个配置文件创建/删除软链接

>考考你：你还记得`sites-available`和`sites-enabled`的关系吗？如果忘了，要再看一遍3.5那一节

这就动手干！

**第一步，复制一份，用域名命名：**

```bash
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/example.com
```

用 `cp` 而不是 `mv`：之前写的网站配置（`root`、`/api/` 转发）此刻都在 `default` 里，复制一份，`example.com` 就原封不动地继承了它们；`default` 本身留下来，待会儿改造成一个纯粹的兜底。

**第二步，在新文件里写域名匹配规则：**

```bash
sudo vim /etc/nginx/sites-available/example.com
```

要改的是开头这三行：

```nginx
listen 80;                                    # ← 去掉了 default_server;
listen [::]:80;                               # ← 去掉了 default_server;
...
server_name example.com www.example.com;      # ← 原来是 server_name _;
```

改了两件事：

- **认领域名**：占位符 `_` 换成真域名，**两个域名都写上**，空格隔开；
- **交出兜底职责**：去掉两行 `listen` 后面的 `default_server`。兜底的活儿归 `default`，`example.com`文件只管自己的两个名字（**同一个端口只能有一个兜底的块**）

其余一字不动。

> **如果买的是中文域名，这里要写 `xn--` 那一串。** 比如 `李勃老师.com`，这一行就得写成 `server_name xn--ygr25xpohxwz.com www.xn--ygr25xpohxwz.com;`

**第三步，把 `default` 改成纯粹的兜底：**

```bash
sudo vim /etc/nginx/sites-available/default
```

把原来的内容全部删掉（普通模式下敲 `ggdG`，能一口气删光全文），换成这几行：

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 404;                               # 名字对不上的，一律 404
}
```

还是那两行熟悉的兜底，只是兜住之后不再给出网站，而是一律回 `404`。

为什么不让 `default` 原样留着？兜底就该有个兜底的样子，应该只提供最简单的内容。最终被兜底的用户请求，**多半不是真正的访客。** 这些用 IP或者用一个对不上的名字找上门的，大多是全网扫描的程序。兜底块最好什么都不给，返回一个404足够了。

**第四步，启用新的：**

```bash
sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
```

`ln -s` 就是在`sites-enabled/`里给新文件建一个快捷方式。`default` 的快捷方式本来就在，不用动，它继续负责兜底。

**第五步，检查，生效：**

```bash
ls -l /etc/nginx/sites-enabled/
# default -> /etc/nginx/sites-available/default            ← 兜底
# example.com -> /etc/nginx/sites-available/example.com    ← 我们的网站
sudo nginx -t
sudo systemctl reload nginx
```

改完验证一下，名字匹配这回能亲眼看到了：

- 访问 `http://example.com`、`http://www.example.com`——网站照常打开。这回接待它们的是 `example.com` 那份配置；
- 访问 `http://服务器IP`——`404`。IP 对不上任何名字，落进了兜底的 `default`。

从 7.1 起一直在用的 IP 地址，从这一刻起不再是网站的入口了，域名才是。

从现在起，这个网站的配置就是 `/etc/nginx/sites-available/example.com`，以后要改，都改这一份。

---

## HTTPS：给内容加密

现在网站的所有内容都是通过HTTP在传输的，而HTTP 的请求和响应，就是几行**明文文本**——请求行、头、空行、正文，全是肉眼可读的字符。而这些字符从访客到我们的服务器，要途经一长串中间设备（路由器、运营商的机房……）。明文意味着：**沿途谁都能看，甚至能改**。所以现代浏览器会给HTTP打上“不安全”的提醒。

浏览器给 HTTP 网站标"不安全"，不是吓唬人。曾经许多网站都遭遇过流量劫持，开发者对此无能为力，甚至腾讯、字节等巨头公司的网站也遭遇过流量劫持。

>流量劫持的具像化：用户打开某个网站，右下角冒出一个小窗，可能是游戏广告，也可能是「您本月流量已使用 80%」。很多人以为是网站自己放的，其实网站根本没放。这都是网页在半路经过运营商的设备时，被劫持者塞进去的代码。

HTTPS可以有效杜绝这种情况，它可以给内容上一把「锁」：半路的设备看不懂内容，也没法往里塞东西。

**HTTPS = HTTP ＋ 加密层**。它解决三件事：

1. **加密**——内容在路上是密文，沿途看不懂；
2. **防篡改**——内容被改动会立刻被发现；
3. **身份**——**证书**证明"这个域名背后的服务器确实是它本人"，证书由浏览器信任的机构签发。

这三件事只是看概念的话还有点抽象，接下来我们就找一把现成的「锁」，亲眼看看它是怎么落实的。

---

## 先看一把现成的锁

现成的锁，可以用任意一个HTTPS网站来看，我们接下来就用李勃老师的课件网站：`https://李勃老师.com`来举例。

### 在浏览器里看

**第一处：地址栏左边的图标。** 打开网站，点地址栏最左边那个图标。在 Chrome 里，它已经不是一把小锁了，而是一个像两个滑块的"调节"图标；点开之后，第一行"连接是安全的"前面，才是那把小锁（Safari、Firefox 里交互方式可能会不同）。

![](/images/module-7-3-chrome-site-info.webp)

接着点"连接是安全的"→"证书有效"，会弹出这张证书的详情：
![](/images/module-7-3-cert-viewer.webp)

- **颁发对象**：`xn--ygr25xpohxwz.com`——眼熟吗？就是 `李勃老师.com` 在机器眼里的真名；
- **颁发者**：Let's Encrypt；
- **有效期**：从哪天到哪天，算一下，正好 90 天。

这就是**证书**——网站的身份证。

**第二处：DevTools 的 Security 面板。** F12，在顶上那排标签里找 **Security**（没看到就点 `>>` 展开；中文界面里叫「安全」）。
![](/images/module-7-3-devtools-security.webp)

最上面一行绿字：**This page is secure (valid HTTPS)**。下面三条，前两条正好对上前面那三件事：

- **Certificate - valid and trusted**：证书有效、受信任，签发者是 `YE2`（Let's Encrypt 旗下的一张签发证书）——这是"身份"。点 **View certificate**，打开的就是刚才那张证书详情；
- **Connection - secure connection settings**：连接用 **TLS 1.3** 加密，并且验证过身份——这是"加密"和"防篡改"。TLS 就是 HTTPS 里那层加密的名字，后面还会细说；跟在后面的 `X25519`、`AES_128_GCM` 是具体用的加密算法，认脸即可；
- **Resources - all served securely**：页面里的所有资源都走了 HTTPS，没有夹带走 http 的内容（一个网站的资源很多，有时候并非每一个资源都走了HTTPS）。

**第三处：Network 里的时间线。** 刷新页面，点开第一个请求，切到 **Timing** 标签，会看到一段叫 **SSL** 的时间——这是浏览器和服务器在**建立加密连接**。
![](/images/module-7-3-devtools-timing.webp)
这次请求之后，后续的请求应该就没有这一段了，这是因为加密连接建好之后，后面的请求直接复用，不用再建一次。

> 你可能会问为何在浏览器的Network中看到的每一个请求和响应都是明文，并不像是已经加密了。这是因为DevTools 长在浏览器**里面**，它看到的是浏览器加密之前、解密之后的样子。真正在路上跑的，是一团谁也读不懂的密文。

### 在终端里看

我们再用curl看一下：

```bash
curl -v https://xn--ygr25xpohxwz.com/
```

> 注意这里写的是 `xn--` 那一串：macOS 自带的 curl 不认中文域名，直接写 `李勃老师.com` 会报错。

![](/images/module-7-3-curl-verbose.webp)
从输出里挑出这些行：

```text
* Connected to xn--ygr25xpohxwz.com (...) port 443
* (304) (OUT), TLS handshake, Client hello (1):
* (304) (IN), TLS handshake, Server hello (2):
* (304) (IN), TLS handshake, Certificate (11):
* (304) (IN), TLS handshake, CERT verify (15):
* (304) (IN), TLS handshake, Finished (20):
* (304) (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256
* Server certificate:
*  subject: CN=xn--ygr25xpohxwz.com
*  start date: Aug 14 12:14:37 2026 GMT
*  expire date: Nov 12 12:14:36 2026 GMT
*  subjectAltName: host "xn--ygr25xpohxwz.com" matched cert's "xn--ygr25xpohxwz.com"
*  issuer: C=US; O=Let's Encrypt; CN=YE2
*  SSL certificate verify ok.
> GET / HTTP/1.1
> Host: xn--ygr25xpohxwz.com
```

从上往下读，这是浏览器（这里是 curl）和服务器的第一次见面，行话叫**握手**（handshake）：

| 输出                              | 发生了什么                                |
| ------------------------------- | ------------------------------------ |
| `port 443`                      | 走的是 HTTPS 的那扇门                       |
| `Client hello` / `Server hello` | 双方打招呼，商定这次用什么方式加密                    |
| `Certificate`                   | **服务器把证书发了过来**——就是刚才在浏览器里看到的那张       |
| `CERT verify`                   | 服务器**证明这张证书是它的**：用一份只有它自己有的文件，当场签了个名 |
| `Finished`                      | 握手完成                                 |
| `SSL connection using TLSv1.3`  | 加密连接建好了——和 DevTools 里那句对得上           |

第一行的 `port 443`，此前我们讲端口时提过：443 常常和 HTTPS 有关。今天它正式上场，浏览器看到 `https://`，默认就去找 443；看到 `http://`，就找 80。两种访问各走各的端口。

紧接着 `Server certificate` 那几行，是 curl 拿到证书之后在**逐项检查**：

- `subjectAltName ... matched`——证书上写的名字，和我们要访问的名字**对得上**；
- `start date` / `expire date`——**没过期**；
- `issuer` ＋ `verify ok`——签发者是 Let's Encrypt，它的签名**验证通过**。

全部通过，才轮到 `>` 开头的那几行——**就是 5.3 学过的那段 HTTP 原文，一个字没变**。只不过这时候的请求和响应走在刚建好的加密连接里，路上的人看到的是密文。

所以，HTTPS 并没有改写 HTTP，而是在 HTTP 前面**先加了一次握手**：确认对面是谁、建好加密连接，然后照常说 HTTP。这次握手只在**建立连接时**做一次，同一条连接上的后续请求，直接在加密连接里对话，这也就是刚才 Timing 里，只有第一个请求有 SSL 那一段的原因。

除了`https://李勃老师.com`，你也可以同样看一下其他的网站，比如说`https://www.bilibili.com/` `https://www.apple.com/`,看看它们的证书有何不同。

---

## 证书从哪来

看完别人家的锁，回到我们自己的服务器。作为一个网站的服务方，想要同样的握手，Nginx 完全可以实现，但是得给它配置**两份文件**：

- **证书**：握手时发给每一位访客（`Certificate` 那一步）。它是公开的，谁都能看，刚才我们就看了；
- **私钥**：握手时用来当场签名（`CERT verify` 那一步）。它**永远不离开服务器**——刚才那么多输出，从头到尾都没出现过它。

为什么私钥要这么严防死守？因为证书是公开的，谁都能拿到一份；**能证明"这张证书是我的"，靠的只有私钥**。谁拿到了私钥，谁就能冒充你的网站。

### 两份 .pem 文件

这两份文件长什么样？它们通常是以 **`.pem`** 结尾的纯文本文件。PEM 是一种把证书、私钥这类东西写成文本的格式：头尾各一行标记，中间夹着一大段编码。证书文件打开是这样的：

```text
-----BEGIN CERTIFICATE-----
MIIDlzCCAx2gAwIBAgISBsmYifbxBCDgUkHrGhx34U7SMAoGCCqGSM49BAMDMDMx
CzAJBgNVBAYTAlVTMRYwFAYDVQQKEw1MZXQncyBFbmNyeXB0MQwwCgYDVQQDEwNZ
……
-----END CERTIFICATE-----
```

这样的编码人眼是读不懂的，但刚才在浏览器里、在 curl 里看到的那些信息——颁发给谁、谁签发的、有效期到哪天，全都写在里面。一个 `.pem` 文件里还可以连着放好几段 `BEGIN … END`。私钥文件也是同样的格式，只是开头那行写的是 `-----BEGIN PRIVATE KEY-----`。

Nginx 要上 HTTPS，配置里就得多出这样几行，分别指向这两份文件：

```nginx
listen 443 ssl;
ssl_certificate     /某个路径/证书.pem;     # 握手时发给访客的那份
ssl_certificate_key /某个路径/私钥.pem;     # 只留在服务器上的那份
```

于是问题就落到了实处：**这两份 `.pem` 文件，从哪来？**

### 谁来签证书

私钥好办，在服务器上一条命令就能生成。难的是证书。它能不能也自己做一份？技术上能，但没用——自己给自己发的身份证，浏览器不认，访客只会看到一整页警告："您的连接不是私密连接"。

证书得由浏览器信得过的机构来签，这样的机构叫 **CA**（Certificate Authority，证书颁发机构）。刚才 `issuer` 那一行写的 Let's Encrypt，就是一家 CA。

浏览器又凭什么信 CA？因为**操作系统里内置了一份受信任的名单**。这份名单也能亲眼看到：Mac 上打开「钥匙串访问」，左边选「系统根证书」，搜 `ISRG`，能找到 **ISRG Root X1** 和 **ISRG Root X2**——这就是 Let's Encrypt 的"根"。（Windows 上运行 `certmgr.msc`，在"受信任的根证书颁发机构"里找。）

再回到浏览器里的证书详情，找到证书的层级（一般在"详细信息"那一栏），会看到一串：最底下是网站自己的证书，往上是 Let's Encrypt 用来签发的证书（就是 `issuer` 里那个 `YE2`），再往上，一路通到 ISRG Root。这一串叫**证书链**——浏览器顺着它往上找，找到了名单里的根，就信。

> 常会听到"**SSL 证书**"这个叫法。SSL 是这层加密早年的名字，后来升级换代改叫 **TLS**，如今用的都是 TLS。但老名字叫顺了口，一直沿用了下来——就连 curl 自己都写着 `SSL connection using TLSv1.3`。

### 知名的 CA

信任名单里有上百张根证书，背后是几十家 CA。按是否收费来分，大致是这么两类：

| 类别     | 代表                                              | 特点                                |
| ------ | ----------------------------------------------- | --------------------------------- |
| 商业 CA  | DigiCert、Sectigo（原 Comodo）、GlobalSign           | 收费；除了验证域名，还能核实**公司身份**，银行、大企业多用它们 |
| 免费、自动化 | **Let's Encrypt**、ZeroSSL、Google Trust Services | 免费；只验证域名，申请、续期全靠程序自动完成            |

在阿里云、腾讯云控制台里看到的"SSL 证书"服务，多半是代售上面这些 CA 的证书；里面也有免费的，如今有效期同样只有几个月。

你可能会问，对于开发者来说，免费和收费的有什么区别？从安全保护的技术手段、用户体验这些角度来看，它们其实没有什么区别，功能是一样的。

那为什么还会有人从商业CA这里买证书呢？

这不单纯是个技术问题了，而是个商业问题。个人开发者关心的是功能和价格，但企业采购决策往往还需要考虑管理成本、故障风险、组织协作和责任边界。等你哪天承担起企业 IT 建设的重担，网站停服几分钟就是不可估量的经济损失，手里又握着几百万甚至几千万的采购预算，答案自会明了。

### Let's Encrypt

早些年，找 CA 签证书基本都要花钱，一年几百到几千块不等；免费的选择很少，而且申请、续期都得手动办。不少小网站嫌麻烦，干脆就不上 HTTPS 了。

2015 年，**Let's Encrypt** 出现了：一家非营利的 CA，**免费签发、全程自动化**，同样在那份信任名单上，这就给开发者带来了福音。今天互联网上相当大一部分网站，用的都是它签的证书（包括我们的课件网站`李勃老师.com`）。

"全程自动化"是真的全程：它连一个让人手工填表的网页都没有，申请、验证、领证书，都得由程序来跟它对话。

签发之前，它也得核实"这个域名归我们管"。办法很直接：**让我们在网站上放一样指定的东西，它从外面来取**——按域名找到我们的服务器，从 80 端口把那样东西取回去，对得上，就说明这个域名确实指向我们、这台服务器也确实归我们管。

它的证书**有效期只有 90 天**，敢给这么短，是因为续期可以全自动完成；而有效期越短，万一私钥泄露了，被冒充的时间窗口也越短。

### 手工做，要几步？

现在把要做的事从头列一遍：

1. 在服务器上生成一把私钥，`privkey.pem`；
2. 写一份证书申请，交给 Let's Encrypt；
3. 按它的要求，在网站上放好指定的东西，等它从 80 端口来取；
4. 验证通过，把签好的证书（`fullchain.pem`）领回来，放到服务器上；
5. 改 Nginx 配置：监听 443、写上两份 `.pem` 的路径，再给 80 加上跳转到 https；
6. 检查配置，reload；
7. 90 天之内，把第 2 到第 6 步再做一遍——之后每一次都是。

前六步做一次就够折腾，第 7 步更要命：哪次忘了续，证书一过期，访客打开网站看到的就是一整页警告。何况 Let's Encrypt 本来就要求用程序来申请。

所以我们需要一个程序，把这些全包下来。它就是 **certbot**——Let's Encrypt 推荐的申请工具，名字拆开就是 cert（证书）＋ bot（机器人）：**证书机器人**。清单上的第 1 到第 6 步，它一条命令跑完；第 7 步，它装好一个定时任务，到期前自己续。

下面动手干。

---

## certbot：一条命令

先去云控制台的安全组，放行 **443** 端口。这扇门和 80 一样是**正门**，是要**一直开着**的。上一节收掉 8000 端口的时候，在安全组/防火墙里应该只留了 22 和 80端口，今天再加一个 443端口。

>22（我们自己登录）、80（HTTP）、443（HTTPS），就是一台 Web 服务器该开的全部。

**装 certbot**（Ubuntu）。certbot 官方推荐用 **snap** 来装：

```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

snap 是 Ubuntu 上除了 apt 之外的另一种装软件的方式：软件连同它依赖的东西打成一个包，装好之后还会**自动更新**。certbot 得跟着 Let's Encrypt 的规则变化及时升级，所以官方推荐用它。`--classic` 是允许它访问整个系统——它要去改 Nginx 的配置，认脸即可。snap 版的 certbot 自带 Nginx 插件，不用另外装。

第二行是建一个快捷方式（软链接，3.5 见过），让 `certbot` 这个命令在哪儿都能直接敲。如果之前已经装过，第一行会提示已经装好了，第二行会提示 `File exists`，都没关系，说明早就就位了。

> 如果提示找不到 `snap` 命令，先执行 `sudo apt install snapd`。

**签发**：

```bash
sudo certbot --nginx
```

跟着问答走：填一个**邮箱**（证书出问题时提醒你）→ 同意条款 → **选择域名**——注意，它列出的域名不是猜的，是从 Nginx 配置的 `server_name` 里读到的，刚才写进去的两个名字都会出现在这儿。`example.com`和`www.example.com`这**两个都要选上**（输入对应的编号，空格隔开；如果什么都不输、直接回车，就是全选）：证书签给的是具体域名，只签裸域名的话，别人敲 `www.` 进来照样会看到"不安全"。

回车之后的几秒钟里，刚才清单上的第 1 到第 6 步就跑完了：生成**私钥** → 提交申请 → Let's Encrypt 从 80 端口来取东西，**核实**域名归我们管 → **领回证书** → **改好 Nginx 配置**并 reload。

打开 `/etc/nginx/sites-available/example.com` 看看它改了什么（示意，以实机为准）：

```nginx
server {
    server_name example.com www.example.com;
    root /home/ubuntu/zero-to-tech/out;
    ...

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = www.example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    if ($host = example.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 404; # managed by Certbot

}
```

关注这样几行：

- 主 server 块的 listen 从 80 **改听 443** 了（带 `[::]` 的那行是 IPv6 版本，和原来的 `listen [::]:80` 一个道理）；
- 多了两行文件路径，正好是握手要用的那两份：`fullchain.pem` 是**证书**（full chain 是"整条链"的意思——我们自己的证书，连同链上往上的几张，握手时一起发给访客，好让浏览器顺着链往上找）；`privkey.pem` 是**私钥**；
- 紧跟着的 `include` 和 `ssl_dhparam` 两行，是 certbot 附带的一套推荐加密设置（用哪些协议版本、哪些算法），认脸即可；
- 下面新出现一个小 server 块守着 80——谁再用 http 来访问，就回一个 `301`，让浏览器转去 https（**两个名字各一条**，刚才选了几个域名，这儿就有几条）；
- 这个小块最后那行 `return 404`，是 certbot 顺手加的一道保险：两个名字在上面都已经被 `301` 送走了，正常情况下走不到这一行。

顺便把状态码的最后一个家族补齐：此前我们学习http状态码的时候认识了 2xx 成功、4xx 客户端错、5xx 服务端错，这一节我们终于见到了3开头的，**3xx 是"重定向"，意思是内容搬家了，去新地址**。

每处改动后面都署了名 `# managed by Certbot`，代表这一行是`Certbot`自动写进去的。

这两份文件就在服务器上，可以亲眼看看（这个目录得 `sudo` 才进得去）：

```bash
sudo ls /etc/letsencrypt/live/example.com/
# README  cert.pem  chain.pem  fullchain.pem  privkey.pem
```

`cert.pem` 是我们自己的证书，`chain.pem` 是往上的那段链，两个合起来就是 `fullchain.pem`，我们在nginx中配置的，以及握手时 `Certificate` 那一步发出去的，就是它。

> **私钥那份，不要 cat，更不要截图、录屏、发给别人、提交进 Git。** 它就是这台服务器的身份，一旦泄露，就得作废重签。

**一张证书，两个名字。** 我们选了两个域名，可 `live/` 底下只有一个以 `example.com` 命名的目录——因为证书只签了**一张**。一张证书里可以写进好几个名字，前面 curl 输出里的 `subjectAltName` 说的就是这个（证书详情里叫"主题备用名称"）。用这条命令，能看到证书里到底写了哪些名字：

```bash
sudo certbot certificates
#   Certificate Name: example.com
#     Identifiers: example.com www.example.com
#     Expiry Date: ...
```

`Identifiers` 那一行，两个名字都在。

> **以后再加一个子域名，比如 `api.example.com`，证书要不要动？** 要。证书只认写进去的那几个名字，新名字不在上面，浏览器会报证书和域名对不上。做法和这一节一样：加一条 A 记录（主机记录填 `api`）→ 在 Nginx 里让一个 server 块认领 `api.example.com`（独立的服务，就照这一节的做法单建一个文件）→ 再跑一次 `sudo certbot --nginx`。三个名字都选上，certbot 会提示扩展原来那张证书；只选新名字，就单独再签一张——两种都行。续期不用管，定时任务会把所有证书一起续。

**清单上的第 7 步，续期**：Let's Encrypt 的证书只有 90 天有效期，那过期了怎么办——装 certbot 时，一个**定时任务**已经就位了：

```bash
systemctl status snap.certbot.renew.timer     # 又是 systemd 家的活：除了管服务，它还管定时任务（timer，认脸即可）
sudo certbot renew --dry-run       # 彩排一次续期，跑通就彻底不用管了
```

> certbot 也可以用 apt 装（`sudo apt install certbot python3-certbot-nginx`），那样定时任务叫 `certbot.timer`。两种方式选一种就好，**别混着装**——机器上会出现两套 certbot、两个续期任务，互相打架。

---

## 见证HTTPS

浏览器，敲 `https://example.com/`（换成你自己的域名），"不安全"的标记不见了。

把前面在课件网站上做过的检查，对自己的网站再走一遍：点开地址栏左边的图标，证书颁发给 `example.com`，颁发者是 Let's Encrypt。

再故意敲 `http://` 开头的——地址栏自己跳成了 `https://`（刚才那个 301 在干活）。

F12 看一眼 Network：fetch 发往的还是那个相对路径 `/api/analyze`，但它自动继承了页面的协议——**已经是 https 了**。上一节把接口地址留空时说的"直接这样空着，以后就不用再来改了"，此时就兑现了。

> 如果上一节在前端的配置文件中把接口地址写死成 `http://服务器IP`，今天页面升级成 https 之后，浏览器会**直接拦截**页面里这些发往 http 的请求（这有个名字叫"混合内容"）。正是因为没有写死而是留空了，这一节我们就不用再管这个事儿了，这就是相对路径的价值。

---

## 给cookie也上把锁

锁挂上了，地址栏不再标"不安全"。那是不是从现在起，网站和访客之间来来回回的所有东西，就都加密了？

如果较真儿的话，会发现刚才的请求链路里，暴露了一个问题——我们的cookie，也就是每位访客的那张 `session_id` 纸条，其实还有泄露的风险。

这个问题值得重视，因为**纸条就是身份**——后端认纸条不认人，谁拿着它，谁就是这位访客。此前我们说过，纸条要是能被猜到，别人就能冒充我们的会话；被人看到，后果是一样的。

有什么样的泄露风险呢？先看原理。HTTPS 加密的是**浏览器与服务器之间的链路**：走 https 的请求，全程是密文。可纸条带不带、什么时候带，不归 HTTPS 管，归**浏览器**管——浏览器拿到 cookie 存下来，之后每次请求自动带上。它判断要不要带，看的是**域名对不对得上**；至于这一趟走的是 `http://` 还是 `https://`，浏览器默认是不看的。

于是口子就出现了：只要有一趟请求走的是 HTTP——访客点开一个老书签，或者别人发来一个 `http://` 开头的链接——浏览器照样会把纸条（cookie）放进这趟请求，在明文路上送出去。Nginx 收到之后确实会回一个 301，把访客送去 https；但 301 是请求**到了服务器之后**才回的，而纸条在路上已经被人（可能是坏人）看过一遍了。

也就是说：**HTTPS 管得了它自己这条路，管不了纸条走哪条路。** 要堵上这个口子，得让纸条自己认路——它最好只走HTTPS，不再走HTTP。这就是要给它补上的第四样属性，叫做`Secure`：

> **`Secure`——这张纸条只在 HTTPS 上运送；如果走 HTTP，浏览器就当没有它。**

6.6 那一节给纸条写了 `HttpOnly`、`SameSite`、`Max-Age` 三样属性，偏偏没写`Secure`，是因为那时候还用不了：在本节之前，网站都只有 HTTP 一条路，线上跑的是 `http://服务器IP`，加了它，纸条就送不出去了。今天有了 HTTPS，它才立得住。

怎么加呢？回到代码 `main.py`，给 `set_cookie` 添一个参数：

```python
        response.set_cookie(
            "session_id", sid,
            httponly=True, samesite="lax",
            secure=True,                          # ← 新增：只在 HTTPS 上运送
            max_age=60 * 60 * 24 * 30,
        )
```

推代码、服务器 `git pull`、`sudo systemctl restart zero-backend`。再 F12 → **Application → Cookies**，`session_id` 那一行的 **Secure 一栏，打上了勾**。

至此，cookie的这三样**约束**算是齐了（`Max-Age` 管的是有效期，不在这一组）——它们各守一道门：

| 属性         | 挡的是谁                      |
| ---------- | ------------------------- |
| `HttpOnly` | **页面里的 JS**——纸条它读不到       |
| `Secure`   | **明文的路**——没加密就不发          |
| `SameSite` | **别的站点**——不是从我这儿发起的请求，别乱带 |

这也是一种**纵深防御**：301 负责把访客引上加密的路，`Secure` 保证纸条只走这条路——两道各守各的，谁也不替谁。

> **那本地开发怎么办？** 本地还是 `http://localhost`，按规矩带 `Secure` 的 cookie 是发不出去的。好在浏览器对 `localhost` 有特殊照顾——Chrome、Firefox 都把它当作可信来源，cookie可以照发不误。

---

## 回头把 README 改了

这一节部署上又多了几步（域名、证书、多开一个端口），README 里的「部署到服务器」也得跟上。要动的是三处。

**第一处：在 Nginx 那一步后面，插入新的一步「域名与 HTTPS」。**

````markdown
**6. 域名与 HTTPS**（首次部署才需要）

1. 在域名控制台加两条 A 记录：主机记录分别填 `@` 和 `www`，记录值都填服务器 IP（服务器在中国大陆的，要先完成 ICP 备案）
2. 给网站单独建一份以域名命名的配置，`default` 只留作兜底：

   ```bash
   sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/example.com
   sudo vim /etc/nginx/sites-available/example.com
   sudo vim /etc/nginx/sites-available/default
   sudo ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

   - `example.com`：两行 `listen` 去掉 `default_server`，`server_name _;` 改成 `server_name example.com www.example.com;`
   - `default`：整个换成兜底块——`listen 80 default_server;`、`listen [::]:80 default_server;`、`server_name _;`、`return 404;`

3. 安装 certbot，签发证书（两个域名都要选上，直接回车即全选）：

   ```bash
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   sudo certbot --nginx
   sudo certbot renew --dry-run      # 彩排一次续期，跑通就不用管了
   ```
````

**第二处：安全组那一步，加上 443。**

````markdown
**7. 安全组 / 防火墙**

只放行 **22（SSH）**、**80（HTTP）** 和 **443（HTTPS）**。**8000 不要放行**——后端只监听 `127.0.0.1`，由 Nginx 转发进去。
````

**第三处：验证那一步，地址换成域名。**

````markdown
**8. 验证**

浏览器访问 `https://example.com`，地址栏不再标"不安全"；再敲 `http://` 开头的，应该自动跳到 `https://`。做一次分析、看一眼历史记录。
````

「配置说明」那张表不用动：前端那一行本来就留空，跟着页面走相对路径；后端的 `ALLOWED_ORIGINS` 线上用不上，照旧填着就行。

改完提交：

```bash
git add README.md
git commit -m "更新部署说明：域名 ＋ HTTPS"
git push
```

---

## 重要里程碑

再次回忆一把，我们当初讲互联网是怎么工作的时候说过的那条链路，如今是这样走的：

```text
你的域名 → DNS（你登记的 A 记录）→ 你的服务器 IP → 443（你申请的证书）
        → 你的 Nginx → 你的静态页面 / 你的 FastAPI → 你的 SQLite → 原路返回
```

这条链路上的每一格，今天都是我们自己搭起来的：自己的服务器、自己的域名、自己申请的证书。从 2.4 租下第一台服务器那天算起，到这一刻——这是个重要的里程碑！

---

## 收尾

网站体面地立在公网上了。于是一个新问题自然冒出来：**有人来过吗？** 谁访问了这个网站、看了哪个页面、遇到过报错吗？

下一节我们就一起来看一看，Nginx访客日志与网站统计。

---

[← 上一节：模块 7.2 常驻与同源——systemd 与 Nginx 反向代理](/zero-to-fullstack/lessons/module-7-2/) | [下一节：模块 7.4 看见你的访客——Nginx 日志与网站统计 →](/zero-to-fullstack/lessons/module-7-4/)
