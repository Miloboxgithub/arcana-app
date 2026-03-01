import Card from '@/components/ui/Card'

const ArcanaPage = () => {
  return (
    <div className="page-container space-y-4">
      <div className="mb-6">
        <p className="text-arcana-muted text-xs font-mono tracking-widest">ARCANA</p>
        <h1 className="font-display text-3xl text-arcana-white tracking-wider">命运 · 奥义</h1>
      </div>

      {/* MORGANA AI */}
      <Card variant="red" className="relative overflow-hidden">
        <div className="absolute top-0 right-0 halftone w-24 h-24 opacity-20" />
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-arcana-red card-skew-tr flex-shrink-0 flex items-center justify-center">
            <span className="font-display text-arcana-white text-sm">M</span>
          </div>
          <div>
            <p className="font-display text-arcana-gold tracking-widest text-sm mb-1">MORGANA</p>
            <p className="text-arcana-white text-sm leading-relaxed">
              "你好，PHANTOM THIEF。我是你的 AI 顾问 MORGANA。<br/>
              开始你的第一个习惯，你的 ARCANA 就会显现。"
            </p>
          </div>
        </div>
      </Card>

      {/* AI Input */}
      <Card className="border-arcana-red/50">
        <p className="text-arcana-muted text-xs font-mono tracking-widest mb-3">AI 自然语言记录</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="说说今天做了什么..."
            className="flex-1 bg-arcana-black border border-arcana-dim px-3 py-2 text-arcana-white text-sm font-mono placeholder-arcana-muted focus:outline-none focus:border-arcana-red"
          />
          <button className="bg-arcana-red px-4 text-arcana-white card-skew-tr text-xs font-display tracking-wider hover:bg-arcana-red2 transition-colors">
            发送
          </button>
        </div>
      </Card>

      {/* Weekly Report */}
      <Card>
        <p className="text-arcana-muted text-xs font-mono tracking-widest mb-2">WEEKLY REPORT</p>
        <p className="text-arcana-muted text-sm text-center py-4">坚持一周后，MORGANA 会生成你的第一份报告</p>
      </Card>
    </div>
  )
}

export default ArcanaPage
