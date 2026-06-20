---
title: "模块 4.3：React——前端开发新规则"
meta_title: ""
description: "从『构建工具是翻译官』推到现代前端框架的由来：React 是一套架在构建工具之上的新规则。讲清 React 与 Vue 的关系、组件与 JSX，并把 4.2 的 vanilla 项目一拍一拍改造成 React。"
date: 2026-06-20T00:00:00+08:00
image: "/images/module-4-3.webp"
categories: ["零到全栈"]
tags: ["React", "组件", "JSX", "前端框架", "Vue", "Vite"]
weight: 15
draft: false
---

> 构建工具让我们可以“按舒服的方式写，再翻译给浏览器”。React 做的事，就是把这件事往前推到极致：它给前端开发发明了一套新的组织规则。

---

## 先把 4.2 的地基踩实

如果你还不理解上一节讲的 **Vite、npm、构建工具**，建议先回去看完 4.2。因为 React 不是凭空跑起来的，它正是建立在构建工具之上的。

上一节最重要的结论是：

> **构建工具，是一个“翻译官”。**

我们可以按自己更舒服的方式写代码，构建工具在背后，把这些代码翻译成浏览器真正认识的样子。

那顺着这个思路再往前推一步：

> 既然构建工具能翻译，那我们是不是可以不再老老实实手写浏览器那套底层 HTML、CSS、JavaScript，而是发明一套写起来更舒服、更高效的新规则？

这听起来很大胆，但它正是现代前端框架的基本逻辑。

在 Vite 官网首页，你能看到一排框架和工具的 logo：React、Vue、Angular、Astro、Svelte、Solid……这些东西大体都在做同一件事：**提供一套新的前端开发规则，再交给构建工具翻译成浏览器认识的代码。**

这一节，我们要讲其中最主流的一套规则：**React**。

---

## 为什么是 React，不是 Vue？

在讲 React 之前，先把一个常见问题说清楚：**为什么这门课选 React，而不是 Vue？**

这个问题很正常，因为 Vue 在国内确实非常流行，上手也平缓。React 和 Vue 都很优秀，这里没有“谁高级、谁低级”的问题。

### 第一，它们是同一类东西

React 和 Vue 都是前端框架，解决的是同一类问题：怎么用组件组织界面，怎么让数据变化时界面跟着变化。

它们更像不同“方言”：说的是同一件事，只是写法和习惯不同。

所以你不用担心“学了 React 就放弃 Vue”。你把其中一个框架背后的概念吃透，再去理解另一个，会快很多。

### 第二，这门课选 React，是因为生态最大

React 在全球范围内使用非常广，生态也非常厚。npm 下载量、第三方组件库、教程、项目经验、AI 训练语料，都非常丰富。

这对 0 基础学习者尤其重要。因为你以后不是要从零发明所有东西，而是要能看懂项目、调用工具、指挥 AI，把成熟生态里的东西组合起来。

Vue 也很好，尤其在国内生态很成熟。但这门课需要先选一条主线，我们就选 React。

### 第三，对你来说，最重要的不是框架名

这门课的重点不是背语法，而是理解现代软件开发的概念，然后能用 AI 把事做成。

“组件”“状态”“数据驱动界面”“生态复用”这些概念，在 React 和 Vue 之间完全通用。你在 React 里学明白了，以后要换 Vue，也只是换一套写法。

所以别在“到底学哪个框架”上消耗太多。选一个，把概念吃透，这才是真正带得走的东西。

---

## 框架是什么：管一摊事的一套规则

“框架”这个词听起来很大，其实可以先这样理解：

> **框架，就是管某一摊事的一套规则。**

React 是一个前端框架，它管的是 **UI 组件** 这一摊事。

后面我们讲后端时，还会遇到 Web 框架。那时框架管的就是另一摊事：请求怎么进来、路由怎么分发、接口怎么返回。

把框架理解成“规则”，而不是“魔法”，后面你看整个软件世界都会清楚很多。

React 这套规则的核心是：

> **把一块界面定义成一个组件。**

一个组件里面，可以包含这块界面需要的：

- 数据
- 结构
- 样式
- 行为

组件还可以像搭积木一样组合、嵌套。小组件拼成大组件，大组件再拼成页面，页面再被总组件管理起来。

