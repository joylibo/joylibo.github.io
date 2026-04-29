---
title: "模块 3.2：把HTML拆分成三个文件"
meta_title: ""
description: "所有东西堆在一起的时候，麻烦还不够明显。拆开了，才能看清各自是什么。"
date: 2026-04-29T00:00:00+08:00
categories: ["零到全栈"]
tags: ["前端", "HTML", "CSS", "JavaScript", "项目结构"]
weight: 9
draft: false
---

> 所有东西堆在一起的时候，麻烦还不够明显。拆开了，才能看清各自是什么。

---

## 回顾一下现在的文件

上节课结束之后，`~/zero-to-tech/index.html` 里同时有三种代码：

- HTML 标签，构成页面结构
- `<style>` 块，里面是 CSS
- `<script>` 块，里面是 JavaScript

现在用 VS Code 打开这个文件夹，看一眼：

```bash
code ~/zero-to-tech/
```

你会看到，这一个文件里大约有六七十行代码。

目前还好。

但想象一下，随着页面内容越来越多，CSS 样式越来越丰富，交互逻辑越来越复杂，这个文件很快会膨胀到几百行。

那时候，你每次想修改一个按钮的颜色，都得先在 CSS 里找那一行；每次想调整一段文字，又得在 HTML 里翻一遍。不同性质的代码混在一起，越来越难找，越来越难改。

更何况，一个完整的项目不会只有一个页面。假如不同页面中有相同样式，那岂不是每个页面都要重复写一次一样的 CSS？

最关键的是，假如后续需要改样式，那么多个页面中的 CSS 样式就需要一个一个地改，那会是一场灾难。

即使我们不用自己改，而是让 AI Agent 来改，一个很大的文件对 AI 也是不友好的，因为 AI 自身有上下文长度的限制。

解决方法很直接：**拆开**。

把 CSS 单独放一个文件，把 JavaScript 单独放一个文件。

HTML 只保留结构，以及对 CSS 和 JavaScript 文件的引用。

---

## 拆分第一步：把 CSS 独立出来

**在 VS Code 里，新建一个文件，命名为 `style.css`：**

点击 VS Code 左侧文件栏上方的“新建文件”图标，或者在 `zero-to-tech` 文件夹内操作，确保这个新文件和 `index.html` 在同一个文件夹里。

**把 `index.html` 里 `<style>` 标签之间的内容，完整复制到 `style.css` 里：**

注意：复制的是 `<style>` 和 `</style>` 之间的内容，不包括这两个标签本身。

`style.css` 里的内容应该是这样的：

```css
body {
  background-color: #f0f4f8;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
  font-family: sans-serif;
}

.card {
  background: white;
  padding: 40px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 12px;
}

p {
  color: #666;
}

button {
  margin-top: 20px;
  padding: 10px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #2980b9;
}
```

**保存 `style.css`。**

然后，回到 `index.html`，把整个 `<style>...</style>` 块删掉，替换成下面这一行，放在同样的位置（`</head>` 之前）：

```html
    <link rel="stylesheet" href="style.css">
```

这一行的意思是：

> 去引入一个样式表文件，文件名叫 `style.css`，它在同一个文件夹里。

`href` 是文件路径，`style.css` 没有任何斜杠前缀，表示“和我在同一个文件夹”。

---

## 拆分第二步：把 JavaScript 独立出来

**在同一个文件夹里，再新建一个文件，命名为 `script.js`：**

**把 `index.html` 里 `<script>` 标签之间的内容，复制到 `script.js` 里：**

同样，复制的是标签之间的内容，不包括 `<script>` 和 `</script>` 本身。

`script.js` 里的内容应该是这样的：

```js
function changeText() {
  document.getElementById('msg').textContent = '你刚刚触发了一段 JavaScript。';
}
```

**保存 `script.js`。**

然后回到 `index.html`，把整个 `<script>...</script>` 块删掉，替换成：

```html
    <script src="script.js"></script>
```

这一行的意思是：

> 去引入一个脚本文件，文件名叫 `script.js`，它在同一个文件夹里。

注意这行放在 `</body>` 之前，位置和原来的 `<script>` 块一样。

---

## 拆分之后，index.html 应该变成这样

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <div class="card">
      <h1>你好，互联网</h1>
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>
      <button onclick="changeText()">点我试试</button>
    </div>

    <script src="script.js"></script>
  </body>
</html>
```

干净多了。HTML 文件里只剩下结构，没有任何样式或脚本的具体内容。

---

## 保存，刷新，验证

三个文件都保存之后，刷新浏览器。

页面的外观和行为应该和之前完全一样：

- 背景是浅灰色
- 内容在白色卡片里
- 点击按钮，文字发生变化

如果页面变成了没有样式的白底黑字，通常是 `style.css` 的路径写错了，或者文件名拼写有误。检查一下 `<link href="...">` 里的文件名是否和你创建的文件完全一致。

---

## 现在文件夹里有什么

打开访达，或者在 VS Code 左侧看文件栏，`zero-to-tech` 文件夹里现在有三个文件：

```text
zero-to-tech/
  index.html    ← 页面结构
  style.css     ← 样式
  script.js     ← 交互逻辑
```

这就是一个最小的前端项目结构。

每种代码有自己的文件，各司其职。以后需要改样式，直接打开 `style.css`；需要改交互，直接打开 `script.js`；需要改内容和结构，才去动 `index.html`。

这个拆分习惯，在真实项目里非常重要。

---

## 这节课结束时，你至少应该做到什么

- 文件夹里有三个文件：`index.html`、`style.css`、`script.js`
- 刷新浏览器后，页面外观和行为与之前完全一致
- 能说出 `<link rel="stylesheet" href="...">` 和 `<script src="...">` 各自在做什么
- 理解“同一个文件夹”和相对路径的关系

---

[← 上一节：模块 3.1 前端基础——HTML](/zero-to-fullstack/lessons/module-3-1/) | [下一节：模块 3.3 Git 与 GitHub →](/zero-to-fullstack/lessons/module-3-3/)
