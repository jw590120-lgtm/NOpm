# 开发日志 · 产品生命周期管理工具

> **作用：** 记录每次小步迭代的进度、决策和问题。每次 git commit 后同步更新。
> **工程规范引用：** `deepseek.md`

---

## Phase 0：项目初始化 + 预览页面 ✅ 已完成

| 步骤 | 内容 | 状态 | 日期 |
|------|------|------|------|
| 0.1 | Vite + React + TypeScript 脚手架 | ✅ | 06-30 |
| 0.2 | Tailwind CSS 配置 | ✅ | 06-30 |
| 0.3 | Mock 数据 + 类型定义 | ✅ | 06-30 |
| 0.4 | 路线图甘特图 + 阶段详情抽屉 | ✅ | 06-30 |
| 0.5 | AI 功能占位痕迹（顶栏按钮、抽屉提示、悬浮按钮） | ✅ | 06-30 |

---

## Phase 1：MVP — 路线图交互化 + 产品 CRUD

**目标：** 将静态预览页升级为可交互的 MVP。

### 步骤规划

| 步骤 | 内容 | 预估 | 测试重点 |
|------|------|------|---------|
| **1.1** | Git 初始化 + Vitest 测试框架配置 | ✅ 已完成 (07-01) | ✅ 3 tests |
| **1.2** | 状态管理引入（Zustand）+ 数据层抽离 | ✅ 已完成 (07-01) | ✅ 8 tests |
| **1.3** | 路线图交互化 — 产品线筛选 + 滚动优化 | ✅ 已完成 (07-01) | ✅ 14 tests |
| **1.4** | 产品新增表单（创建产品 + 自动套用模板生成时间线） | ✅ 已完成 (07-01) | ✅ 21 tests |
| **1.5** | 产品编辑/删除 + 阶段增删改 | ✅ 已完成 (07-01) | 1天 | CRUD 全链路正确 |
| **1.6** | 整体交互打磨 + 集成测试 | ✅ 已完成 (07-01) | 28 tests |
| **2.0** | 规则引擎 + 后端 API | 待开始 | — |

---

### 步骤 1.1 待办

- [x] Git 初始化 `plm-preview`
- [x] 仓库推送到 GitHub `jw590120-lgtm/NOpm`
- [x] 安装 Vitest + React Testing Library
- [x] 编写第一个简单测试（App 渲染 + 产品名称验证）
- [x] 3 个测试全部通过

---

### 步骤 1.2 待办

- [x] 安装 Zustand
- [x] 创建 product store（产品数据 + CRUD actions）
- [x] 为 store 编写 8 个单元测试
- [x] 重构 App / RoadmapGantt 从 store 读取数据
- [x] 11 个测试全部通过（3 App + 8 store）

---

### 步骤 1.3 待办

- [x] 产品线筛选功能（左侧点击切换产品线，路线图只显示选中产品线）
- [x] 时间轴水平滚动优化（useRef + smooth scrollToToday）
- [x] 编写 3 个交互测试（筛选触发 / 切换回全部 / 筛选后只有匹配产品）
- [x] 移除 App 层直接传 props，Gantt 内部自主读 store
- [x] 14 个测试全部通过

---

### 步骤 1.4 待办

- [x] 产品新增表单（Modal/Drawer）
- [x] 表单字段：名称、产品线、类型、起始年份
- [x] 创建后自动套用模板生成完整 8 阶段时间线
- [x] 支持自定义新产品线
- [x] 表单校验（空名称、无效年份）
- [x] 实时时间线预览
- [x] 7 个测试全部通过

---

### 步骤 1.5 待办

- [x] 产品编辑功能（点击产品行 → 编辑表单）
- [x] 产品删除功能（确认弹窗 → 删除）
- [x] 阶段增删改（在详情抽屉中编辑年份/状态、删除、新增阶段）
- [x] 编辑/删除测试（5 个新测试）

