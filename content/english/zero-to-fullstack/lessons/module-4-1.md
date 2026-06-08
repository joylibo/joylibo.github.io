---
title: "模块 4.1：现代前端第一步——模块化"
meta_title: ""
description: "项目长大后，旧的传统组织方式撑不住了。这一节我们亲手把双页面项目改造成 ES 模块化版本，看清 import / export 是怎么治掉顺序坑和全局污染的。"
date: 2026-06-08T00:00:00+08:00
image: "/images/module-4-1.webp"
categories: ["零到全栈"]
tags: ["模块化", "ES Module", "import/export", "工程化", "anime.js"]
weight: 13
draft: false
---

> 在 HTML 中引入 css 和 js 脚本的做法很容易理解，但是当网站逐渐变大时，它们将会不可避免地走向混乱。

---

## 回头看一眼：我们已经会什么

模块 3.2 那一节，我们已经亲手把一个 `index.html` 拆成了三个文件——HTML、CSS、JS 各管各的。并且三个文件最终都能被浏览器所加载和使用，靠的就是这两行：

```html
<link rel="stylesheet" href="style.css">
<script src="script.js"></script>
```

这两行，就是这门课目前为止 "把 js / css 文件接进 HTML" 的**全部本事**——同一个文件夹下、写明文件名、浏览器自然去取来用。

模块 3 一路走下来，我们已经能用它做出一个完整的小网页，并把它**部署到公网**了。

那么，接下来呢？

---

## 我们尝试给网站添加更多的页面和元素

还记得模块 1.2 我们提到的这门课的"最终产品"需要什么样的功能吗？

> **一个个人主页 + 一个文字实验室**

我们模块 3 实现的那张 "你好世界" 卡片，只是它的**雏形**。模块 4 这一整段，就是把它的页面结构全部开发**成形**。

第一步，我们的网站要长成下面这个样子：

- 两个页面：**个人主页** + **文字实验室**
- 一个**全站导航栏**，每页顶部都有
- 一组**卡片**：进入页面，卡片随机展示，并带有自然的动画效果
- 文字实验室里，点"开始分析"按钮，**情感分数会有一个动画效果**——像真在计算一样

有了 3.1 和 3.2 这两节的基础，其实实现这样的功能并不难，我们都可以让 AI 帮我们把页面做出来——无非就是从一个 html 文件变成了两个 html 文件，无非也就是需要更多的 `.css` 文件和 `.js` 文件，内容变多了，但是并没有增加什么新的知识。

我已经替你做好了，代码就在这里，你可以看一下。

打开 `zero-to-tech-4-1/`，双击 `index.html`，可以看到网站真的已经是我们期待的样子了。

---

## 变大之后的 zero-to-tech

打开项目的文件目录，我们看一看文件结构：

```text
zero-to-tech-4-1/
  index.html
  text-lab.html
  css/    ……8 个 css 文件，每个负责一类样式
  js/
    cards.js    ← 卡片飞入动画
    score.js    ← "开始分析"按钮的分数动画
    nav.js      ← 给当前页的导航高亮
```

项目中的文件比之前变多了——首先是从一个 html 文件变成了两个，分别是 `index.html` 和 `text-lab.html`，多了几个 `.css` 文件、也多了几个 `.js` 文件。

这些 `.css` 文件和 `.js` 文件被引入到了 `.html` 文件之中，我们可以打开 `index.html` 文件看一看。

看 `<head>` 里那一长串 `<link>`，再看 `</body>` 之前那几行 `<script>`：

```html
<link rel="stylesheet" href="css/nav.css">
<link rel="stylesheet" href="css/cards.css">
…
<script src="js/cards.js"></script>
<script src="js/score.js"></script>
<script src="js/nav.js"></script>
```

这些都是我们在 3.2 那一节的时候见过的写法——把 css 和 js 引入到 html 之中，让浏览器去加载。

### 引用第三方资源

只有一处和我们此前见到的稍微不一样。我们目前能理解的用 `<script src=""></script>` 这种写法引入进来的，都是一个本地的文件相对路径，比如：

```html
<script src="js/nav.js"></script>
```

这一句的含义就是：把当前目录下的 `js` 目录下的 `nav.js` 文件引入进来。

