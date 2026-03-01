---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 304402203029627efd8bf898c19ec8b92bafebf5cd9d6719dccd9b9a7c06e7f58b6483eb02201f9ddf1abe882c77d356822dc0994e9c0117b5503336e07e7050bed7fae59790
    ReservedCode2: 3045022100cd34f7dac03a24372477e4b485077db60344c0d43c42e2cba3d16b145faf3c360220424064855bdfd89ce4261a73fc2275e4cb7e4484cd44ebbd301347c769cd83a3
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
- **AI**：大模型 API（自然语言 → EXP 分配）
- **后端**：待定
- **数据库**：待定

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

## UI 原型参考

原型地址：https://bbmy7fwmnc.space.minimaxi.com

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
