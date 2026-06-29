---
title: "模块 4.5：Next.js——React 之上的生产级框架"
meta_title: ""
description: "React 用组件拼装界面、建立了数据驱动界面的规则，但项目要上路，还有路由、SEO、首屏速度这些苦力活。这一节讲清 Next.js：文件夹即路由、服务端/客户端组件、把页面预渲染成真实 HTML，并把 4.4 的项目整体搬成 Next。"
date: 2026-06-26T00:00:00+08:00
image: "/images/module-4-5.webp"
categories: ["零到全栈"]
tags: ["Next.js", "React", "路由", "SEO", "服务端组件", "预渲染", "前端框架"]
weight: 17
draft: false
---

> React 让我们用组件的方式来拼装界面，并且建立了数据驱动界面的规则，但项目要上路，还有一堆苦力活——路由、SEO、首屏加载速度……而 Next.js 可以替我们把这些一并管起来。

---

## 框架的代价

我们已经知道，React 其实就是一套规则，借助 Vite 这样的构建工具，可以把这套规则翻译成浏览器认识的 html、css 和 js。

其实，更具体来说，目前为止，我们写的所有的 React 组件的代码，都是被翻译成了 js。

上一节结尾，我们把项目发布到了公网，那我们就打开看一下吧！

> 浏览器访问 `http://服务器IP/`

个人主页稳稳出现，看起来挺好。

接下来我们打开浏览器的「检查」，在 Chrome 浏览器上右键选择“检查”，或者**按下 F12** 打开浏览器开发者工具，切到 **Network（网络）** 面板。然后刷新一下页面，看看它到底是怎么加载出来的：

> 你会看到一个顺序：浏览器**先**下载了 `index.html`——它几乎是**空的**，`<body>` 里就一个空 `<div id="root">`；**然后**才下载那个大大的 `index-[hash].js`；**等这个 JS 跑完，页面内容才被画出来**。

所以**服务器送给浏览器的，是一个空壳 `index.html` ＋ 一个 JS 包；我们最终看到的全部内容，都是浏览器拿到这个 JS 代码之后，执行 JS 代码，让它在浏览器里现画的。**

而这个做法，**牵出了三个问题**——

1. **直接访问 `/text-lab`，打不开。** 如果我们在地址栏直接敲 `http://服务器IP/text-lab` 然后回车，会发现报告**404**。因为服务器硬盘上**根本没有** `text-lab` 这个文件（它只有那个空壳 `index.html`）；“文字实验室”这一页，是 JS 在浏览器里**临时画**出来的。必须要先进首页、再点导航才到得了它；一旦直接访问、或在这一页刷新，就露馅。
2. **首屏会慢一拍。** “先下空壳 → 再下 JS → 再画”，网速一慢，访客就先看到一片**白屏**，等 JS 到位内容才忽然蹦出来。
3. **对 SEO 不友好。** 搜索引擎派爬虫来抓我们的页面，但**很多爬虫不会执行 JS**（或者执行得不全），它拿到的就是那个**空壳 `index.html`**——里头啥内容都没有。在它眼里这就是个空页面，自然给不了好排名。（SEO ＝ 搜索引擎优化，说白了就是“让爬虫抓得到、也看得懂网页的内容”。）

三个问题，其实是**同一个病根**：页面不是真实的文件，而是浏览器临时根据 JS 算出来的。

> 那从根上治，办法很直接：**别让浏览器临时算了——提前把每一页都“画好”、存成真实的 HTML 文件**，摆在服务器上。这样一来：`/text-lab` 真有文件（不再 404）、访客一来就拿到画好的页面（不再白屏）、爬虫也直接读到内容（SEO 友好）。三个问题，一齐解决。

这件事自己手搓不是不行，但很麻烦。好在有个框架，把它连同路由一起**打包替我们做好了**——这一节的主角，**Next.js**。

---

## Next.js 是什么

**Next.js 是 React 之上的一个生产级框架。** React 管“组件”，Next.js 在 React 上面**再加一层**，管那些“组件之外、与整个 web 应用相关的、上线必须的事”：**路由、SEO、首屏快**……