但是在现在的 `index.html` 代码中，我们却看到了这样一行引入：

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js"></script>
```

这其实是一个新的知识点——HTML 的 `<script>` 标签不仅仅可以引用本地路径的 `.js` 文件，还可以使用别人发布在互联网上的其他 `.js` 文件。

这个 `anime.iife.min.js` 就是一个别人做好的、发布到互联网上的 js 脚本，它的地址是 `https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js`。

这个 js 脚本是专门提供动画方案的，这种第三方的现成的动画脚本，我们把它叫做**第三方库**。

我们项目中的卡片加载时那个丝滑动画，就用了这个第三方动画库来做。

对于这种第三方库，我们可以直接在 html 文件中用 URL 地址来引入，所以这一行：

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js"></script>
```

这一行和：

```html
<script src="js/cards.js"></script>
```

**本质是一样的**——把一个 js 文件引到页面上。**唯一的区别**是：`js/cards.js` 是个**本地**文件、`https://...` 是个**网络上**的文件。也有人把后一种叫做 **CDN 引用**。

> 在浏览器眼里，这俩都只是"一个资源"——一个住在你硬盘上、一个住在某个公开服务器上。
>
> **你完全可以把那个网址里的内容下载到本地、存成 `anime.iife.min.js`，再写 `<script src="anime.iife.min.js">`，效果一模一样**。
>
> 之所以走 CDN，只是省得自己存一份——别人的服务器替我们存了。

### 使用第三方资源

anime.js 被引进来之后，它并不知道应该把什么类型的动画，应用在哪个元素上——它只是提供了一些动画的参数和计算方法，至于这些动画在我们的页面中怎么用，还需要我们再提供应用的脚本。

这就是 `cards.js` 文件做的事情——把第三方库里面声明的动画方法应用到具体的 html 页面元素中。

我们的 `cards.js` 怎么用它？打开 `js/cards.js`：

```js
anime.animate(".card", {
  delay: anime.stagger(120),
  ease: "outBack",
  // …
});
```

它**直接用动画库里面声明好的东西**——`anime.animate`、`anime.stagger`，你先不用管这俩是啥，你只需要知道这两个东西是 anime.js 这个第三方库定义好的，因为第三方库已经被 html 引用了，所以 `cards.js` 直接就可以用。

注意一件**关键的事**：`cards.js` 并不需要声明它要用 anime.js。它直接用就可以了。

也就是说，我们埋下了一个**暗依赖**：

> **`cards.js` 依赖 anime.js**

因为有这层依赖关系，所以往浏览器的 html 中引入 anime.js 的那个 `<script>` 标签，一定要放在引入 `cards.js` 的那个 `<script>` 标签的前面。

这个世界上，总有一些像 anime.js 这样开源的项目，他们提供开发好的动画库、3D 图形库，甚至一些特定的业务库，我们不用重新造轮子，直接引入就能用。一切都看起来挺美好。

---

## 灾难的发生

### 灾难一：四行 `<script>`，顺序错了就崩

回忆一下我们刚说的那条**暗依赖**——`cards.js` 默默依赖 anime.js，所以在浏览器执行 `cards.js` 的时候，需要 anime.js 已经加载好。

这条依赖**没写在任何代码里**，它**只藏在 HTML 这四行 `<script>` 的先后顺序里**。

也就是说：**`anime.iife.min.js` 必须排在 `cards.js` 之前**。一旦顺序错了，`cards.js` 跑的时候 anime.js 中定义的内容在浏览器里还不存在，整个动画当场报废。

**我们可以亲手试一试** ——

1. 用浏览器打开 `index.html`，刷新——卡片正常飞入。OK。
2. 现在打开编辑器，把 `<script>` 的前两行**调换**一下：
   ```html
   <script src="js/cards.js"></script>   <!-- cards 跑的时候 anime 还没加载 -->
   <script src="https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js"></script>
   <script src="js/score.js"></script>
   <script src="js/nav.js"></script>
   ```
3. 保存，回浏览器刷新页面。
4. 看效果——**卡片再也不飞入了**。F12 看控制台，一行刺眼的红字：
   ```text
   Uncaught ReferenceError: anime is not defined
   ```

就因为一行 `<script>` 排错位置，整个卡片动画当场报废。可这条"anime.js 必须最先加载"的规矩——**完全藏在这几行 `<script>` 标签的排列里**，代码里没有任何一句话写明它。文件一多、依赖一交错，光排顺序就够你抓狂。

> 做完实验，记得把两行调回原顺序。

### 灾难二：全局污染——所有人都挤在同一间屋子里

