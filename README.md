---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: 00000000000000000000000000000000
    PropagateID: 00000000000000000000000000000000
---

# ARCANA · 奥义

> 命运由你书写 · YOUR ARCANA

以《女神异闻录5》为灵感的现实养成 / 习惯追踪 App。

**把你的人生变成一场游戏。**

---

## 项目概况

| 项目 | 说明 |
|------|------|
| 产品名 | ARCANA（奥义 / 命运牌）|
| 定位 | 习惯养成 + AI 加持 + P5 美学 |
| 平台 | Web App（移动端优先）|
| 市场 | 国内优先 |
| 商业 | MVP 免费，后期会员制 |

## 技术栈

- **前端**：React 18 + Vite + TypeScript + Tailwind CSS
- **后端**：Express.js + TypeScript（Railway 部署）
- **数据库**：Supabase（PostgreSQL）
- **AI**：大模型 API（自然语言 → EXP 分配）

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build
```

## 环境变量

复制 `.env.local` 为 `.env.local` 并配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

## 部署

前端部署：Vercel / Netlify / Cloudflare Pages
后端部署：Railway

## 设计风格

P5（女神异闻录5）红黑风：
- 高对比度 `#C3002F` 红 / `#080808` 黑 / `#E8C840` 金
- 斜切卡片（clip-path polygon）
- Bebas Neue + Share Tech Mono + Noto Sans SC
- 半色调网点 + 透视格栅背景

## 核心模块（MVP）

1. **属性面板** — 自定义 3-6 个人生维度，经验值 + 等级系统
2. **习惯管理** — 时间槽（早/午/晚）+ 习惯链 + 打卡
3. **成长可视化** — 热力图 + 雷达图 + 里程碑
4. **AI 系统** — 自然语言记录 + 莫纳顾问 + 摆烂预警

## 分支规范

```
main     ← 稳定版本（只接受 PR 合并）
dev      ← 日常开发集成分支
feat/*   ← 功能分支（从 dev 切出，完成后 PR 回 dev）
fix/*    ← Bug 修复
```

## Commit 规范

```
feat: 新功能
fix:  修复
docs: 文档
chore: 构建/配置
style: 样式
refactor: 重构
```

## 团队

| 角色 | 负责 |
|------|------|
| Milo | 产品决策、需求确认 |
| Sylphy | 产品设计、UI 方向、原型 |
| Roxy | 工程架构、代码实现、技术决策 |
| Eris | 品牌策略、内容（后期）|

---

*ARCANA — 让每一天都成为你命运牌上的一笔。*
