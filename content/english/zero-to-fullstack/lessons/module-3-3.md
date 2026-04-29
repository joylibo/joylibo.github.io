---
title: "模块 3.3：Git 与 GitHub"
meta_title: ""
description: "代码需要被管理。不是因为你会出错，而是因为你会改动。"
date: 2026-04-29T00:00:00+08:00
categories: ["零到全栈"]
tags: ["Git", "GitHub", "版本管理", "仓库", "SSH"]
weight: 10
draft: false
---

> 代码需要被管理。不是因为你会出错，而是因为你会改动。

---

## 从一个具体的麻烦说起

前两节课，我们一直在修改三个文件：`index.html`、`style.css`、`script.js`。

现在假设你做了一些修改，改完之后发现页面出了问题，但你想不起来改了什么，也不知道从哪里往回找。

或者：你打算做一次大改动，但不确定改完以后会不会更好。

这种时候，你会希望有一个功能：

> 在改动之前，先把现在的状态保存下来。万一不对，能直接回到这里。

这就是**版本管理**要解决的问题。

---

## Git 是什么：给代码设置存档点

你可能玩过电子游戏。很多游戏里有一个设计：在关键位置可以手动存档，之后如果角色死了或者走错了，可以读取存档，回到那个时间点重新来过。

Git 对代码做的事情，和这个几乎一样。

它允许你在任意时刻给当前的代码状态“存一个档”。

这个存档动作，在 Git 里叫做 **commit（提交）**。

每次 commit 都会记录：

- 当时所有文件的完整状态
- 这次 commit 是什么时候做的
- 你写的一句说明（比如“加了按钮样式”）

如果以后你想回到某个 commit 时的状态，Git 可以做到。

---

## Git 做的两件事

当你让 Git 开始管理一个文件夹，这个被 Git 管理的文件夹就叫做**仓库（repository）**。

比如说，你让 Git 来管理你电脑上的 `zero-to-tech` 文件夹，那么这个文件夹在 Git 的语境下就叫做**本地仓库**。

Git 主要有两个用处：

**第一个：本地版本管理**

在你自己的电脑上，记录每次有意义的改动，随时可以查看历史，也可以回到某个之前的版本。

**第二个：和远程同步**

Git 还可以把本地仓库的内容，推送到另一台服务器上再保存一份，那台服务器上的仓库就叫做**远程仓库**。

理论上，你可以自己搭一台服务器来托管远程仓库。但大多数人不会这么做，因为有更省事的选择：

**GitHub** 就是这样一个平台，它专门提供远程仓库的托管服务，对个人用户基本免费，也是目前全球使用最广泛的代码托管平台。

你可以把代码推送到 GitHub 上，这样：

- 换了一台电脑，可以从 GitHub 拉下来继续工作
- 服务器需要你的代码，可以直接从 GitHub 拉取
- 团队协作时，每个人都往 GitHub 推，大家共享同一份代码

这节课我们先走完：本地完成第一次 commit（提交），再推送到 GitHub。

---

## 在开始之前：确认 git 已安装

在终端里运行：

```bash
git --version
```

如果看到类似 `git version 2.x.x` 的输出，说明已经安装好了。

如果提示 `command not found`，Mac 上通常会弹出安装提示，按照提示安装 Xcode Command Line Tools 即可。

---

## 配置你的身份（只需要做一次）

Git 在记录每次 commit 时，会把你的名字和邮箱一起存进去，方便日后查看是谁做的改动。

运行下面两行命令，把“你的名字”和邮箱换成你自己的：

```bash
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"
```

这个配置全局生效，只需要做一次，以后在这台电脑上用 Git 都会自动带上这个身份。

---

## 初始化仓库

进入我们的项目文件夹：

```bash
cd ~/zero-to-tech
```

然后运行：

```bash
git init
```

这一步的作用是：告诉 Git，从现在开始，请管理这个文件夹里的内容。

运行之后，Git 会在这个文件夹里创建一个隐藏的 `.git` 目录，用来记录所有的历史和版本信息。你不需要直接操作这个目录，Git 会自己管理它。

接下来运行：

```bash
git status
```

你会看到三个文件（`index.html`、`style.css`、`script.js`）都被标记为 `Untracked files`，意思是 Git 发现了它们，但还没有开始管理。

---

## 先处理不需要提交的文件