回忆一下：`cards.js` 之所以能跑，是**靠** `anime.animate`、`anime.stagger` 这些名字。这就是传统 `<script>` 的"约定"——**库往当前页面全局提供自己的名字，使用者从全局拿**。

> 这就好像一个屋子里面，就俩人，其中一个人张三从家里带来了四样东西：笔、墨、纸、砚，放在了一个共享的台面上，然后说屋子里的人随便用。那李四要用笔的时候直接用了。
>
> 但是，如果屋子里的人逐渐变多呢？每个人都会从家里带一些东西放在这个台面上呢？

等项目长得更大，你引的库就不只 anime.js 了——再加一个图表库、一个日期处理库、一个 ajax 工具库……**每个库**都靠"往页面上挂自己的名字"的方式提供功能。

那么——**万一两个库都挂了同名的东西，会怎么样？**

你大概能猜到答案：**会撞名**。而 JavaScript 全局空间里，一个名字只能存一个值——**后来挂上去的，会悄悄盖掉先挂上去的**，没人通知你。

这种现象，在编程领域有一个专门的词，叫 **全局污染**（global pollution）。

打个现实里的比方：

> 张三放在屋子里的纸是用来写字的，后来又来了一个赵六带来了一包纸巾，也叫"纸"，因为赵六来得晚一点，所以在台面上，他的"纸"就覆盖了张三的纸。
>
> 这带来的后果就是，李四某次需要用纸写字的时候，发现根本就写不成。

代码世界里的全局污染就是这种感觉：你拿到的"纸"，可能不是你以为的那一个。等到 `cards.js` 里那句 `anime.animate(...)` 跑出诡异结果，你完全猜不到它**到底用的是哪一个 `anime`**——是 CDN 引来的那个？还是被某个后引的库悄悄替换掉的那个？

项目小的时候，你能记住每个库挂了什么、自己写了什么。**项目一长大，撞名就是迟早的事**——而每一次撞，都是一个让人抓破头的 bug。

---

## 破局方法

`<script>` 顺序 + 全局污染——它们看着是两件事，根上是同一件事：

> **"全堆在一起 + 全局名称（变量） + 手排顺序"的传统组织方式，本来就不是给"严肃项目"准备的。**

不是工程师的水平不够；是工具本身到了它的能力上限。

全世界的前端开发者，都撞过这堵一模一样的墙。这堵墙撞多了，他们慢慢长出来一整套翻越它的方法——这套方法，统称叫"**工程化**"。

它的**第一招**，叫**模块化**。

---

## 模块化的实现方法

在看具体代码之前，先用一段话把模块化是什么讲清楚。它和传统方式**只在一件事上不一样**——

> **传统方式**：你写的东西默认"全世界都看得见"（都堆在一个叫做 `window` 的全局空间里），库提供的功能也默认"全世界都看得见"。**共享靠"公共"**。
>
> **模块化**：你写的东西默认"只有自己看得见"；想给别人用，得**明文标 `export`**；想用别人的，得**明文写 `import`**。**共享靠"明文声明"**。

`export` 和 `import` 就是模块化的两个新词。它们做的事都很简单：

- **`export`**：在文件里给某个东西打上"对外可用"的标记——**没标的，外面拿不到**。
- **`import`**：在文件顶部明文写"我要用某个文件里的某个东西"——**不写的，你就用不到**。

> 你**完全不用学怎么写它们**。我们不教语法。你只要了解这两个词、记住它们各自起什么作用就够了。

### 顺便交代一个名词：什么是 "ES"

后面我们会反复看到 "**ES 模块**"、"**ES6**"这一类说法。我们顺手把这个词解释清楚——

> **`ES` 是 `ECMAScript` 的缩写**，它是 **JavaScript 这门语言的"官方标准规范"**。
> 所有浏览器、所有 JS 引擎，都得按照这份规范来实现 JavaScript。
> 你也可以这样理解：**我们日常说的"JavaScript"，本质上就是"按 ECMAScript 规范做出来的那套东西"**。

所以：

- **"ES 模块"** = "JavaScript 标准里定义的那套模块系统"——它不是另一种语言、也不是什么新东西，**就是 JavaScript 自带的官方模块方案**。
- **"ES6"** = ECMAScript 的**第 6 版**（2015 年发布）。我们刚才说的 `import` / `export`，就是在 ES6 这一版里**被正式定义**的。

> 记住一句话就够了：**看到"ES"，就在脑子里替换成"JavaScript 官方标准"**。

---