它和 React 的关系不是“二选一”——是“二者叠加”。一句话总结这一节的世界观：

| 层 | 谁来管 | 你能感觉到的 |
| ------------- | -------------- | ----------------------------------------------- |
| 工程化（依赖、构建、命令） | Vite / Next 内置 | `npm install` / `npm run dev` / `npm run build` |
| UI 组件 | React | `<Nav />`、`state` |
| 路由、SEO、首屏 | **Next.js** | “文件夹 = 页面”，`<Link>`，部署不 404 |

但是，别被“路由、SEO、首屏、生产级框架”这一串名词唬住。Next.js 真正解决的，归根到底就**两件事**：

1. **路由**——“哪个网址显示哪一页”，告别 4.4 那种手搓判断；
2. **把页面预先渲染成真实的 HTML**——这一件，正是开头那三个问题（直接访问 404、首屏慢、SEO 差）背后的**同一台引擎**：同一个病根，一并解决。

> 路由只是 Next 最显眼的那一块；**“预渲染成真实 HTML”才是它作为“生产级框架”最硬的本事**

所以，Next 可以用来帮我们解决路由的问题，并把页面预渲染成真实 HTML。那**在 Next 出现之前**，这些事谁来扛呢？

- **路由解决方案**：我们上一节手搓了一个 useRoute.js，其实在 React 项目中管理路由，有一个现成的路由库——最常见的就是 **react-router**（上一节在 URL 那部分的末尾我们提过）。但不管手搓还是用库，它们都没有解决“**在浏览器里算页面**”这个问题，**也没有直接解决前面说的 404 问题**，得自己再去配服务器、把所有路径回退到首页（需要改 Nginx 配置，不展开说了）；

- **预渲染 / SEO / 首屏解决方案**：得**自己搭一个 Node 服务器**，手动把 React 渲染成 HTML 字符串、两端各配一遍路由、数据获取自己接……一大堆样板，每个严肃项目都要重写一遍。

Next.js 的出现，就是把这摊“人人都要重做一遍的脏活”，**用一套约定，标准化、自动化地替我们做了**。这就是 Next 作为一个生产级框架的价值——**是让我们站在别人的肩膀上，不用什么都从零搭。**

---

## 看一看一个真实的 Next.js 项目

惯例，这一节的项目也已经准备好了：`zero-to-tech-4-5/`——一个**已经搬成 Next.js 的版本**。你不用自己从头搭，直接看我准备好的就行。

打开 `zero-to-tech-4-5/package.json`：

```json
// 4-5 (Next.js)
"dependencies": {
  "animejs": "^4.4.1",
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "next": "^15.0.0"           // ← 多了这一个
},
"scripts": { "dev": "next dev", "build": "next build", "start": "next start" }
```

和上一节的摆一起对比：

```json
// 4-4 (Vite + React)
"dependencies": {
  "animejs": "^4.4.1",
  "react": "^19.2.6",
  "react-dom": "^19.2.6"
},
"scripts": { "dev": "vite", "build": "vite build", "preview": "vite preview" }
```

> **在 `dependencies` 中多了一个 `next` 包**
>
> 而在 `scripts` 里 `dev`、`build` 这两条命令的**名字一字没变**，只是背后从 `vite` 换成了 `next`（第三条 Vite 的 `preview` 换成了 Next 的 `start`，干的也是“本地起服务”的活）

> **Next.js 自带了一整套构建**（它有自己的构建工具，不是 Vite），所以我们可以**不再使用 vite 了**；它从 `package.json` 里退场，是因为“构建这摊活儿被 Next 接管了”，**不是它过时了**。我们 4.2 那一节学的那套“**构建**”的概念在 Next 里照样在跑——`dev`/`build` 命令名一字没变，换的只是背后干活的人。而且在**没用 Next 的项目**里（海量纯 React / Vue 工程），Vite 依然是首选。所以“构建”这个概念我们没白学，它只是换了个执行者。

