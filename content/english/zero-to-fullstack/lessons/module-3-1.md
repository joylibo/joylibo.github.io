---
title: "模块 3.1：前端基础——HTML"
meta_title: ""
description: "代码能跑起来的那一刻，比任何解释都有说服力。"
date: 2026-04-29T00:00:00+08:00
categories: ["零到全栈"]
tags: ["前端", "HTML", "CSS", "JavaScript"]
weight: 8
draft: false
---

> 代码能跑起来的那一刻，比任何解释都有说服力。

---

## 找回之前的文件

在模块 2.3 里，你已经创建并编辑过一个 `index.html` 文件，它现在还在你的电脑里，路径是：

```bash
~/zero-to-tech/index.html
```

用 VS Code 打开它：

```bash
code ~/zero-to-tech/
```

请注意，我们用上面这行命令打开的是 `index.html` 所在的上层目录 `zero-to-tech`，而不只是打开 `~/zero-to-tech/index.html` 这一个 html 文件。

打开之后你会看到这份代码：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>
  </head>
  <body>
    <h1>你好，互联网</h1>
    <p>这是我的第一个网页，现在它还只是一个本地的 HTML 文件。</p>
  </body>
</html>
```

我们再用浏览器打开它看看：

```bash
open ~/zero-to-tech/index.html
```

你会看到一个非常朴素的页面：白底，黑字，没有任何装饰。

![](/images/module-3-1-page-1.webp)

这就是我们在 2.3 那一节已经见过的页面。这节课我们来继续发展它。让它变得好看一些，再让它能够响应你的操作，并理解背后发生了什么。

---

## 先认识一下这份代码

虽然你不需要学会写代码，但是这个代码文件真的太简单了，而且又太重要了，所以我们还是需要能够看明白它。

首先，第一行的内容是固定的，它只是为了告诉浏览器这是一份 HTML 文件，所以这一行你不需要关注。

```html
<!DOCTYPE html>
```

然后，就是许多尖括号 `<>` 括起来的结构，这些用尖括号括起来的东西，叫做**标签（tag）**。大多数标签成对出现：有开头，有结尾。比如 `<html>` 和 `</html>`，结尾的那个多一个斜杠。两个标签相互呼应形成一对儿，意思就是这两个标签中间的部分，就是 html 代码。

我们给它简化一下，就是：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
  </head>
  <body>
  </body>
</html>
```

你会发现在我们实际的代码中，`<html>` 标签里还有一些别的信息：

```html
<html lang="zh-CN">
```

这里的 `lang` 表示标签的属性，它的意思是 language（语言），这个属性的值是 `zh-CN`，就是简体中文的意思。整个这一行的意思是这个 html 标签内的内容语言是简体中文。

在这一对 `<html>` 标签的内部，还有一对 `<head>` 标签和一对 `<body>` 标签。

`<head>` 标签里的内容是页面的“头部”，放的是元信息，不会直接显示在页面上。

`<body>` 标签里的内容是页面的“身体”，这里的内容才会显示出来。

html 语法中有许多标签，但是不需要都懂，知道其基本结构就可以了。

到这里，你对 HTML 的了解已经够用了。

---

## 给它加上样式

现在这个页面太素了，我们来给它加一点样式。

**第一步：在 `<head>` 里，`</head>` 的前面，加入一段 CSS：**

下面这段代码是包裹在一对 `<style>` 标签内部的，这种格式叫做 CSS。如果我们在 index.html 中写入这些 CSS 代码，页面就会变一种样式，这就是 CSS 的功能。

复制下面这部分 CSS 内容：

```html
    <style>
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
    </style>
```

在 index.html 文件中找到这段代码，把复制的内容粘贴到 `</head>` 之前：

```html
  <head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>

    <!-- 把 CSS 插入到这个位置 -->

  </head>
```

> 这一步的意思是，定义了不同标签应该长什么样，并且把这个定义放在 index.html 中给浏览器来读取。

**第二步：修改 `<body>` 里的内容：**

修改之前：

```html
  <body>
    <h1>你好，互联网</h1>
    <p>这是我的第一个网页，现在它还只是一个本地的 HTML 文件。</p>
  </body>
```

修改之后：

