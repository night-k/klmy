# 销售管理 Mock 演示

石油服务销售主线业务流程的前端 Mock 演示工程，数据保存在浏览器 `localStorage`（键名 `poms-phase1-demo`），**无需后端、无需登录**。

## 站点结构（Git Pages 部署）

| 路径 | 说明 |
|------|------|
| `/` | **主线流程总览**（`flow/index.html`，部署后为站点首页） |
| `/demo/index.html#/poms/phase1/index` | 销售 Mock 演示首页 |
| `/demo/index.html#/poms/phase1/*` | 各业务模块 |

首页右上角 **「进入销售 Mock 演示」** 可跳转到 Mock 系统。

## 功能模块

| 模块 | 路径 |
|------|------|
| 演示首页 | `#/poms/phase1/index` |
| 客户管理 | `#/poms/phase1/customer` |
| 商机管理 | `#/poms/phase1/opportunity` |
| 招投标管理 | `#/poms/phase1/tender` |
| 中标管理 | `#/poms/phase1/winbid` |
| 合同管理 | `#/poms/phase1/contract` |
| 回款管理 | `#/poms/phase1/payment` |

## 本地预览

### 完整站点（流程总览 + Mock，与上线一致）

```bash
npm install
npm run preview:pages
```

或分两步（改完 `flow/` 后不必每次重新构建 Mock）：

```bash
npm run build:pages    # 首次或改了 src/ 后执行
npm run serve:pages     # 仅启动静态服务
```

| 地址 | 内容 |
|------|------|
| http://localhost:2890/ | **主线流程总览**（首页） |
| http://localhost:2890/demo/index.html#/poms/phase1/index | Mock 演示 |

首页点 **「进入销售 Mock 演示」** 进入 Mock。

> 若打开 2890 直接是 Mock 侧栏页面，说明 `dist/index.html` 被旧构建覆盖了，请重新执行 `npm run build:pages`。

### 仅 Mock 开发（无流程总览）

```bash
npm run dev
```

访问：http://localhost:2889/#/poms/phase1/index

## 生产构建

**仅 Mock：**

```bash
npm run build
```

产物在 `dist/demo/`（不会生成流程总览首页）。

**Git Pages 完整站点（推荐上传此产物）：**

```bash
npm run build:pages
```

产物结构：

```
dist/
├── index.html          # 主线流程总览（站点首页）
├── favicon.png
└── demo/               # Mock 演示 SPA
    ├── index.html
    └── assets/
```

## 部署到 GitHub Pages

1. 执行 `npm run build:pages`
2. 将 **`dist/` 目录内的全部文件** 推送到 Pages 分支（或仓库根目录，视托管方式而定）
3. 访问 `https://<用户名>.github.io/<仓库名>/` 即为流程总览首页

Mock 链接使用相对路径 `./demo/index.html#/poms/phase1/index`。

## 部署到 Gitee Pages

步骤同上：构建 `build:pages` 后上传 `dist/` 内容，在 Gitee Pages 中启用。

## 演示数据

- 首次访问自动加载种子数据
- 演示首页点击 **「重置演示数据」** 恢复初始状态
- 也可在浏览器控制台执行：`localStorage.removeItem('poms-phase1-demo')` 后刷新

## 目录说明

```
flow/index.html         主线流程总览（Pages 首页源文件）
scripts/build-pages.mjs Pages 打包脚本
src/
├── api/poms/phase1/    Mock 数据与 CRUD API
├── views/poms/phase1/  业务页面
└── layout/DemoLayout.vue
```

## 推送到外网 Git

**方式 A：推送源码 + CI 构建**（仓库含 `src/`，Pages 只发布 `dist/`）

**方式 B：只推送 Pages 产物**（适合纯静态托管）

```bash
npm run build:pages
cd dist
git init
git add .
git commit -m "deploy: 主线流程总览 + Mock 演示"
git remote add origin <你的 Pages 仓库 URL>
git push -u origin main --force
```

推送前请确认**没有** `.env`、`.npmrc` 等敏感文件。