这和我们之前写 HTML 的方式不一样。

之前是“按文件类型分”：HTML 负责结构，CSS 负责样式，JS 负责行为。

React 更像是“按界面单元分”：这张卡片是一整个组件，那它相关的结构、数据、样式类名和行为，就尽量收在这个组件周围。

---

## Vanilla：没有框架的原生写法

在讲框架时，你经常会看到一个词：**vanilla**。

Vanilla 的意思是“香草”。在软件行业里，它常被借来表示“原生的、没有额外框架包装的版本”。

所以 **vanilla 前端** 通常指：

> 不依赖 React、Vue 这类前端框架，只使用浏览器原生支持的 HTML、CSS、JavaScript 来构建页面。

我们在这节课之前写的页面，就基本可以理解成 vanilla 写法。

不用太纠结这个词的边界。有人会争论“用了第三方库还算不算 vanilla”，这对我们现在没意义。你只要把它理解成“没有使用前端框架的写法”就够了。

---

## 浏览器并不认识 React

无论前端框架有多少，浏览器真正认识的东西始终只有三样：

> **HTML、CSS、JavaScript。**

React 没有抛弃这三件套。它只是在这三件套上面，加了一层更舒服的“作者层”：

你按 React 的规则写，构建工具在背后把它编译回浏览器认识的 HTML、CSS、JavaScript。

这就是为什么这门课先讲 Vite，再讲 React。

> **React 这种写法，离不开构建工具。**

没有构建工具那道翻译工序，浏览器根本不认识 React 项目里的 JSX、组件、模块导入这些写法。

---

## 把 React 装进项目

React 从使用方式上看，本质上就是几个 npm 包。

上一节我们用 npm 安装过 anime.js。安装 React 的方式也一样，只是 React 管的事情更核心、更大。

在项目根目录里执行：

```bash
npm install react react-dom
```

这两个包就是 React 的核心：

- `react`：React 本身
- `react-dom`：让 React 能把组件渲染到网页 DOM 上

但只装 React 还不够。前面说过，React 代码需要被 Vite 翻译。那 Vite 凭什么知道怎么翻译 React？

答案是：需要一个插件。

```bash
npm install -D @vitejs/plugin-react
```

注意，`install` 只是把插件下载到了本地 `node_modules` 里。插件要真正生效，还得挂进 Vite。

在项目根目录新建 `vite.config.js`：

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

这几行的意思是：把 React 插件挂到 Vite 上。

到这里，Vite 就能看懂 React 代码了。

再换一个角度看，“框架是一套规则”其实有两层含义：

- 对开发者来说，React 是一套更舒服的写界面规则。
- 对构建工具来说，React 还附带了一套“怎么把这种写法翻译回基础前端”的规则。

---

## 这一节的改造路线

这一节有配套代码。你可以把 demo 拉到本地：

```bash
git clone https://github.com/joylibo/zero-to-tech-demos.git
cd zero-to-tech-demos/zero-to-tech-4-3
```

这个 demo 是“最终答案”：一个已经改造成 React 的版本。

但学习时不要直接无脑抄完。我们要在 4.2 的项目基础上，一点一点改。需要哪个文件，就从 demo 里把对应文件拷过来。

这节课的改造分成四拍：

1. 先把文字实验室的“结果区”卡片改成 React 组件。
2. 再把整个文字实验室页面交给 React。
3. 把个人主页也抽成组件，并收进一个总管 `App`。
4. 最后用全新的 `index.html` 和 `main.jsx` 挂起整个 React 应用。

这样做虽然比直接新建 React 项目麻烦，但好处是你能亲眼看到：一个项目是怎么从 vanilla，一层一层长成 React 项目的。

---

## 第一拍：先把结果区卡片做成 React 组件

我们先启动 4.2 那个项目：

```bash
cd ~/zero-to-tech
npm run dev
```

打开 `text-lab.html`，先只处理文字实验室右边那张“结果区”卡片。

这一拍的目标很小：**整个页面里，只有这一张卡片由 React 画出来；其他部分全部保持原来的 vanilla 写法。**

### 1. 拷入组件文件

从 demo 里把 `ResultCard.jsx` 拷到你的项目：

