# 部署指南

这份指南专为初学者准备。别担心，你不需要懂复杂的服务器配置，只需要跟着下面的步骤，就能轻松把你的个人主页发布上线！

本项目已配置“向 `main` 推送后自动部署”，推荐使用下文的 GitHub Actions 方式：上传项目源码，由 GitHub 构建并发布，不必手动上传 `out/`。个人主页根域名必须与 GitHub 账号名一致，例如账号 `username` 对应 `https://username.github.io/`。

当前站点使用 `KJHkong/KJHkong.github.io` 仓库，访问地址为 <https://kjhkong.github.io/>。本地 `origin` 用于自己的站点仓库，`upstream` 保留 PRISM 原模板仓库。

## 方案一：GitHub Pages

1.  **构建你的项目**

    首先，请确保你安装了正确的 Node.js 版本。
    *   **下载与安装**：请前往 [https://nodejs.org/en/download](https://nodejs.org/en/download) 手动下载并安装。
    *   最好不要使用系统自带的 Node.js 版本，以免出现兼容性问题。

    打开终端，进入项目文件夹，运行以下命令：

    ```bash
    npm install
    npm run build
    ```

    运行完成后，你会发现在项目目录下多了一个名为 `out` 的文件夹。这里面就是你网站的所有静态文件。

2.  **创建一个 GitHub 仓库**

    *   登录 GitHub。
    *   新建一个 **Public** (公开) 仓库。
    *   **关键步骤**：仓库名必须填 `你的用户名.github.io` (请将 `你的用户名` 替换为你实际的 GitHub 账号名)。

3.  **上传文件**

    *   将 `out` 文件夹里 **所有的内容** 上传到这个新仓库。
    *   你可以在 GitHub 仓库页面点击 "Upload files"，然后把 `out` 文件夹里的所有文件全选拖进去。
    *   *当然，如果你熟悉 Git 命令，也可以直接把 `out` 目录的内容 push 到仓库里。*

4.  **添加 .nojekyll 文件（重要）**

    *   在你的 GitHub 仓库页面，点击 "Add file" -> "Create new file"。
    *   文件名填写 `.nojekyll` (注意前面有个点，且全小写)。
    *   文件内容留空即可，直接点击 "Commit changes"。
    *   *这一步非常重要！它告诉 GitHub 不要忽略以下划线开头的文件夹（比如 Next.js 生成的 `_next`），否则网站样式会加载失败。*

5.  **配置 Pages**

    *   进入仓库的 **Settings** (设置)。
    *   在左侧栏找到 **Pages**。
    *   在 **Build and deployment** 下，确保来源选择的是 "Deploy from a branch"。
    *   选择你的分支（通常是 `main`），然后点击 **Save**。

6.  **大功告成！**
    访问 `https://你的用户名.github.io`，欣赏你的新网站吧！

### （推荐）使用 GitHub Actions 自动部署

PRISM 也支持使用 GitHub Actions **自动部署到 GitHub Pages**。
如果您希望每次推送更改时自动更新站点，推荐使用此方法。

#### 如何启用

本仓库包含一个可选的工作流文件，位于：

```
.github/workflows/deploy.yml
```

工作流已启用 `main` 分支的推送触发，也保留了手动发布入口。首次部署：

1. 转到 **Settings (设置) > Pages**，在 **Build and deployment (构建和部署) > Source (来源)** 下，选择 **GitHub Actions**。
2. 检查 `git remote -v`，确认推送地址属于你自己的站点仓库。若 `origin` 仍指向 `xyjoey/PRISM`，应将其保留为 `upstream`，再添加自己的 `origin`，不要把个人内容推送到模板仓库。
3. 提交并推送当前项目源码到自己的仓库 `main` 分支；保留 `LICENSE` 与模板来源说明。不要提交 `node_modules/`、`.next/`、`out/` 或 `.qa/`。
4. 转到 **Actions** 标签页，选择 **"Deploy academic homepage to GitHub Pages"**，查看发布结果。需要时可以使用 **Run workflow (运行工作流)** 手动运行。

启用后，GitHub Actions 将会：

- 使用 Node.js 24 和 `npm ci` 安装锁定版本的依赖
- 检查中英文内容，运行 `npm run build`，核对六个页面、头像和简历 PDF
- 将静态文件导出到 `out/`
- 自动部署到 GitHub Pages

您的站点将可以通过 `https://<username>.github.io` 访问。

#### 后续更新

继续在本地修改项目，使用 `npm run dev -- --hostname 127.0.0.1 --port 3000` 预览。中文内容在 `content_zh/`，英文内容在 `content/`，图片和简历在 `public/`。

确认效果后，先停止 dev 服务，再执行：

```powershell
node scripts/verify-content.cjs
npm run build
git status
git diff
git add -A
git commit -m "Update academic homepage"
git push origin main
```

每次推送后，GitHub Actions 都会自动构建并更新线上网站。本地修改在提交、推送前不会影响线上版本；线上网站也不需要本地电脑保持开机或开启端口转发。

如果您使用的仓库名称不是 `username.github.io`，您的站点将位于 `https://<username>.github.io/<repository>/`。

在这种情况下，请确保在 `next.config.ts` 中相应地设置 `basePath` 和 `assetPrefix`，以便为您的资源添加路径前缀：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,

  // 添加这两行
  basePath: "/my-repo",
  assetPrefix: "/my-repo",

  images: {
    unoptimized: true,
  },
  /* config options here */
  webpack: (config) => {
    config.module.rules.push({
      test: /\.bib$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
```

---

## 方案二：Cloudflare Pages

1.  **构建项目**
    同样地，先运行 `npm run build`，生成 `out` 文件夹。

2.  **创建应用**
    *   登录 [Cloudflare 控制台 (Dashboard)](https://dash.cloudflare.com/)。
    *   点击左侧的 **Workers & Pages** -> **Create Application**。
    *   选择 **Pages** 标签页。
    *   点击 **Drag and drop your files**。

3.  **上传与发布**
    *   输入 **Project name** (项目名称)，这将成为你域名的前缀（例如：`my-site`）。
    *   点击 **Create project**。
    *   将你的 `out` 文件夹（或者它的压缩包）直接拖入上传区域。
    *   点击 **Deploy**。

4.  **完成！**
    你的网站已经在 `https://<你的项目名>.pages.dev` 上线啦！
