---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: "00000000000000000000000000000000"
    PropagateID: "00000000000000000000000000000000"
    ReservedCode1: 3045022017cd4dee65049900d247acfb4fc250aca360412df4d8ef49c780c60bdfbc8694022100fe15f98499c226ea2a0fae5b0c9a792f28104dae2f88757c68ad09c880df7065
    ReservedCode2: 304502210085908d01c94e6863a88b1483ed2af7a9309eca5f5daf85a7be1616336731b91e02205c0bdd38a09b0f16f3d4375c8b413b8a7c1703e1f1eec12a8ff13a9ca4645f1a
---

# ARCANA 工程规范（供 AI 团队参考）

## 目录结构（规划）
```
src/
  components/    # 通用组件
    ui/          # 基础 UI（Button, Card, Modal...）
    layout/      # 布局组件（Nav, Header...）
  pages/         # 页面组件
    Today/
    Status/
    Habits/
    Growth/
    Arcana/
    Profile/
  stores/        # 状态管理（Zustand）
  hooks/         # 自定义 hooks
  utils/         # 工具函数
  styles/        # 全局样式 / design tokens
  assets/        # 静态资源（图片、字体）
```

## Design Tokens
```ts
colors: {
  red:   '#C3002F',
  red2:  '#FF1744',
  black: '#080808',
  card:  '#0E0E0E',
  card2: '#161616',
  white: '#EFEFEF',
  gold:  '#E8C840',
  dim:   '#3A3A3A',
  muted: '#5A5A5A',
}

fonts: {
  display: 'Bebas Neue',
  mono:    'Share Tech Mono',
  body:    'Noto Sans SC',
}
```

## 状态管理
- 推荐：Zustand（轻量、TypeScript 友好）
- Store 划分：useHabitStore / useProfileStore / useAIStore

## UI 组件规范
- 所有卡片使用 clip-path polygon 斜切
- 动效：framer-motion
- 图标：纯 SVG，不用 emoji 或图标库

## 原型参考
HTML 原型：/workspace/projects/p5-habit-app/dist/index.html
在线预览：https://bbmy7fwmnc.space.minimaxi.com

## Git Flow
1. 所有新功能从 dev 切 feat/* 分支
2. 完成后 PR 合并回 dev
3. dev 稳定后合并 main

## 协作原则
1. 分阶段完成，每阶段有明确完成标准
2. 给"选项+权衡"，Milo 做最终决策
3. 文档驱动，重要决策写进文件
4. Milo 先听建议再说自己想法
5. 效能优先，宁慢说清楚