```text
src/components/ResultCard.jsx
```

如果项目里还没有 `src/components/`，就先新建这个目录。

`ResultCard.jsx` 是组件本身。它定义了这张卡片是什么、长什么样、挂载后做什么动画。

但组件文件自己不会自动出现在页面上。要把它放到页面里，还需要一个入口文件。

### 2. 新建入口文件 `src/result.jsx`

新建：

```text
src/result.jsx
```

写入：

```jsx
import { createRoot } from "react-dom/client";
import ResultCard from "./components/ResultCard.jsx";

createRoot(document.getElementById("result-root")).render(<ResultCard />);
```

这几行做的事很简单：

1. 把 React 的 `createRoot` 引进来。
2. 把 `ResultCard` 组件引进来。
3. 找到页面上 `id="result-root"` 的位置。
4. 把 `ResultCard` 渲染进去。

记住这个分工：

> **组件负责“是什么”，入口负责“挂哪儿”。**

### 3. 在 `text-lab.html` 里留出挂载点

找到原来结果区那整段 `<article>`，把它删掉，换成：

```html
<div id="result-root" class="panel-half"></div>
```

然后在页面底部保留原来的 `js/main.js`，再新加一行：

```html
<script type="module" src="js/main.js"></script>
<script type="module" src="/src/result.jsx"></script>
```

这里有一个细节非常重要：挂载点上要保留 `class="panel-half"`。

因为页面外层是 CSS Grid 布局，`.panel-half` 决定这一格占半宽。React 组件虽然内部也能写 class，但 CSS Grid 只会对直接子元素生效。

如果你把 `panel-half` 只写在 React 组件内部，而外层挂载点只是一个普通 `<div id="result-root">`，这个挂载点就会默认只占很窄的一格，结果卡片看起来就会“崩掉”。

所以第一拍的正确理解是：

- `#result-root` 负责在原页面里占位置。
- `ResultCard` 负责画出真正的卡片。

### 4. 运行看效果

```bash
npm run dev
```

打开：

```text
localhost:5173/text-lab.html
```

你会看到：页面还是原来的页面，但右边那张结果卡片已经由 React 画出来了。

这一幕很重要。它说明 React 可以只接管页面的一个角落，不要求你一上来把整个项目全部重写。

不过，这种“同一页里一半 vanilla、一半 React”的状态，只适合学习演示。真实项目里一般不建议长期这样混着写，因为复杂度会变高，也容易出现布局、动画、状态不同步的小别扭。

比如你现在会看到，左右两张卡片高度不完全一致——这是“半 vanilla、半 React”这种临时状态带来的小别扭，到第二拍整页交给 React 之后，就自然齐了。

至于“开始分析”按钮点了没反应，那是另一回事，**不是没做完，而是故意留着的**：让按钮去驱动结果，属于“点击 → 数据变 → 界面跟着变”，那是下一节 4.4「数据驱动界面」的正题，这一节先不接。所以这一节里，结果卡的数字滚动只是它一出现时自己放一遍的“入场动画”——你刷新能看到，点按钮却不触发。

---

## 读懂 `ResultCard`：一个完整的 UI 零件

打开 `src/components/ResultCard.jsx`，你会看到它大概长这样：

```jsx
import { useEffect, useRef } from "react";
import { animate, scrambleText } from "animejs";

export default function ResultCard() {
  const cardRef = useRef(null);
  const scoreRef = useRef(null);

  useEffect(() => {
    animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [24, 0],
      duration: 700,
      ease: "outBack",
    });

    animate(scoreRef.current, {
      innerHTML: scrambleText({ chars: "0-9" }),
      duration: 1500,
    });
  }, []);

  return (
    <article ref={cardRef} className="panel panel-half lab-panel result-panel card">
      ...
      <strong data-score ref={scoreRef}>0.86</strong>
      ...
    </article>
  );
}
```

你不需要现在就完全掌握每个 API，但可以先看懂它的结构：

- `import`：这个组件需要什么，就自己引进来。这里引进了 React 的工具，也引进了 anime.js。
- `export default`：把这个组件交出去，让别的文件可以使用它。
- `function ResultCard()`：React 组件本质上就是一个函数。
- `return (...)`：函数返回一段长得像 HTML 的东西，这种写法叫 JSX。
- `className`：在 JSX 里，HTML 的 `class` 要写成 `className`。
- `useEffect`：组件出现在页面上后，执行一次动画逻辑。
- `ref`：拿到真实 DOM 节点，交给 anime.js 做动画。