在把代码交给 Git 管理之前，有一件事要先做。

如果你是在用 Mac 电脑，打开访达，进入 `zero-to-tech` 文件夹看一眼。你可能会发现，里面有一个叫 `.DS_Store` 的隐藏文件。

> 如果在访达里看不到，可以按 `Command + Shift + .`，这个快捷键可以切换显示/隐藏隐藏文件。

`.DS_Store` 是 Mac 系统的访达程序自动生成的，它记录的是这个文件夹在访达里的一些显示设置，比如图标位置、排列方式之类的，和你的代码完全没有关系。

这个文件不应该被 Git 管理，更不应该推送到 GitHub 上，它只对你自己这台电脑有意义，传到别人的机器上毫无用处。

这里引出一个重要概念：

> 我们提交的是代码本身（你的“意图”），如果有一些系统自动生成的、跟代码无关的产出物，那就不需要提交。

解决方法是创建一个 `.gitignore` 文件，把需要忽略的内容写进去。

在 VS Code 里，在 `zero-to-tech` 文件夹里新建一个文件，命名为 `.gitignore`（注意开头有一个点）。

在文件里写入：

```text
.DS_Store
```

保存。从现在起，Git 就会自动忽略这个文件，不再追踪它。

---

## 第一次 commit

**第一步：把文件加入暂存区**

```bash
git add .
```

这一步的意思是：把当前文件夹里所有未被忽略的文件，都标记为“准备纳入下一次提交”。

这个状态叫做**暂存（staged）**，它是 commit 之前的一个中间环节。

可以再运行一次 `git status` 确认：

```bash
git status
```

这次你应该看到文件的颜色变了，它们被列在 `Changes to be committed` 下面，说明已经就绪。

**第二步：提交**

```bash
git commit -m "第一次提交"
```

`-m` 后面跟着的是这次 commit 的说明，写你自己能看懂的文字就行。

运行之后，Git 会输出这次提交的概要，包括文件数量和改动行数。

到这里，第一个存档点就设置好了。

---

## 在 GitHub 上创建仓库

接下来，我们要在 GitHub 上建一个对应的远程仓库，然后把本地的代码推送上去。

