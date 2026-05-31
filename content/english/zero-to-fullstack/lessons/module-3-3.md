---
title: "模块 3.3：Git 入门：给代码设置存档点"
meta_title: ""
description: "先把本地版本管理跑通：仓库、暂存区、提交记录与 .gitignore。"
date: 2026-05-31T00:00:00+08:00
image: "/images/module-3-3.webp"
categories: ["零到全栈"]
tags: ["Git", "版本管理", "commit", "gitignore", "仓库"]
weight: 10
draft: false
---

> 版本管理不是“高级流程”，而是你写代码时最实用的一颗后悔药。

---

## 为什么要学 Git

到目前为止，我们已经写过 `index.html`、`style.css`、`script.js` 三个文件。

接下来很容易发生这种情况：

- 你改了几处代码，页面突然坏了
- 你知道“刚刚改过”，但已经记不清改了什么
- 你想回到上一版，却没有回退点

在 AI 写代码的场景里也一样：第一版能跑，第二版优化后崩了，你让 AI “回到上一版”，却发现上一版并没有被可靠地保存。

这就是版本管理要解决的问题：

> 在改动前后保留清晰的历史，让你随时可以回看、比较、回退。

---

## Git 的核心作用

Git 是软件开发里最常用的版本管理工具。你可以先记住两件事：

### 1) 本地记录版本历史

Git 会在你的项目目录里记录每一次有意义的改动，这个动作叫 `commit`（提交）。

每次提交至少包含三类信息：

- 这次提交时，项目文件处于什么状态
- 提交发生在什么时间、由谁提交
- 你写的提交说明（例如“增加按钮样式”）

### 2) 先不讨论远程，只把本地跑通

这一节我们只做一件事：把本地仓库管理跑通。  
远程同步（GitHub）放在下一节。

---

## 仓库是什么

Git 的管理范围不是“整台电脑”，也不是“单个文件”，而是一个目录。

当你让 Git 开始管理某个目录，这个目录就叫 **仓库（repository）**。

例如：

- 目录：`~/zero-to-tech`
- 含义：这是一个本地 Git 仓库

你电脑里可以有很多个仓库，彼此互不影响。

---

## 第 1 步：确认 Git 已安装

```bash
git --version
```

如果看到类似 `git version 2.x.x`，说明已安装。

如果提示 `command not found`：

- macOS 通常会引导安装 Command Line Tools
- 也可以使用 Homebrew 安装
- 其他系统可从 Git 官方网站安装

---

## 第 2 步：配置提交身份（每台电脑一次）

先检查是否已配置：

```bash
git config --global user.name
git config --global user.email
```

如果未配置，执行：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

这两项会写入全局配置，后续提交会自动带上身份信息。

---

## 第 3 步：初始化仓库

进入项目目录并初始化：

```bash
cd ~/zero-to-tech
git init
```

然后查看状态：

```bash
git status
```

你会看到 `index.html`、`style.css`、`script.js` 多半是 `Untracked files`，意思是 Git 发现了它们，但还没纳入版本管理。

---

## 第 4 步：先配置忽略规则（.gitignore）

在 macOS 上，经常会出现 `.DS_Store`，它是系统显示设置文件，不属于项目代码，不应提交。

在项目根目录新建 `.gitignore`，写入：

```text
.DS_Store
```

这表示：以后 Git 会忽略该文件。

这里有个关键点：

- `.gitignore` 本身应该提交（它是项目规则）
- `.git` 不需要写进 `.gitignore`（Git 会自动管理）

---

## 第 5 步：第一次提交

### 先加入暂存区

把某个文件加入暂存区：

```bash
git add index.html
```

或者一次性加入当前目录全部改动（排除忽略项）：

```bash
git add .
```

再检查状态：

```bash
git status
```

看到文件进入 `Changes to be committed`，就表示已经准备好进入下一次提交。

### 再执行提交

```bash
git commit -m "第一次提交"
```

到这里，你已经建立了第一个可回退的版本点。

---

## 为什么建议你立刻再做一次提交

Git 的价值不是“完成初始化”，而是“持续记录变化”。

建议你现在做一个小改动（例如改一行标题文字），然后再走一遍：

```bash
git add .
git commit -m "修改首页标题文案"
```

这样你就会开始形成真正的版本管理直觉：  
每次有意义的改动，都应该落成一个可解释、可回退的提交。

---

## 常见误区

### 误区 1：只有大改动才值得提交

不对。只要改动有意义，就值得提交。小步提交比“大包提交”更安全。

### 误区 2：先不写提交说明，后面再补

不建议。提交说明就是“你当时为什么这么改”的最短注释，后补通常会失真。

### 误区 3：`.gitignore` 可有可无

不对。忽略规则越早建，项目越干净，后续协作越省事。

---

## 这一节结束时，你应该达到的状态

- `zero-to-tech` 已完成 `git init`
- 已配置（或确认）`user.name` / `user.email`
- 已创建 `.gitignore` 并忽略 `.DS_Store`
- 已完成至少一次 `commit`
- 理解 `git add`、`git commit`、`git status` 的关系

---

[← 上一节：模块 3.2 把HTML拆分成三个文件](/zero-to-fullstack/lessons/module-3-2/) | [下一节：模块 3.4 GitHub 与远程同步 →](/zero-to-fullstack/lessons/module-3-4/)
