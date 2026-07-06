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

## Phase 2：规则引擎 + 后端 API ✅ 已完成

| 步骤 | 内容 | 状态 |
|------|------|------|
| **2.1** | 后端项目脚手架 + 产品 CRUD API | ✅ 已完成 (07-02) |
| **2.2** | 生命周期阶段模板 API | ✅ 已完成 (07-02) |
| **2.3** | 前端对接后端 API | ✅ 已完成 (07-02) |
| **2.4** | 触发规则配置页面 | ✅ 已完成 (07-02) |
| **2.5** | 新产品时间线模拟 | ✅ 已完成 (07-03) |

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

### 步骤 2.3 待办

- [x] 创建 `src/api/client.ts` — fetch 封装 + 全部产品/阶段 API 函数
- [x] 重构 `src/stores/productStore.ts` — 移除 mockData 直接导入，改为异步 API 初始化
- [x] 添加 `loading` / `error` 状态 + `fetchInitialData` 动作
- [x] 所有 CRUD 方法改为 async，先调 API 再更新本地 state
- [x] Vite 配置代理 `/api` → `localhost:3001`
- [x] 更新 `App.tsx` — `useEffect` 加载数据 + 加载中/错误态 UI
- [x] 更新 `src/types/index.ts` — `LifecycleStage` 添加 `order: number`
- [x] 更新 `mockData.ts` — 所有生命周期阶段添加 `order` 字段
- [x] 新增 `src/__tests__/helpers.ts` — `seedStore()` 测试辅助
- [x] 重写全部 6 个测试文件 — 适配异步 Store + API mock
- [x] 25 个测试全部通过 + TypeScript 检查通过 + Vite build 成功

### 步骤 2.4 待办

- [x] 后端：添加 `TriggerRule` / `RuleCondition` 类型到 `server/src/types.ts`
- [x] 后端：6 条种子规则（涵盖市场/商业/法规/技术/供应链/临床六大分类）
- [x] 后端：创建 `server/src/routes/rules.ts` — 完整 CRUD API
- [x] 后端：在 `index.ts` 注册 `/api/rules` 路由
- [x] 前端：添加 `TriggerRule` / `RuleCondition` 类型到 `src/types/index.ts`
- [x] 前端：`src/api/client.ts` 添加 rules CRUD 方法
- [x] 前端：新建 `RuleConfigPanel` 组件 — 规则列表 + 开关 + 编辑/删除/新建对话框
- [x] 前端：`App.tsx` 添加顶部 Tab 导航（路线图 / 触发规则）
- [x] 新建 `RuleConfigPanel.test.tsx` — 7 个测试
- [x] 32 个测试全部通过 + TypeScript 检查通过 + Vite build 成功

### 步骤 2.5 待办

- [x] 后端：`server/src/services/timelineSimulator.ts` — 时间线模拟核心算法
- [x] 后端：`server/src/routes/simulate.ts` — POST /api/simulate 接口
- [x] 后端：在 `index.ts` 注册路由 + 验证通过（生成 8 阶段时间线）
- [x] 前端：`src/types/index.ts` 添加 `SimulationRequest` / `SimulationResult` 类型
- [x] 前端：`src/api/client.ts` 添加 `simulateTimeline` 方法
- [x] 前端：`TimelineSimulatorPanel` 组件 — 参数配置 + 甘特图预览 + 年份微调 + 保存为产品
- [x] 前端：`App.tsx` 添加"时间线模拟"Tab
- [x] 32 个测试全部通过 + TypeScript 检查通过 + Vite build 成功

---

## Phase 2 ✅ 全部完成

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

---

## Phase 3：定时触发检查 + 模板通知 ✅ 已完成

| 步骤 | 内容 | 状态 |
|------|------|------|
| **3.1** | 规则引擎服务（规则遍历 + 产品检查） | ✅ 已完成 (07-03) |
| **3.2** | /api/check POST 接口（运行规则检查，返回匹配结果和模板通知） | ✅ 已完成 (07-03) |
| **3.3** | 通知中心前端组件（铃铛入口 + 抽屉面板 + 通知列表） | ✅ 已完成 (07-03) |
| **3.4** | 通知模板生成器（标题 + 消息 + 建议 三段式） | ✅ 已完成 (07-03) |
| **3.5** | 条件编辑器 ConditionEditor（可视化规则条件编辑，代替 JSON） | ✅ 已完成 (07-04) |

### 步骤 3.1 待办

- [x] 创建 `server/src/services/ruleEngine.ts` — 遍历所有启用规则，检查所有产品
- [x] 支持多种条件类型（stage_match / time_since / metric_threshold / and / or）
- [x] 返回匹配结果结构体（产品ID、规则ID、匹配详情）

### 步骤 3.2 待办

- [x] 创建 `server/src/routes/check.ts` — POST /api/check 接口
- [x] 在 `index.ts` 注册 `/api/check` 路由
- [x] 返回匹配结果 + 模板通知（标题、消息、建议三段式）

### 步骤 3.3 待办

- [x] 新建 `NotificationCenter.tsx` — 右上角铃铛入口
- [x] 抽屉式面板，从右侧滑入
- [x] 未读/已读状态切换
- [x] 通知数量徽标（badge）

### 步骤 3.4 待办

- [x] 通知模板生成器 — 每条命中规则生成标题、消息、建议
- [x] 模板变量替换（产品名、阶段名、剩余时间等）

### 步骤 3.5 待办