听上去像是给自己添麻烦——以前 `window` 空间里全是大家都能拿的东西，现在每个东西都得明文 export、明文 import。可这恰恰是模块化最有价值的地方——它**直接把前面两痛的根拔了**：

- 想知道一个文件依赖什么？翻到顶上看 `import` 那几行——**白纸黑字写在那儿**。再没有"暗依赖"，script 顺序坑自然不存在。
- 两个文件想用同名的东西？**根本撞不上**——每个文件 `import` 进来的，都只活在自己模块里的局部变量。回到 "纸" 那个比喻：**每个人都有了自己的小柜子**，再也不挤一个共享的台面上。

下面我们就把项目按照模块化改造一遍，看看 `import` / `export` 在真代码里长什么样。

---

## 把我们的项目按照模块化来改造

首先，我们重写 `cards.js`。

`cards.js` 目前的写法是：

```javascript
(function () {
  anime.animate(".card", {
    opacity: [0, 1],
    translateY: [24, 0],
    delay: anime.stagger(120), // 每张卡错开 120ms
    duration: 700,
    ease: "outBack", // 弹性落地
  });
})();
```

我们给它改掉，改成：

```javascript
import { animate, stagger } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";

export function initCardsAnim() {
  animate(".card", {
    opacity: [0, 1],
    translateY: [24, 0],
    delay: stagger(120), // 每张卡错开 120ms，自动排好节奏
    duration: 700,
    ease: "outBack", // 弹性收尾，落地像有重量
  });
}
```

此时，`cards.js` 中使用的已经不是公共的 anime.js 了，而是自己单独引用的一份 anime.js。

接下来我们给 `score.js` 也改了，把原有的代码删掉，换成：

```javascript
import { animate, scrambleText } from "https://cdn.jsdelivr.net/npm/animejs@4/+esm";

export function initScoreAnim() {
  var btn = document.querySelector(".primary-button");
  var scoreEl = document.querySelector("[data-score]");
  if (!btn || !scoreEl) return; // 个人主页没这俩元素

  btn.addEventListener("click", function () {
    animate(scoreEl, {
      innerHTML: scrambleText(),
      duration: 1500,
    });
  });
}
```

此时，我们的数字动画也是用 anime.js 了，注意网址末尾的 `+esm`——这是 anime.js 的 **ES 模块版本**，它代表的是按照模块化的规范来组织的 anime 动画库。

接下来，我们给 `nav.js` 也改成模块化版本。它是给顶部导航栏做高亮的，这个文件没用任何外部东西——但它和 `cards.js` / `score.js` 一起，都挤在同一个"全局空间"里，谁要在顶层定义同名变量都会撞车。所以我们也给它做模块化改造。改造之前它的内容是：

```javascript
(function () {
  var path = location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll(".nav-link");
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href");
    if (href === path) links[i].classList.add("active");
    else links[i].classList.remove("active");
  }
})();
```

改造之后，它变成了：

```javascript
export function initNav() {
  var path = location.pathname.split("/").pop() || "index.html";
  var links = document.querySelectorAll(".nav-link");
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute("href");
    if (href === path) links[i].classList.add("active");
    else links[i].classList.remove("active");
  }
}
```

注意，改造前后**只有头尾两处不一样**：外层的 `(function () { ... })();` 自调用包裹变成了 `export function initNav() { ... }`，**中间的逻辑一字未改**。这就是模块化要的全部：把这块代码从"立即跑"改成"对外暴露一个能被别人调用的函数"。

最后，我们再在 `js` 目录下，新建一个 `main.js` 文件，写入如下内容：

```javascript
import { initNav } from "./nav.js";
import { initCardsAnim } from "./cards.js";
import { initScoreAnim } from "./score.js";

initNav();
initCardsAnim();
initScoreAnim();
```

最后，我们分别编辑 `index.html` 和 `text-lab.html`，把这两个文件底部的多个 `<script>` 标签：

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4/lib/anime.iife.min.js"></script>
<script src="js/cards.js"></script>
<script src="js/score.js"></script>
<script src="js/nav.js"></script>
```

改为一行：

```html
<script type="module" src="js/main.js"></script>
```

至此，我们已经完成了模块化改造。改造完成后，项目的文件结构看起来差不多，但本质已经完全变了：

```text
index.html       ← 注意：只引一行 <script>
text-lab.html
css/             ……还是那 8 个 css
js/
  cards.js       ← import { animate, stagger } from "…anime.js"
  score.js       ← import { animate, scrambleText } from "…anime.js"
  nav.js         ← 不依赖任何外部库
  main.js        ← 入口：import 上面三个，调用它们