**新增文件：**
- `src/components/EditProductDialog.tsx` — 编辑产品对话框（复用新增表单结构，预填现有数据）
- `src/__tests__/editDelete.test.tsx` — 编辑/删除交互测试

**修改文件：**
- `src/components/RoadmapGantt.tsx` — 产品行 hover 显示编辑/删除图标，集成 EditProductDialog 和删除确认弹窗
- `src/components/StageDetailDrawer.tsx` — 阶段头新增编辑/删除按钮，编辑模式支持修改年份和状态，新增阶段按钮

**测试结果：7 新增测试，共 27 个测试全部通过**

### 步骤 1.6 待办

- [x] 空状态提示（产品列表为空时显示引导文案 + 新建入口）
- [x] 对话框入场动画（fadeIn 背景 + scaleIn 弹窗）
- [x] Toast 轻提示（创建/编辑/删除操作反馈）
- [x] 顶栏产品数量统计 + 当前筛选状态
- [x] 页脚版本号更新为 "MVP · Phase 1"
- [x] 全流程集成测试（创建 → 编辑 → 删除）

**Phase 1 MVP 完成**

---

## Phase 2：规则引擎 + 后端 API（进行中）

| 步骤 | 内容 | 状态 |
|------|------|------|
| **2.1** | 后端项目脚手架 + 产品 CRUD API | ✅ 已完成 (07-02) |
| **2.2** | 生命周期阶段模板 API | ✅ 已完成 (07-02) |
| **2.3** | 前端对接后端 API | 待开始 |
| **2.4** | 触发规则配置页面 | 待开始 |
| **2.5** | 新产品时间线模拟 | 待开始 |

### 步骤 2.1 待办

- [x] Express + TypeScript 后端项目脚手架 (`server/`)
- [x] CORS 配置 + 健康检查接口
- [x] JSON 文件存储层（`storage.ts`）— 读写 + seed 机制
- [x] 产品 CRUD REST API — GET/POST/PUT/DELETE + 阶段 PATCH
- [x] 种子数据沿用前端 mockData 结构
- [x] 验证通过（健康检查返回 ok，产品列表返回 3 条）

### 步骤 2.2 待办

- [x] 新建 `server/src/routes/stages.ts` — GET 列表 + GET 按 ID + PUT 修改名称/颜色
- [x] 在 `index.ts` 注册 `/api/stages` 路由
- [x] 验证通过（GET 返回 8 个阶段，各含 subStages）

---

## 决策记录

| 日期 | 决策 | 原因 |
|------|------|------|
| 07-02 | 后端使用 Express + tsx | Express 生态成熟，tsx 支持直接运行 TypeScript，不需要编译步骤 |
| 07-02 | 数据存储采用 JSON 文件 | Phase 2 阶段为内网单机使用，JSON 文件零配置、可读性好，后续可平滑迁移到 SQLite/PostgreSQL |
| 07-02 | 后端独立 server/ 目录 | 前后端分离架构，server 有独立的 package.json 和 tsconfig，互不干扰 |
| 07-02 | 移动端适配暂缓 | 甘特图天生不适合小屏，内部工具以 PC 为主。记入 deepseek.md 上线前优化清单 |
| 07-01 | 开发日志与工程规范分离 | deepseek.md 保持稳定，日志高频更新 |
| 07-01 | 状态管理选用 Zustand | 轻量、无需 Provider、TypeScript 友好 |
| 07-01 | 测试框架选用 Vitest | 与 Vite 原生集成，API 兼容 Jest |
| 07-01 | Git 使用 GitHub Token 推送 | Token 已存入 git 凭证管理器 |
| 07-01 | Store 独立于 data/mockData | mockData 仅作为初始值注入 store，App 层不直接引用 |
| 07-01 | 测试用 getInitialState 重置 store | beforeEach 中调用确保测试隔离 |
| 07-01 | Gantt 组件自管理数据 | 不再从 App 传 props，直接从 store 读取 |

---

*当前步骤：2.2 ✅ 完成 → 准备 2.3（前端对接后端 API）*