首先，如果还没有 GitHub 账号，去 [github.com](https://github.com) 注册一个。注册需要用到邮箱。

登录之后：

1. 点击右上角的 **+** 号，选择 **New repository**
2. Repository name 填写 `zero-to-tech`
3. 选择 **Public**（公开）或 **Private**（私有）都可以
4. **不要**勾选 “Initialize this repository with a README”（因为我们本地已经有文件了）
5. 点击 **Create repository**

> 这个意思就是，你在 GitHub 上创建了一个叫做 `zero-to-tech` 的空仓库。  
> 如果上面第 3 步选的是 Private，那么就只有你自己可以在 GitHub 上看到这个仓库。  
> 如果选的是 Public，那么任何人都可以看到这个仓库和仓库里的代码，这就是“开源”的含义。

创建完成后，GitHub 会显示一个页面，上面有几种“下一步操作”的提示。我们用 **SSH** 方式连接，找到 `SSH` 标签下的那行地址，格式类似：

```text
git@github.com:你的用户名/zero-to-tech.git
```

先把这个地址复制下来，下面要用。

---

## 设置 SSH Key（一次性）

要通过 SSH 推送代码，需要先建立本地仓库和 GitHub 仓库之间的信任关系。

**第一步：生成 SSH Key**

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
```

运行后会连续问你几个问题，全部直接按回车跳过就行。

完成后，会在 `~/.ssh/` 目录里生成两个文件：

- `id_ed25519`：私钥，不要给任何人
- `id_ed25519.pub`：公钥，接下来要上传到 GitHub

**第二步：查看并复制公钥**

```bash
cat ~/.ssh/id_ed25519.pub
```

终端会输出一整行内容，以 `ssh-ed25519` 开头，以你的邮箱结尾。把这一整行完整复制。

**第三步：把公钥添加到 GitHub**

进入 GitHub -> 右上角头像 -> **Settings** -> 左侧 **SSH and GPG keys** -> **New SSH key**

Title 随便填，Key 一栏粘贴刚才复制的公钥内容，然后点 **Add SSH key**。

**第四步：验证连接**

执行下面这行命令：

```bash
ssh -T git@github.com
```

这条命令和当前目录无关，在任何目录下执行都可以。它测试的是你的电脑和 GitHub 之间的 SSH 连接是否通畅。

如果看到类似 `Hi 你的用户名! You've successfully authenticated` 的提示，说明 SSH 已经配置好了。

---

## 把本地代码推送到 GitHub

回到终端，在 `zero-to-tech` 目录里，运行：

```bash
git remote add origin git@github.com:你的用户名/zero-to-tech.git
```

把上面的地址换成你刚才从 GitHub 复制的那个。

这一步的意思是：告诉本地 Git，有一个叫 `origin` 的远程仓库，地址就是这个。

建立了本地和远程的连接之后，下一步就是把本地代码推送（push）到远程了。

在推送之前，还有一个小细节需要确认。

不同版本的 Git 在初始化仓库时，给默认工作线起的名字可能不同。新版叫 `main`，旧版叫 `master`。运行这个命令看一眼：

```bash
git branch
```

输出结果里会出现 `main` 或者 `master`。

然后就是推送（push）：

如果上一步 `git branch` 执行的结果是 `main`，那么下一步就执行：

```bash
git push -u origin main
```

如果刚才看到的是 `master`，把命令里的 `main` 换成 `master`：

```bash
git push -u origin master
```

`-u` 的意思是，把本地和远程的这条工作线关联起来。以后再推送，直接运行 `git push` 就够了，不需要再写这么长。

---

## 在 GitHub 上验证

打开浏览器，进入你的 GitHub 仓库页面：

```text
https://github.com/你的用户名/zero-to-tech
```

你应该能看到三个文件出现在这里：`index.html`、`style.css`、`script.js`，还有 `.gitignore`。

这就是你的代码现在在 GitHub 上的样子。任何人（如果是 Public 仓库）都可以看到它，你在其他设备上也可以把它拉取下来。

---

## 以后每次改完代码怎么更新

以后你修改了代码，想保存一个新的存档点并同步到 GitHub，流程是：

```bash
git add .
git commit -m "写清楚这次改了什么"
git push
```

三行命令。这个流程你会在接下来的课程里反复用到。

---

## 另一种方式：用 GitHub Desktop 操作

命令行需要记几条命令，对有些学习者来说有一点门槛。

GitHub Desktop 是 GitHub 官方出品的图形界面工具，可以用鼠标点击完成同样的操作，不需要输入命令。

**安装和登录**

从 [desktop.github.com](https://desktop.github.com) 下载安装。

**把本地仓库添加进来**

打开 GitHub Desktop，选择 **File -> Add Local Repository**，找到 `~/zero-to-tech` 文件夹，点击添加。

GitHub Desktop 就接管了这个仓库，你之前在命令行里做的提交记录也都能看到。

**日常工作流**

以后修改了代码，打开 GitHub Desktop：

- 左侧面板列出所有发生变化的文件
- 点击某个文件，右侧显示具体改了哪些内容（删除的显示红色，新增的显示绿色）
- 在左下角填写提交说明，点击 **Commit to main**
- 点击顶部的 **Push origin** 按钮，代码推送到 GitHub

这几步和命令行是完全等价的：

| GitHub Desktop 操作 | 命令行等价 |
|---------------------|------------|
| 勾选文件 + 填说明 + Commit | `git add .` + `git commit -m "..."` |
| Push origin | `git push` |

**命令行和 GitHub Desktop，用哪个都行**

两种方式操作的是同一个仓库，可以随时切换，互不影响。

命令行更快，适合熟悉之后的日常使用；GitHub Desktop 更直观，适合刚上手，或者想清楚地看到每次改了什么内容。

---

## 这节课结束时，你至少应该做到什么

- 本地的 `zero-to-tech` 文件夹已经被 Git 管理（`git init` 完成）
- 完成了第一次 `git commit`
- GitHub 上能看到你的三个文件
- 理解 `git add`、`git commit`、`git push` 各自在做什么
- 知道 `.gitignore` 是用来做什么的，以及 `.DS_Store` 为什么不该提交
- 知道 GitHub Desktop 可以作为命令行的替代，两者操作同一个仓库

---

[← 上一节：模块 3.2 拆分成三个文件](/zero-to-fullstack/lessons/module-3-2/) | [下一节：模块 3.4 部署到服务器 →](/zero-to-fullstack/lessons/module-3-4/)