这一张卡片里面，已经同时包含了：

- 数据：原文、拼音、情感分数、情感判断。
- 结构：`return` 里的标签层级。
- 样式：`className` 指向外部 CSS 里已有的样式规则。
- 行为：`useEffect` 里的淡入和数字滚动动画。

所以可以这样总结：

> **一个组件，就是把“数据、结构、样式、行为”这一整套，封装成一个能独立拎走的 UI 单元。**

这就是 React 的地基。后面整个项目，都是拿这种零件搭出来的。

---

## 第二拍：把整个文字实验室页面交给 React

现在结果卡片已经是 React 组件了。那文字实验室页面上的其他部分，也可以拆成组件。

这一页天然可以拆成几块：

- 顶部导航：`Nav`
- 大标题和副标题：`PageHeading`
- 输入卡片：`InputCard`
- 结果卡片：`ResultCard`
- 外层动画和网格容器：`AnimatedCardGrid`

然后再用一个大组件，把它们拼成整页：

```text
TextLabPage
├─ Nav
├─ PageHeading
├─ InputCard
└─ ResultCard
```

注意，`AnimatedCardGrid` 这类组件自己不一定展示具体内容，它更像一个容器：把别的组件包进去，统一提供布局和动画。这种组件在 React 项目里很常见。

### 1. 拷入页面相关组件

从 demo 里把这些文件拷进项目：

```text
src/components/Nav.jsx
src/components/PageHeading.jsx
src/components/InputCard.jsx
src/components/AnimatedCardGrid.jsx
src/components/TextLabPage.jsx
```

同时，把原来那 8 个 CSS 文件拷到：

```text
src/css/
```

为什么 CSS 也要进 `src`？

因为接下来 `text-lab.html` 会退化成一个挂载点，不再负责用 `<link>` 引入样式。样式会改由 React 入口文件 `import` 进来。

原来根目录下的 `css/` 先不要删，因为个人主页 `index.html` 此时还在用它们。

### 2. 换掉临时入口

第一拍的 `src/result.jsx` 只负责挂一个 `ResultCard`。现在 `ResultCard` 已经被收进 `TextLabPage` 了，所以这个临时入口可以不要。

新建：

```text
src/textlab.jsx
```

内容类似：

```jsx
import { createRoot } from "react-dom/client";
import TextLabPage from "./components/TextLabPage.jsx";

import "./css/reset.css";
import "./css/variables.css";
import "./css/layout.css";
import "./css/hero.css";
import "./css/nav.css";
import "./css/cards.css";
import "./css/lab.css";
import "./css/responsive.css";

createRoot(document.getElementById("root")).render(
  <div className="app-shell">
    <div className="page-shell">
      <main className="page-content">
        <TextLabPage current="textlab" onNavigate={() => {}} />
      </main>
    </div>
  </div>,
);
```

这里的 `app-shell / page-shell / page-content` 是页面外壳，负责背景、最大宽度、左右留白。

以前这层外壳写在 `text-lab.html` 里。现在 HTML 要清空了，所以暂时由入口文件补上。第四拍会把它们再交给更大的 `App` 统一管理。

### 3. 清空 `text-lab.html`

把 `text-lab.html` 的 `<body>` 整块内容，连同底部 script，都换成：

```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/textlab.jsx"></script>
</body>
```

`<head>` 里那些 CSS `<link>` 也可以删掉，因为 CSS 已经由 `src/textlab.jsx` 引入。

这一刻很关键：

> **HTML 从“页面主体”，退化成了“一个挂载点”。**

原来整页内容都写在 HTML 里。现在 HTML 只留一块空地，真正的页面由 React 画出来。

### 4. 保持 `index.html` 不动

此时个人主页 `index.html` 还是原来的 vanilla 页面，不要动。

运行：

```bash
npm run dev
```

你会看到：

- `localhost:5173/text-lab.html`：整页已经由 React 渲染。
- `localhost:5173/`：个人主页仍然是原来的 vanilla 页面。

