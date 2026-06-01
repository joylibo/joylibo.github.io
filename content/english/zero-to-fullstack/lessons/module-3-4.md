---
title: "模块 3.4：GitHub 与远程同步"
meta_title: ""
description: "把本地仓库连接到 GitHub：SSH、remote、push、后续日常同步。"
date: 2026-05-31T00:00:00+08:00
image: "/images/module-3-4.webp"
categories: ["零到全栈"]
tags: ["GitHub", "远程仓库", "SSH", "push", "pull"]
weight: 11
draft: false
---

> 本地存档解决“可回退”，远程同步解决“可备份、可协作、可部署”。

---

## 为什么要有远程仓库

上一节我们已经把本地 Git 跑通了。  
但如果代码只在本机，还会面临几个现实问题：

- 电脑损坏或更换时，代码迁移成本高
- 多人协作时，没有统一同步点
- 部署时无法稳定拉取同一份代码

远程仓库就是给本地仓库再加一份“网络上的可信副本”。

最常见的平台就是 GitHub。

---

## 本节目标

这一节做完，你应该能完成完整链路：

1. 在 GitHub 创建空仓库
2. 配置 SSH 信任
3. 把本地仓库和远程仓库关联
4. 完成第一次 `push`
5. 理解以后如何持续同步

---

## 第 1 步：在 GitHub 创建空仓库

登录 GitHub 后新建仓库，建议：

1. 仓库名：`zero-to-tech`
2. Public / Private：都可以（按你的需求）
3. 不勾选 `Initialize this repository with a README`

为什么不勾选 README：

- 你本地已有项目文件
- 远程保持“空仓库”最利于第一次上手同步

创建完成后，复制 SSH 地址（类似）：

```text
git@github.com:你的用户名/zero-to-tech.git
```

---

## 第 2 步：配置 SSH（每台电脑一次）

### 生成密钥对

```bash
ssh-keygen -t ed25519 -C "你的邮箱"
```

连续提示可直接回车使用默认值。生成后一般会有：

- `~/.ssh/id_ed25519`（私钥，不要外传）
- `~/.ssh/id_ed25519.pub`（公钥，可提交给平台）

### 复制公钥

```bash
cat ~/.ssh/id_ed25519.pub
```

复制整行内容。

### 添加到 GitHub

GitHub -> Settings -> SSH and GPG keys -> New SSH key  
把公钥粘贴进去保存。

### 验证连通性

```bash
ssh -T git@github.com
```

如果看到认证成功提示，就说明 SSH 可用。

> 如果 SSH 一时配置不通，不要卡死流程，可以临时改用 HTTPS，先把同步链路跑通。

---

## 第 3 步：关联本地与远程仓库

回到项目目录：

```bash
cd ~/zero-to-tech
```

添加远程地址：

```bash
git remote add origin git@github.com:你的用户名/zero-to-tech.git
```

这里 `origin` 是远程仓库的常见命名。

你可以验证一下：

```bash
git remote -v
```

---

## 第 4 步：第一次 push

先确认当前分支名：

```bash
git branch
```

如果是 `main`：

```bash
git push -u origin main
```

如果是 `master`：

```bash
git push -u origin master
```

`-u` 的作用是建立本地分支和远程分支的跟踪关系。  
之后再推送通常只需要 `git push`。

---

## 第 5 步：在 GitHub 页面验证

打开你的仓库页面，确认能看到：

- `index.html`
- `style.css`
- `script.js`
- `.gitignore`

如果都看到了，说明本地到远程同步链路已经成功。

---

## 以后每次更新代码的标准流程

```bash
git add .
git commit -m "写清楚这次改了什么"
git push
```

这三步就是你的日常节奏。

---

## 命令行之外：GitHub Desktop 也是可选项

如果你暂时不想记太多命令，可以用 GitHub Desktop（官方图形工具）：

- 可视化查看改动
- 图形化提交（Commit）
- 一键推送（Push）

它和命令行操作的是同一仓库，可以随时切换使用。

---

## 本节小结

你已经从“本地存档”走到了“远程同步”：

- 本地 Git 负责版本历史
- GitHub 负责远程托管与同步
- `push` 把本地提交送到远程
- `pull` 把远程更新拉回本地

下一步我们就能基于这套同步链路，把代码发布到线上环境。

---

[← 上一节：模块 3.3 Git 入门：给代码设置存档点](/zero-to-fullstack/lessons/module-3-3/) | [下一节：进入下一模块 →](/zero-to-fullstack/)