```

最关键的变化是，在两个 `html` 的 body 底部：

```html
<script type="module" src="js/main.js"></script>
```

**就这一行**——之前那四个、还得小心排顺序的 `<script>`，**没了**。

到这里你已经见到 `import` / `export` 实际长什么样了。**这就是模块化在真代码里的样子**——每个文件顶上 `import` 自己要的、用 `export` 标自己要给外面的。

---

## 模块化改造之后的访问方式

改完之后，你大概会迫不及待地刷新浏览器、看看新版本跑不跑——可你很快会撞上一个意外：

> **页面是白的，F12 控制台一行跟 CORS 有关的错误。**

这不是你哪里改错了——而是 ES 模块的一条**新规矩**：

> **ES 模块文件必须通过"服务器"提供出来才能加载——浏览器不允许直接从 `file://` 读取。**

也就是说，从这一刻起，**双击 `index.html` 直接打开**这种我们从模块 3 一路用过来的方式，**对模块化的代码不再适用了**。

### 为什么这么严格？

简单说，ES 模块走的是浏览器**加载网络资源**的那一套机制——每个模块文件都得被"正式请求"，有"来源"（origin）才行。而 `file://` 这种"本地直接打开"，**没有真正意义上的来源**——浏览器干脆不许。

> 背后是安全考虑：模块化代码可以从一个文件 `import` 另一个、还能从网络 `import` 别人的库。如果浏览器对"本地双击打开"也开这道门，意味着任何一个你不小心双击的 html 文件，都能读你硬盘上的别的文件、或者悄悄从网络上拉一堆代码下来跑——**这是个大漏洞**。
>
> 浏览器一刀切：模块化的代码，**得走服务器**。

### 服务器你早就有了

这台"服务器"，你早就有了——**模块 3.5 那台 Nginx 云主机**。把项目部署上去（模块 3.5 教过的那一整套：push → 服务器 pull → Nginx 指向它），打开公网 IP，就能看到改造后的项目跑起来的样子——清爽的代码组织、流畅的卡片入场、丝滑的 scramble 数字。

> 模块 3.5 教你"把网页发布到服务器"，在这里马上就用上了——一点都没浪费。

---

## JS 的模块化演变之路

你可能会想：这套"`<script>` 顺序、全局污染"的痛，世界上的开发者一定撞了好几年才发现的吧？

不止"几年"——**整整 20 年**。

JavaScript 这门语言从 **1995 年**诞生，**前 20 年没有官方的模块系统**。所有人都用 `<script>` 标签拼项目、靠 `window` 全局变量传东西、手排 script 顺序——你刚才在改造前那一版项目里看到的那堵墙，**整个前端界撞了 20 年**。

这 20 年里，工程师们当然没坐着干等——他们在自己的领域里摸索出了各种"模块化"方案。其中最有名的一个，是 2009 年随着 Node.js 诞生的 **CommonJS**。它和我们今天用的 ES Modules **本质是同一回事**——同样的思想（每个文件管好自己的依赖、互不污染），只是写法略有不同。但 CommonJS 终究是社区自己的方案，不是 JavaScript 这门语言**自己**的官方标准。

直到 **2015 年**，JS 在 ES6 这个版本里**正式定义了 `import` / `export` 语法**——模块化从这一天起，才真正成为 **JavaScript 语言底层支持的标准**；**2017 年前后**，主流浏览器（Chrome、Safari、Firefox、Edge）才陆续原生支持 `<script type="module">`。

也就是说，你刚才写下的 `import { animate } from "..."` 这件事，**真正能用还不到十年**。但它一出场，就把前 20 年的痛**一并根治**了。

> 这就是为什么我们说"模块化是工程化的**第一块基石**"——它不是某个聪明人随手发明的工具，是 **20 年的痛逼出来的**那条路。
>
> 顺带也解释了你刚撞上的那个"不能双击打开"——新东西换来了好处，也带来了一些**比以前严格的规矩**（都是为了安全）。

---

## 你刚才其实做了一件大事——两件灾难，悄悄被治了

慢一拍，回头看一眼你刚才改完的代码。前面那两件让人抓狂的灾难，**已经各自被根治**——它们怎么消失的，我们盘一盘。

### 第一件：script 顺序坑，消失了

