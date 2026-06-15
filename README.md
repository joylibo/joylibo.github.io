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

### 自托管服务器（Ubuntu / Nginx）

如果部署到自己的 Ubuntu 服务器，建议在服务器上完成静态构建，然后让 Nginx 托管构建产物。生产环境请使用和 CI 一致的 Hugo extended 版本（当前为 `0.160.0`）。

```bash
cd ~/joylibo.github.io
npm ci
node scripts/themeGenerator.js
hugo --gc --minify
```

`npm ci` 会严格按照 `package-lock.json` 安装依赖，更适合服务器和 CI 环境；本地开发时继续使用 `npm install` 也可以。

构建完成后，静态文件会输出到 `public/` 目录。Nginx 的 `root` 应指向这个目录，`server_name` 应填写实际要访问的网站域名。

如果使用中文域名，Nginx 配置中建议使用 Punycode，而不是直接写中文域名。例如 `李勃老师.com` 对应的 Punycode 是 `xn--ygr25xpohxwz.com`：

```nginx
server {
    listen 80;
    server_name xn--ygr25xpohxwz.com;

    root /home/ubuntu/joylibo.github.io/public;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

修改 Nginx 配置后，检查并重载：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

`hugo server` 只适合本地开发或临时预览，不建议作为正式线上服务。

## 相关链接

- Bilibili：[李勃老师](https://space.bilibili.com/427191943)
- GitHub：[joylibo](https://github.com/joylibo)