这说明一个项目里可以出现“一个页面是 React，一个页面还是 vanilla”的过渡状态。

真实项目迁移时，这种阶段性共存也很常见。

---

## 看懂 `TextLabPage`：组件可以嵌套组件

打开 `src/components/TextLabPage.jsx`，它大概是这样：

```jsx
import Nav from "./Nav.jsx";
import PageHeading from "./PageHeading.jsx";
import AnimatedCardGrid from "./AnimatedCardGrid.jsx";
import InputCard from "./InputCard.jsx";
import ResultCard from "./ResultCard.jsx";

export default function TextLabPage({ current, onNavigate }) {
  return (
    <AnimatedCardGrid className="dashboard-grid">
      <article className="hero-stage panel-full">
        <Nav current={current} onNavigate={onNavigate} />
        <PageHeading title="文字实验室" subtitle="拼音和情绪，挖掘中文里的细节" />
      </article>

      <InputCard />
      <ResultCard />
    </AnimatedCardGrid>
  );
}
```

这里最重要的不是记住代码，而是看懂几条规则。

### 大写开头的是组件，小写开头的是 HTML 标签

`<Nav />`、`<PageHeading />`、`<InputCard />`、`<ResultCard />` 都是我们自己定义的 React 组件。

`<article>` 是普通 HTML 标签。

React 里有一条规矩：

> **组件名必须大写开头。**

因为构建工具翻译 JSX 时，会根据首字母大小写判断：

- 小写开头：当成浏览器原生 HTML 标签。
- 大写开头：当成你自己定义的 React 组件。

所以组件不是“随便写成标签样子”那么简单。它背后有一套明确的翻译规则。

### 组件挂到 HTML，需要入口；组件放进组件，只要写标签

第一拍里，我们把 `ResultCard` 挂到 HTML 页面上，需要写：

```jsx
createRoot(document.getElementById("result-root")).render(<ResultCard />);
```

但在 `TextLabPage` 里使用 `ResultCard`，只需要：

```jsx
<ResultCard />
```

原因是：

- 挂到 HTML：这是 React 世界和真实 DOM 世界的交界，需要 `createRoot`。
- 放进另一个组件：还在 React 世界内部，写成标签就行。

你可以把 `createRoot` 理解为“进入 React 世界的门”。整个项目通常只在入口处做一次。

### props：给组件传参数

这一行：

```jsx
<PageHeading title="文字实验室" subtitle="拼音和情绪，挖掘中文里的细节" />
```

里面的 `title` 和 `subtitle`，就是传给组件的参数，React 里通常叫 **props**。

同一个 `PageHeading`，你喂给它不同的标题和副标题，它就能显示不同内容。

这就是复用的基础。

---

## 第三拍：把个人主页也抽成组件

现在文字实验室已经整个交给 React 了。接下来处理个人主页。

从 demo 里拷入：

```text
src/components/HomePage.jsx
```

打开它，你会看到个人主页也被做成了一个大组件。

这里有两个点特别值得注意。

### 1. 复用终于变得很明显

个人主页顶部也用了：

```jsx
<Nav current={current} onNavigate={onNavigate} />
<PageHeading title="关于我" subtitle="项目，创意，灵感，心得，我的作品" />
```

这和文字实验室用的是同一套 `Nav` 和 `PageHeading`。

`Nav` 两页完全复用。`PageHeading` 则通过 props 显示不同内容：

- 在首页，`title` 是“关于我”。
- 在文字实验室，`title` 是“文字实验室”。

同一个组件，两处使用，只是参数不同。

如果以后要调整标题区域的样式，你只改 `PageHeading.jsx`，两个页面都会同时生效。

这就是组件复用最直接的价值。

### 2. 不是拆得越细越好

你也会看到，个人主页下面那两张卡片没有被单独拆成组件，而是直接写在 `HomePage` 里。

为什么？

因为它们只在首页用，内容也简单。拆出去换不来复用，反而多几个文件，让项目更碎。

拆组件不是为了显得专业，而是为了两个目的：

- 能复用。
- 让页面代码更清爽。

一块东西要不要单独拆成组件，就问两句话：

- 它会在多个地方用吗？
- 拆出去能让当前页面更好读吗？