**改之前**，HTML 底部是四行 `<script>`，顺序错一格就崩。
**改之后**，HTML 底部只剩**一行** `<script type="module" src="js/main.js">`。

那 `main.js` 又是怎么知道要先加载 anime.js、再跑 `cards.js` 的？——看 `cards.js` 顶上那行 `import { animate, stagger } from "..."`。浏览器读到这句，会**自己**去取那个网址、加载完再回来跑 `cards.js`。**顺序由代码声明、浏览器执行**——再也不藏在 `<script>` 的排列里。

我们刚刚亲手把"暗依赖"变成了"明依赖"。

### 第二件：全局污染，根本不存在了

**改之前**，那行 anime.js CDN 的 `<script>` 把 `anime` 挂到了 window 全局上，所有文件共用。
**改之后**，你**亲手删掉了那行 CDN `<script>`**——`anime` 这个名字，在你这个项目里**再也不存在于全局空间**。

`cards.js` 和 `score.js` 各自顶上 `import` 自己要用的部分进自己的文件里。两个文件里都叫 `animate` 的那个名字，**根本不是同一个东西**——各自只活在自己的文件里。

回到我们"屋子里那张共享台面"的比方：**模块化等于给屋子里每个人配一个自己的私人小柜子**——张三的笔墨纸砚锁在他自己柜子里、赵六的也锁在他自己柜子里，不再共用台面。要从别人那里"借"东西？**得明文写 `import` 去借**。

> 想引第二、第三个库？各自 `import` 就行，不再挤一个公共空间、不再担心谁覆盖谁。

---

## 改造前 vs 改造后，摆一起对比

| | 改造前（传统 `<script>`） | 改造后（模块化 `import`） |
|---|---|---|
| anime.js 怎么进来 | `<script src="…">` 挂在 window 全局 | 每个文件 `import` 自己要的部分 |
| JS 怎么引 | 四个 `<script>`，**顺序不能乱** | 一个入口，依赖写在代码里 |
| 函数怎么共享 | 全靠 `window` 全局变量 | 显式 `import` / `export`，模块自己作用域 |
| 用别人的库 | 找 CDN、塞 `<script>`、防全局撞名 | 一行 `import`，要谁挑谁 |
| 怎么打开 | 双击就行 | 得通过服务器（部署到 3.5 那台） |

> 注意一件事：**HTML、CSS 一个字没改**；**用的也是同一个 anime.js**。换的只是"怎么把它拉进项目、怎么组织自己的代码"——
> 这就是"**工程化**"四个字最朴素的含义。

> 你也许注意到：改造后的"开始分析"按钮动画**比改造前帅**——分数会洗一遍乱码再定格（用了 anime.js 的 `scrambleText` 特效），而不是改造前那种 setInterval 一格一格滚的电子表效果。这是因为 anime.js v4 把 `scrambleText` 这个高级特效**只放在了 ES 模块版本里**，传统 `<script>` 那一版根本没塞。所以模块化改造之前，我们其实压根儿就够不着 `scrambleText`——这才是改造前 `score.js` 只能退而求其次手写 setInterval 的真实原因。

---

## 这节课结束时，你至少应该理解什么

- **传统手写组织方式有它的上限**：`<script>` 顺序坑、全局污染——这两件事都是"全堆在一起"自带的毛病，项目越大越疼
- 这不是你的错——是这种组织方式自己到头了；翻越它的那套东西，统称"**工程化**"
- **第一招：模块化** —— 每个文件用 `import` / `export` 自己声明依赖，浏览器替你算顺序，全局不再被污染（**你不用学怎么写 `import`，只要懂它带来的变化**）
- 模块化有个小代价：代码不能再双击打开，**得通过服务器跑**——而模块 3.5 那台 Nginx 你已经有了，原样部署上去就能看
- 顺便见识了"生态的力量"——别人打磨好的工具（像 anime.js 的 `stagger`、`scrambleText` 这一票），一行 `import` 就能为你所用；**这个生态本身的名字、怎么把它真正"驻"进项目**，是下一节的事

下一节，我们让这套模块化的代码**真正变成一个"工程"**——把它搬进一个叫 Vite 的容器里，请出现代前端真正的命令行节奏。

---

[← 上一节：模块 3.5 把网页发布到公网](/zero-to-fullstack/lessons/module-3-5/) | [下一节：模块 4.2 构建 →](/zero-to-fullstack/lessons/module-4-2/)
