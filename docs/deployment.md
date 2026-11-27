# Deployment Guide

This guide is designed for beginners. You don't need complex configurations to deploy your website.

This project now deploys automatically on pushes to `main`. The recommended GitHub Actions workflow builds the source and publishes `out/`; manual uploads are unnecessary. An account homepage domain must match the GitHub username: `username` corresponds to `https://username.github.io/`.

This site uses `KJHkong/KJHkong.github.io` at <https://kjhkong.github.io/>. The local `origin` remote is the personal website repository; `upstream` preserves the original PRISM template repository.

## Option 1: GitHub Pages

1.  **Build your project**
    
    First, ensure you have the correct Node.js version installed.
    *   **Download & Install**: Go to [https://nodejs.org/en/download](https://nodejs.org/en/download) and install Node.js manually.
    *   Better not to use the system's default Node.js as it might be outdated.

    Open your terminal in the project folder and run:
    
    ```bash
    npm install
    npm run build
    ```
    This will create a folder named `out` in your project directory. This folder contains your generated website.
    
2.  **Create a GitHub Repository**
    *   Log in to GitHub.
    *   Create a new **Public** repository.
    *   Name it `username.github.io` (replace `username` with your actual GitHub username).

3.  **Upload Files**
  
    *   Upload **all the files inside the `out` folder** to your new repository.
    *   You can do this by clicking "Upload files" on the GitHub repository page and dragging everything from the `out` folder.
    *   *Alternatively, if you know Git, you can push the contents of `out` to the repository.*
    
4.  **Add .nojekyll file**
  
    *   In your GitHub repository, click "Add file" -> "Create new file".
    *   Name the file `.nojekyll` (start with a dot, all lowercase).
    *   Leave the content empty and click "Commit changes".
    *   *This is important! It tells GitHub to allow folders starting with `_` (like `_next`).*
    
5.  **Configure Pages**
    *   Go to your repository **Settings**.
    *   Click on **Pages** in the left sidebar.
    *   Under **Build and deployment**, ensure "Deploy from a branch" is selected.
    *   Select your branch (usually `main`) and click **Save**.

6.  **Done!**
    Visit `https://username.github.io` to see your website.

### (Recommended) Deploy Automatically with GitHub Actions

PRISM also supports **automatic deployment to GitHub Pages** using GitHub Actions.  
This method is recommended if you want your site to update automatically whenever you push changes.

#### How to enable

This repository includes an optional workflow located at:

```
.github/workflows/deploy.yml
```

The workflow already runs on pushes to `main` and supports manual runs. For the first deployment:

1. Go to **Settings > Pages**, and under **Build and deployment > Source**, choose **GitHub Actions**.
2. Check `git remote -v` and verify that your push target is your own repository. If `origin` still points to `xyjoey/PRISM`, preserve it as `upstream` and add your own repository as `origin`.
3. Commit and push the project source to your repository's `main` branch. Keep the license and template attribution. Generated directories and local QA files should remain ignored.
4. Go to **Actions** and select **"Deploy academic homepage to GitHub Pages"** to inspect the deployment. Use **Run workflow** for a manual run if needed.

Once enabled, GitHub Actions will:

- Install locked dependencies with Node.js 24 and `npm ci`
- Verify bilingual content, build the site, and check all six pages, the portrait, and the CV PDF
- Export static files into `out/`
- Deploy automatically to GitHub Pages

Your site will be available at `https://<username>.github.io`

#### Later updates

Edit this same checkout and preview with `npm run dev -- --hostname 127.0.0.1 --port 3000`. Localized content lives in `content_zh/` and `content/`; static assets and the CV live in `public/`.

After reviewing changes, stop the development server and run:

```powershell
node scripts/verify-content.cjs
npm run build
git status
git diff
git add -A
git commit -m "Update academic homepage"
git push origin main
```

Each push automatically builds and updates the live site. Local edits do not change the live version before they are committed and pushed. The published site does not require your computer or port forwarding to remain running.

If you are using a repository other than `username.github.io`, your site will be at `https://<username>.github.io/<repository>/`.

In this case, make sure to set the `basePath` and `assetPrefix` in `next.config.ts` accordingly to add path prefixes to your assets:

```
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,

  // Add these two lines
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

## Option 2: Cloudflare Pages

1.  **Build your project**
    Run `npm run build` to generate the `out` folder.

2.  **Create Application**
    *   Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
    *   Go to **Workers & Pages** -> **Create Application**.
    *   Select the **Pages** tab.
    *   Click **Drag and drop your files**.

3.  **Upload**
    *   Enter a **Project name** (this will be your subdomain, e.g., `my-site`).
    *   Click **Create project**.
    *   Drag and drop your `out` folder (or a zip archive of it) into the upload area.
    *   Click **Deploy**.

4.  **Done!**
    You will see your site live at `https://<project-name>.pages.dev`.