```html
  <body>
    <div class="card">
      <h1>你好，互联网</h1>
      <p>这是我的第一个网页，现在它有了一点样式。</p>
    </div>
  </body>
```

> 这一步的意思是，告诉浏览器 `<div>` 标签是 `card` 类，用 css 里面的 `.card` 样式定义来显示页面。浏览器并不“理解”card 这个词，它只是去匹配有没有 `.card` 这条规则。

保存文件，刷新浏览器。

页面变了：有了浅灰色背景，内容被放进一张白色卡片里，文字的颜色和位置也变了。

![](/images/module-3-1-page-2.webp)

这些变化，全部来自你刚才加入的那段 `<style>` 代码。你会发现 `<style>` 标签内部的代码不太一样，那些内容并不总是用尖括号包裹，而是一些大括号 `{}`。

> CSS 负责描述“这些内容应该长什么样”。

---

## 让它动起来

光有样式还不够。现在加一个按钮，点击之后页面上的文字会变化。

**第一步：给段落加上 `id="msg"` 属性：**

加属性之前：

```html
      <p>这是我的第一个网页，现在它有了一点样式。</p>
```

加属性之后：

```html
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>
```

> 这一步的意思是，给 `<p>` 标签加一个 id，让浏览器后续可以准确定位到它。

**第二步：在段落下方、`</div>` 前面，加入一个按钮：**

加按钮之前：

```html
    <div class="card">
      <h1>你好，互联网</h1>
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>
    </div>
```

加按钮之后：

```html
    <div class="card">
      <h1>你好，互联网</h1>
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>

      <button onclick="changeText()">点我试试</button>

    </div>
```

**第三步：在 `</body>` 前面，加入这段脚本：**

```html
    <script>
      function changeText() {
        document.getElementById('msg').textContent = '你刚刚触发了一段 JavaScript。';
      }
    </script>
```

检验一下，完成上面三步之后，`<body>` 标签内部会变成这样：

```html
  <body>
    <div class="card">
      <h1>你好，互联网</h1>
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>
      <button onclick="changeText()">点我试试</button>
    </div>
    <script>
      function changeText() {
        document.getElementById('msg').textContent = '你刚刚触发了一段 JavaScript。';
      }
    </script>
  </body>
```

保存，刷新，点击按钮。文字变了。

你也会发现，在我们上面第三步用到的 `<script>` 标签内部，代码写法看起来和 html、CSS 都不一样。

没错，这是一种新的语法，它叫做 JavaScript。在加入它之前，点击按钮是没有作用的；加入之后，再点击按钮就可以改变页面文案。

这就是 JavaScript 在做的事：

> JavaScript 负责描述“当某件事发生时，应该做什么”。

---

## 完整代码

以上步骤全部做完之后，你的 `index.html` 应该长这样。

如果中间出了什么问题，可以把下面这份代码完整复制进去，覆盖原来的内容：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <title>我的第一个网页</title>
    <style>
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
    </style>
  </head>
  <body>
    <div class="card">
      <h1>你好，互联网</h1>
      <p id="msg">这是我的第一个网页，现在它有了一点样式。</p>
      <button onclick="changeText()">点我试试</button>
    </div>

    <script>
      function changeText() {
        document.getElementById('msg').textContent = '你刚刚触发了一段 JavaScript。';
      }
    </script>
  </body>
</html>
```

---

## 三层分工

现在这份文件里同时有三种代码，它们的分工是这样的：

| 层 | 写在哪里 | 负责什么 |
|----|----------|----------|
| HTML | `<body>` 里的标签 | 内容和结构：页面上有什么东西，怎么组织 |
| CSS | `<style>` 块 | 样式和外观：这些东西长什么样 |
| JavaScript | `<script>` 块 | 行为和交互：发生了什么事，应该做什么 |

这三层分工，是前端开发的基础直觉。

注意，现在这三层都还挤在同一个文件里。项目还小的时候，这没有任何问题。但随着内容越来越多，你会开始感觉不方便。下一节我们就来处理这件事。

---

[← 上一节：模块 2.4 准备好云服务器](/zero-to-fullstack/lessons/module-2-4/) | [下一节：模块 3.2 拆分成三个文件 →](/zero-to-fullstack/lessons/module-3-2/)