跑起来：

```bash
cd zero-to-tech-4-5
npm install
npm run dev
```

打开 `http://localhost:3000`（Next.js 默认端口，从 5173 变成了 3000——一个小细节）。网站还是那个网站，**长一模一样**。

> 顺便看一个**小福利**：`npm run dev` 跑着的时候，留意页面**角落里那个 Next.js 的小标志**（一般在左下角）。平时它不声不响；一旦代码出错，它会把错误标出来，点开就能看到**完整的报错信息**，还能**一键复制**。
>
> 这在 vibe coding 时特别顺手：报错原样复制给 AI 就可以了。这也是 Next 这类成熟框架替我们做的贴心小工具之一。

---

## 用文件夹结构来管理网站结构

打开 `zero-to-tech-4-5/` 的目录，直接对比 4-4：

```text
zero-to-tech-4-4/                zero-to-tech-4-5/
  src/                             app/                       ← Next.js 的“页面区”
    main.jsx                         layout.jsx               ← 全站外壳（页面包裹 + 引入 css）
    App.jsx           ← 这一坨        page.jsx                 ← / 这一页
    router/                          text-lab/
      useRoute.js     ← 手搓 26 行      page.jsx               ← /text-lab 这一页
    components/                    components/
      Nav.jsx                        Nav.jsx
      HomePage.jsx                   HomeView.jsx
      TextLabPage.jsx                TextLabView.jsx
      AnimatedCardGrid.jsx           AnimatedCardGrid.jsx
    data/                          data/
      site.js                        site.js                  ← 一字未改
```

（上图只列了对比时关键的那几个文件；`InputCard`、`PageHeading`、`ResultCard` 这些两边都一样，就没画出来。）

发现了什么——

**1. `src/App.jsx` + `src/router/useRoute.js` 不见了**。4.4 那个**手搓的小路由**（连同它的入口），整块没了。

**2. 多了一个 `app/` 目录**，里头是一棵小树：

```text
app/
  layout.jsx
  page.jsx
  text-lab/
    page.jsx
```

这就是 Next.js 替我们管路由的方式——**“文件夹 = 路由”**：

- `app/page.jsx`         → 网站 `/` 这一页
- `app/text-lab/page.jsx` → 网站 `/text-lab` 这一页

如果未来我们想加一个页面，比如说 `/blog`，那么就新建 `app/blog/page.jsx` 就可以了。不用注册、不用维护路由表，只要页面是按照这个 `app/blog/page.jsx` 路径来创建的，那么就可以用 `/blog` 这个 URL 来访问。

> 跟 4.4 一对比就清楚了：4.4 我们需要**自己动手**把“在哪页”写进网址、再自己判断该显示谁（那个糙路由）；到这儿，**这些我们全都不用管了**——把页面文件按文件夹摆好，“哪个网址显示哪页”Next 自动就接上。
>
> 4.4 我们说过，“用 URL 管路由”本质也是**数据驱动界面**——界面照着 URL 这个“值”显示。这个直觉没有变，变的只是：“读写 URL、按它挑页面”这件苦差，从我们手搓，换成了 Next 自动接管。

> 这就是 Next.js 那句口号“**约定优于配置**”在最直观的样子：**它和我们约好“文件夹结构就是网站结构”**，然后省掉了一切手写的路由配置。

打开 `app/text-lab/page.jsx`，看它一共几行：

```jsx
import TextLabView from "../../components/TextLabView.jsx";

export default function Page() {
  return <TextLabView />;
}
```

**就这么 5 行**——它的全部工作就是说“`/text-lab` 这个 URL 渲染 `TextLabView` 这个组件”。剩下的一切——监听 URL、刷新不丢、前进后退——Next.js 已经替我们做完了。

---

## React 组件的变化

文件夹路由看明白了，我们再随手翻翻 `components/` 里那几个组件。大体上它们和 4.4 几乎一样——`AnimatedCardGrid`、两个页面组件的主体都照搬了过来，基本是差不多的，不过也有一些不同。

