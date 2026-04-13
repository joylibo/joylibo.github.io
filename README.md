# 李勃老师 · 个人网站

> 从零开始，建立技术直觉。

本仓库是 [joylibo.github.io](https://joylibo.github.io) 的源码，基于 [Hugo](https://gohugo.io/) 构建，使用 [Hugoplate](https://github.com/zeon-studio/hugoplate) 主题，通过 GitHub Pages 部署。

## 内容方向

每节课均提供文字版课件、代码示例，并链接 Bilibili / YouTube 视频。

| 系列 | 技术栈 | 状态 |
|---|---|---|
| 零到全栈 | React · Next.js · Python · FastAPI · Linux | 录制中 |
| 玩转 Agent | Claude Code · Cursor · AI 工作流 | 筹备中 |
| 深度学习 | 神经网络原理 · PyTorch · LLM 原理 | 筹备中 |

## 站点结构

### 导航

```
首页 | 零到全栈 | 玩转 Agent | 深度学习 | 博客 | 关于
```

### 各页面职责

**首页** — 站点门面，提供各课程系列的概要信息与入口链接。设计目标：简洁、清晰、5 秒内让访客理解这个网站是什么。

**零到全栈 / 玩转 Agent / 深度学习** — 各课程系列的主页，包含课程介绍、模块目录、每节课入口及对应视频链接。筹备中的系列显示预告信息与等待加入入口。

**博客** — 课程之外的心得、随笔，按时间倒序排列。

**关于** — 个人背景、课程理念、联系方式。

### 内容目录结构

```
content/english/
├── _index.md                        # 首页
├── zero-to-fullstack/               # 零到全栈
│   ├── _index.md                    # 系列主页（课程介绍 + 模块目录）
│   └── lessons/                     # 课件文章（每节课一篇 .md）
│       ├── 1-1-why-fullstack.md
│       ├── 1-2-course-overview.md
│       └── ...（共 23 节）
├── ai-agent/                        # 玩转 Agent
│   └── _index.md                    # 系列主页（筹备中）
├── deep-learning/                   # 深度学习
│   └── _index.md                    # 系列主页（筹备中）
├── blog/                            # 博客
└── about/                           # 关于
    └── _index.md
```

## 本地开发

**前置要求：** 已安装 [Hugo](https://gohugo.io/installation/)（extended 版本）和 Node.js

```bash
# 安装依赖
npm install

# 启动本地预览（含热更新）
hugo server

# 构建静态文件
hugo
```

本地预览地址：`http://localhost:1313`

## 项目文件结构

```
.
├── content/english/     # 所有内容（Markdown）
├── static/              # 静态资源（logo、favicon、图片等）
├── themes/hugoplate/    # 主题（不直接修改主题文件）
├── layouts/             # 自定义模板（覆盖主题默认）
├── assets/              # 自定义样式与脚本
├── config/              # 站点配置（导航、参数等）
└── hugo.toml            # 主配置文件
```

## 部署

推送到 `master` 分支后，GitHub Actions 自动构建并发布到 GitHub Pages。

## 相关链接

- Bilibili：[李勃老师](https://space.bilibili.com/427191943)
- GitHub：[joylibo](https://github.com/joylibo)