- [x] 新建 `ConditionEditor.tsx` — 可视化规则条件编辑
- [x] 支持 AND/OR 组合条件
- [x] 替代原始 JSON 编辑方式

---

## Phase 4：AI 智能化 ✅ 已完成

| 步骤 | 内容 | 状态 |
|------|------|------|
| **4.1** | DeepSeek API 封装（aiService） | ✅ 已完成 (07-04) |
| **4.2** | /api/ai 路由（chat / analyze-notification / analyze-product / explain-timeline） | ✅ 已完成 (07-04) |
| **4.3** | 对话式 AI 助手 AiChatPanel（右下角悬浮按钮 + 弹窗式对话界面） | ✅ 已完成 (07-04) |
| **4.4** | AI 通知深度分析（通知详情页可触发 AI 分析） | ✅ 已完成 (07-04) |
| **4.5** | /api/report/weekly — AI 生成健康检查周报 | ✅ 已完成 (07-05) |
| **4.6** | 周报组件 WeeklyReport（复制 + 导出 PDF + 导出 Word） | ✅ 已完成 (07-05) |
| **4.7** | AI 数据看板 DashboardBar（顶部统计卡片） | ✅ 已完成 (07-05) |

### 步骤 4.1 待办

- [x] 创建 `server/src/services/aiService.ts` — DeepSeek API 封装
- [x] 核心方法：chat、analyzeNotification、analyzeProduct、explainTimeline、generateWeeklyReport
- [x] API 调用降级处理（模板兜底）

### 步骤 4.2 待办

- [x] 创建 `server/src/routes/ai.ts` — AI 相关路由
- [x] POST /api/ai/chat — 对话接口
- [x] POST /api/ai/analyze-notification — 通知深度分析
- [x] POST /api/ai/analyze-product — 产品分析
- [x] POST /api/ai/explain-timeline — 时间线解释
- [x] 在 `index.ts` 注册 `/api/ai` 路由

### 步骤 4.3 待办

- [x] 新建 `AiChatPanel.tsx` — AI 对话助手组件
- [x] 右下角悬浮按钮入口
- [x] 弹窗式对话界面，支持多轮对话
- [x] AI 助手从 Tab 移到右下角悬浮按钮（UI/UX 改进）

### 步骤 4.4 待办

- [x] 通知详情页集成 AI 分析入口
- [x] 点击触发后调用 analyze-notification 接口
- [x] 展示 AI 生成的深度分析结果

### 步骤 4.5 待办

- [x] 创建 `server/src/routes/report.ts` — 周报路由
- [x] POST /api/report/weekly — AI 生成健康检查周报
- [x] 周报内容：问题影响分析 + 行动建议
- [x] 在 `index.ts` 注册 `/api/report` 路由

### 步骤 4.6 待办

- [x] 新建 `WeeklyReport.tsx` — 周报展示组件
- [x] 支持复制到剪贴板
- [x] 支持导出 PDF
- [x] 支持导出 Word

### 步骤 4.7 待办

- [x] 新建 `DashboardBar.tsx` — 顶部数据看板
- [x] 统计卡片：在研产品数、即将到期注册数、本季度里程碑等
- [x] 仅在路线图页面显示

---

## Phase 5：增强功能 ✅ 已完成

| 步骤 | 内容 | 状态 |
|------|------|------|
| **5.1** | F5 生命周期模板管理（StageTemplatePanel + 完整 CRUD API） | ✅ 已完成 (07-05) |
| **5.2** | F7 多维度筛选（阶段 + 时间范围 + 产品线组合筛选） | ✅ 已完成 (07-05) |
| **5.3** | F8 路线图导出（复制到剪贴板 + 下载 PNG + 导出 PDF） | ✅ 已完成 (07-06) |
| **5.4** | F11 AI 时间线智能解释（每阶段 AI 解释 + 偏差对比） | ✅ 已完成 (07-06) |

### 步骤 5.1 待办

- [x] 新建 `StageTemplatePanel.tsx` — 生命周期模板管理界面
- [x] 后端完整 CRUD API（GET/POST/PUT/DELETE）
- [x] 模板编辑：阶段名称、颜色、排序、子阶段管理

### 步骤 5.2 待办

- [x] 路线图新增多维筛选面板
- [x] 按阶段筛选（选择特定生命周期阶段）
- [x] 按时间范围筛选（起始年 ~ 结束年）
- [x] 按产品线筛选（多选）
- [x] 组合筛选条件联动

### 步骤 5.3 待办

- [x] 路线图导出功能按钮
- [x] 复制到剪贴板（HTML 格式）
- [x] 下载为 PNG 图片
- [x] 导出为 PDF 文档

### 步骤 5.4 待办

- [x] 时间线模拟结果集成 AI 解释
- [x] 每阶段自动生成 AI 解释文字
- [x] 对比参考产品标注偏差

---

## 全功能开发完成 ✅

| 类别 | 项目 | 说明 |
|------|------|------|
| **UI/UX** | 条件编辑器 | ConditionEditor.tsx — 可视化规则条件编辑（代替 JSON） |
| **UI/UX** | 通知中心重构 | 从 Tab 移到右上角铃铛图标 |
| **UI/UX** | AI 助手重构 | 从 Tab 移到右下角悬浮按钮 |
| **UI/UX** | 前端端口调整 | 开发端口从 5173 改为 5174 |
| **测试** | 42 个测试全部通过 | 覆盖 7 个测试文件，包含单元测试 + 组件测试 |

---