Nav 这个组件有变化，它里面的路由控制换成了 Next 自带的 `<Link>` 标签（不用细究怎么写，知道“路由被框架接管了”就行）。

还有一个小小的不同：有些组件文件的**最顶上，多了一行 `"use client"`**，有些却没有。这是什么意思呢？

对一下就发现规律了：

- **有** `"use client"` 的：`Nav.jsx`、`InputCard.jsx`、`ResultCard.jsx`、`AnimatedCardGrid.jsx`——全是要**在浏览器里“动”起来**的（导航切换高亮、打字计数、结果卡入场、卡片飞入动画，用到了 `useState`、`useEffect`、`usePathname` 这类只能在浏览器里跑的东西）；
- **没有** `"use client"` 的：`HomeView.jsx`、`TextLabView.jsx`、`PageHeading.jsx`，以及 `app/` 里那几个 `page.jsx`——它们要么纯展示、要么只是把别的组件摆在一起，**自己不带任何交互**。

这行字背后，是 Next 的一个**核心设定**：

> Next 默认会把组件**先在服务器（或 build 时）渲染成 HTML**，再把现成的 HTML 发给浏览器——这种“在服务端就画好”的组件，有个正式名字叫 **服务端组件（Server Component）**。前面说的“预渲染成真实文件、首屏快、对 SEO 友好”，靠的就是它：内容在服务器就画好了，浏览器拿到的直接是带内容的 HTML，不必再等 JS 现画。
>
> 但点击、打字、动画这些事，**只能在浏览器里发生**。所以一个组件但凡用到这类“得在浏览器里跑”的东西，就得在顶上写一行 `"use client"`，把自己标成 **客户端组件（Client Component）**。

这里要**点破一个最容易误会的点**：客户端组件**也会被预渲染成 HTML**——所以我们这个项目里那些带交互的客户端组件（`Nav`/`InputCard`…）画出来的东西，查看源代码照样都在、SEO 照样好。它只是**额外**再被送一份 js 到浏览器，好让它“活”过来、能交互。所以 `"use client"` 不是“不预渲染”，而是“**还要**在浏览器里再跑一遍”。

一句话，那行 `"use client"` 就是个**开关**：

- **不写**（默认）＝ 服务端组件，纯展示，在服务器 / build 时画成 HTML 就完事，又快又利于 SEO；
- **写上** ＝ 客户端组件，带交互 / 动画，**除了那份 HTML，还会多送一份 js 到浏览器**让它动起来。

你**不用学怎么写、也不用纠结某个组件到底该归哪边**，只要**认得这行字、知道它大概在说什么**就够了。

> 其实，服务端组件这条线还能更进一步——让服务器**在收到请求的时候，现场算出动态内容**再发下来。但那是一条更深、也更需要谨慎的路，下一节会提到，不展开它。

---

## 构建 `Next.js` 项目

我们现在试着构建一下这个 `Next.js` 项目，在 `zero-to-tech-4-5/` 里跑：

```bash
cd zero-to-tech-4-5
npm run build
```

跑完看输出最后那张表：

```text
Route (app)                       Size    First Load JS
┌ ○ /                            486 B    120 kB
├ ○ /_not-found                  996 B    103 kB
└ ○ /text-lab                    1.19 kB  117 kB

○  (Static)  prerendered as static content
```

注意那个 `○ (Static)  prerendered as static content`——它告诉我们一件**大事**：

> **`/` 和 `/text-lab` 这两个 URL，都被 Next.js 预先渲染成了真实的 HTML 文件**。

接下来打开 `zero-to-tech-4-5/.next/server/app/`，你会**亲眼**看到：

```text
.next/server/app/
  index.html             ← 真实存在
  text-lab.html          ← 真实存在 ← ← ← 看这里
```

从这里可以看出来，现在 next 真的帮我们构建出来了两个真实的 html 文件，这样一来，原来报 404 的病根就除了，因为这两个文件现在是真的在被构建到了我们的项目中。

