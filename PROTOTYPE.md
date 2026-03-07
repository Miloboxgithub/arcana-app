---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3046022100ebc5e479e080f51c6dc3a42c84fc1bebe7bab651718df65bd7fde916fae9e248022100cd3e23f45caee7c5322e662ce6a3e3c1c9bae59005f69ed7e31d6c1d05a1e331
    ReservedCode2: 3045022100cee2896a9a9cbdecd9bf834934070fbc923326cea46adf31316ea0b6f85da98802201a56f8fe25b440d2308e3ca335769a1e710d5a0bd8f80588c3a773d747b1dc25
---

# ARCANA 原型资产参考

## UI 原型
- 在线预览：https://bbmy7fwmnc.space.minimaxi.com
- 源文件：/workspace/projects/p5-habit-app/dist/index.html

## 莫纳头像
- 路径：/workspace/projects/p5-habit-app/dist/morgana-avatar.png

## 已实现页面
- [x] 今日（TODAY）— 时间槽 + 习惯链 + AI 输入 + 打卡动效
- [x] 属性（STATUS）— 雷达图 + 角色卡 + 维度详情
- [x] 习惯（HABITS）— 习惯列表 + 新建弹窗
- [x] 成长（GROWTH）— 热力图 + 成长曲线 + 里程碑
- [x] 奥义（ARCANA）— 莫纳对话 + 本周报告
- [x] 档案（PROFILE）— 角色卡 + 成就 + 设置

## 交互已实现
- 打卡 → 星星粒子爆炸 + EXP toast + 莫纳对话框
- 时间槽切换（早/午/晚）
- AI 输入 → 随机 EXP + 莫纳反馈
- 莫纳 FAB 浮动按钮（任意页面可唤起对话）
- SPA 路由（无刷新切页）

## 设计 Token（见 ENGINEERING.md）