如果答案都是否，那就没必要拆。

---

## 把两个页面收进 `App`

照前面的惯性，你可能会想：那我们再写一个入口，把 `HomePage` 挂进旧的 `index.html` 不就行了吗？

先别急。

现在我们已经有两个页面组件：

- `HomePage`
- `TextLabPage`

既然小组件可以装进大组件，那这两个页面组件，也可以装进一个更大的组件。

这个最大的组件，就叫：

```text
App
```

从 demo 里拷入：

```text
src/App.jsx
```

它的核心代码大概是：

```jsx
import { useState } from "react";
import HomePage from "./components/HomePage.jsx";
import TextLabPage from "./components/TextLabPage.jsx";

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="app-shell">
      <div className="page-shell">
        <main className="page-content">
          {page === "home"
            ? <HomePage current={page} onNavigate={setPage} />
            : <TextLabPage current={page} onNavigate={setPage} />}
        </main>
      </div>
    </div>
  );
}
```

`App` 是整个项目的总管。

它负责记住当前显示哪一页：是 `HomePage`，还是 `TextLabPage`。

这里出现了 `useState`。你现在只需要知道，它用来“记住一个会变化的值”。这节课不展开讲，下一节 4.4 会专门讲“状态”和“数据驱动界面”。

到这里，两个页面都已经变成 React 组件，并且被收进了 `App`。

但项目还不能直接跑，因为 `App` 还没有被挂到 HTML 上。

这就是最后一拍要解决的事。

---

## 第四拍：全新的 `index.html` 和 `main.jsx`

现在旧的两个 HTML 文件已经完成历史任务：

- 旧 `index.html` 原来装的是个人主页内容。
- `text-lab.html` 原来装的是文字实验室内容。

但现在这两个页面内容都搬进 React 组件了。

所以最终项目只需要一个新的 HTML 文件。注意，它不是原来的个人主页，而是一个全新的、几乎空白的 React 挂载壳。

### 1. 清理旧文件

此时可以删掉：

- 旧 `index.html`
- `text-lab.html`
- 第二拍临时用的 `src/textlab.jsx`
- 旧的 `js/` 文件夹
- 旧的 `css/` 文件夹

因为：

- 页面内容已经搬进 `HomePage` 和 `TextLabPage`。
- 样式已经搬进 `src/css/`。
- 老的 vanilla 脚本已经不再使用。

### 2. 新建 `src/main.jsx`

从 demo 拷入：

```text
src/main.jsx
```

它大概长这样：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

import "./css/reset.css";
import "./css/variables.css";
import "./css/layout.css";
import "./css/hero.css";
import "./css/nav.css";
import "./css/cards.css";
import "./css/lab.css";
import "./css/responsive.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

它就是整个 React 项目的总入口：把 `App` 挂进 HTML 的 `#root`。

### 3. 新建全新的 `index.html`

新的 `index.html` 只需要做一件事：提供挂载点，并引入 `main.jsx`。

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zero to Tech</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

这和最开始那个写满个人主页内容的 `index.html`，已经不是同一个角色了。

旧 `index.html` 是页面本身。

新 `index.html` 是 React 应用的空壳。

### 4. 运行和构建

运行：

```bash
npm run dev
```

打开：

```text
localhost:5173/
```

现在个人主页和文字实验室都由 React 渲染，点击导航可以在两页之间切换。

再构建一次：

```bash
npm run build
```

构建之后，Vite 仍然会输出浏览器认识的文件：HTML、CSS、JavaScript。

这正好印证了前面的结论：我们写的是 React，但最后交给浏览器的，仍然是基础前端三件套。

---

## 最终的 React 项目骨架

到最后，这个项目的层级会变成这样：

```text
index.html
└─ src/main.jsx
   └─ App.jsx
      ├─ HomePage.jsx
      │  ├─ Nav.jsx
      │  └─ PageHeading.jsx
      └─ TextLabPage.jsx
         ├─ Nav.jsx
         ├─ PageHeading.jsx
         ├─ InputCard.jsx
         ├─ ResultCard.jsx
         └─ AnimatedCardGrid.jsx
```

换成一句话：