这就是开头我们所说的，Next.js 替我们**把“页面”从“浏览器临时算的”变成“实打实的 HTML 文件”**——不 404、首屏快、搜索引擎能收录（SEO），背后都是这同一件事。

但是请注意，现在用这个 next build 构建产生的 `.next/server/app/` 下的资源和我们此前通过 vite build 产生的 `dist/` 下的资源还有一点不一样，它不像曾经我们见到的 `dist` 资源那样可以当作静态资源直接丢给 Nginx 去部署，我们下一节讲部署的时候再说这件事。

> 想本地先完整跑一下也行：`npm run start` 会用 `.next` 的产物起个本地 Node 服务器，`localhost:3000/text-lab` 能直达——但这是 **Next 自己的服务器在兜路由**，跟把静态文件交给 Nginx 还不是一回事。

---

## 把我们的项目改造成 Next.js 框架

我们已经可以看懂 `Next.js` 这套文件结构（hierarchy），那就不再一个文件一个文案地迁移了，直接把我们 `~/zero-to-tech` 项目中的文件，改为这个新的 `zero-to-tech-4-5/` 的文件就可以了。

把 `~/zero-to-tech` 项目里**除了隐藏的 `.git` 以外的东西全删掉**，再把整个 `zero-to-tech-4-5/` 下的所有文件都拷进来。

（`node_modules`、`.next` 这些产物不用拷，等下 `npm install` / `build` 自己生成。）

留着 `.git`，是因为它记着这个仓库和 GitHub 的连接、还有我们全部的提交历史。**只要它在，这仓库就还是“那个项目”**——远程地址、历史，一个都没有丢。

拷完，照例：

```bash
npm install
npm run dev
```

打开看一眼——还是那个网站。最后 `git add` / `commit` / `push`，我们的 Next 项目就完成了提交和推送。

至于**服务器那边怎么跟着改成跑 Next**，那是下一节的课题。

---

## 从 0 新建一个 Next 项目

这一节我们走的是“**把已有项目搬成 Next**”——因为我们手上正好有个一路养大的 `zero-to-tech`。

但你以后要是**从 0 新建一个全新的 Next 项目**，可以不用这么折腾，下面这样一行命令就可以搞定：

```bash
npm create next-app@latest
```

> **顺带认识一个词：Tailwind CSS。** 你真去跑 `npm create next-app`，它会当场问你一句“要不要用 Tailwind？”。Tailwind 是现在最流行的样式方案——它把样式拆成一堆“工具类”，你直接在标签上写 `className="flex items-center gap-4 rounded-xl bg-white p-6"` 这种，基本不再单独写 css 文件。
>
> 你**不用现在学它**，但要**认得它**：如果你让 AI 写前端，那就建议使用 Tailwind。
>
> 我们这个 demo **没选 Tailwind** 是为了“外貌跟前面一模一样”，继续用一路带过来的那套 css。哪天你想换，跟 AI 说一句“把样式改成 Tailwind”就行。

---

## 核心概念回顾

**Next.js 是 React 之上的生产级框架**——React 管组件，Next 管“组件之外、上线必须的事”。回顾一下这一节的核心概念：

> 1. **文件夹 = 路由**：Next.js 用 `app/text-lab/page.jsx` 这样的结构，就让网站有了 `/text-lab` 这个路径——不用注册、不用配置。
> 2. **跳转交给框架**：Next.js 引入了 `<Link href="...">` 标签，接管了全站路由，让 `App.jsx` + `useRoute.js` 整体消失，我们只需要关注呈现的页面就可以。
> 3. **页面被预渲染成真实 HTML**：`npm run build` 把每一页输出成真正的文件，让我们的首屏加载更快，SEO 更友好。

下一节，我们把这个完整的 Next.js 项目**部署上线**——放到我们那台 Ubuntu 云主机上，用 Nginx 来指向它。

---

[← 上一节：模块 4.4 让数据驱动界面](/zero-to-fullstack/lessons/module-4-4/) | [下一节：模块 4.6 发布到公网 →](/zero-to-fullstack/lessons/module-4-6/)