- `index.html`：空壳，只提供挂载点。
- `main.jsx`：入口，把 `App` 挂进去。
- `App.jsx`：总管，决定当前显示哪个页面。
- `HomePage` / `TextLabPage`：页面组件。
- 更小的组件：页面里的零件。

这就是一个 React 项目最核心的骨架。

---

## 真正从 0 新建 React 项目，不用这么麻烦

这一节我们故意从一个 vanilla 项目开始，一步一步改成 React。

这样做是为了学习：你能看清 React 是怎么接进旧项目的，也能看清 HTML 是怎么从页面主体变成挂载点的。

但以后如果你真的从 0 新建一个 React 项目，不需要这么绕。

用 Vite 可以直接初始化：

```bash
npm create vite
```

按照提示选择：

- 项目名
- React
- JavaScript

Vite 会直接帮你生成一套 React 项目骨架：`index.html`、`src/main.jsx`、`src/App.jsx`、配置文件等。

你会发现，它生成出来的结构，和我们这一节最后手动改出来的结构非常像。

区别只是：我们这节课是为了理解，所以亲手走了一遍“从无到有”的过程。

---

## 框架真正难的不是语法，而是生态

现在我们已经知道：

> 框架是一套新规则，并且它还要能被构建工具翻译回浏览器认识的代码。

那你可能会冒出一个想法：

> 如果我有一套更好的代码组织思路，我是不是也能造一个新框架？

理论上，完全可以。

你可以定义自己的写法，再写一套翻译规则，让构建工具把它编译成 HTML、CSS、JavaScript。

造框架在技术上并不是遥不可及。

真正难的是另一件事：

> **你的框架，有生态吗？**

假设你要做一个后台管理系统，需要：

- 日期选择器
- 数据表格
- 图表
- 富文本编辑器
- 表单校验
- 弹窗
- 文件上传

如果你用 React 或 Vue，这些东西早就有人做好了。很多时候一行命令装进来，就能直接用。

比如 React 生态里有：

- Ant Design
- Material UI
- shadcn/ui
- React Bits

Vue 生态里也有：

- Element Plus
- Ant Design Vue
- Naive UI

但如果你造了一个全新的小众框架，对不起，这些轮子很可能都没有。一个日期选择器看起来简单，真要做到可用、稳定、各种边界都处理好，就可能耗掉好几天。

这就是生态。

一个框架值不值得用，很大程度上不只是看语法漂不漂亮，而是看它背后有没有：

- 现成组件
- 第三方库
- 教程
- 项目经验
- 社区问题解答
- 已经替你踩过坑的人

React 和 Vue 之所以是主流，不只是因为它们自己好用，更因为它们背后有足够厚的生态。

我们这一节复用的，还只是自己写的 `Nav` 和 `PageHeading`。

而框架生态真正带来的复用，是让你可以复用全世界开发者已经写好的东西。

这才是组件化、框架化最大的红利。

---

## 这一节你应该带走什么

这节课内容很多，但最重要的是这几件事：

- **React 是一套架在构建工具之上的前端开发新规则。** 你按 React 写，Vite 把它翻译成浏览器认识的 HTML、CSS、JavaScript。
- **React 的核心是组件。** 一个组件，就是把数据、结构、样式、行为封装成一个能独立拎走的 UI 单元。
- **组件可以嵌套组件。** 小组件拼成页面组件，页面组件再被 `App` 统一管理。
- **HTML 在 React 项目里会退化成挂载点。** 页面真正的内容由 React 组件渲染出来。
- **入口文件负责把 React 挂到 HTML 上。** `createRoot` 是进入 React 世界的门。
- **拆组件不是越细越好。** 拆组件是为了复用，或者为了让页面结构更清楚。
- **React 和 Vue 是同类工具。** 这门课选 React，是因为它生态大，但真正要学的是可迁移的概念。
- **框架最大的价值是生态。** 你不只是复用自己写的组件，还能复用全世界已经做好的组件和库。

下一节，我们继续围绕 React 组件往前走，把“状态”和“数据驱动界面”讲清楚，让页面真正跟着数据变化。

---

[← 上一节：模块 4.2 Vite、npm 与前端构建](/zero-to-fullstack/lessons/module-4-2/) | [下一节：模块 4.4 让数据驱动界面 →](/zero-to-fullstack/lessons/module-4-4/)
