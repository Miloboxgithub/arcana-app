import Card from '@/components/ui/Card'

const Today = () => {
  const today = new Date().toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long'
  })

  return (
    <div className="page-container space-y-4">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="text-arcana-muted text-xs font-mono tracking-widest">TODAY</p>
          <h1 className="font-display text-3xl text-arcana-white tracking-wider">{today}</h1>
        </div>
        <div className="text-right">
          <p className="text-arcana-gold font-mono text-xs">DAY 1</p>
          <p className="text-arcana-muted text-xs">连续打卡</p>
        </div>
      </div>

      {/* Time Slots */}
      {['早晨', '下午', '夜晚'].map((slot, i) => (
        <Card key={slot} variant={i === 0 ? 'red' : 'default'} className="mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-display text-lg tracking-widest text-arcana-white">{slot}</span>
            {i === 0 && (
              <span className="text-xs text-arcana-red font-mono border border-arcana-red px-2 py-0.5">
                CURRENT
              </span>
            )}
          </div>
          <p className="text-arcana-muted text-sm">暂无习惯，点击添加</p>
        </Card>
      ))}

      {/* AI Quick Input */}
      <div className="fixed bottom-20 right-4 z-40">
        <button className="w-14 h-14 bg-arcana-red card-skew-tr flex items-center justify-center shadow-lg shadow-arcana-red/30 hover:bg-arcana-red2 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      {/* Halftone decoration */}
      <div className="halftone opacity-10 h-24 w-full mt-4 rounded" />
    </div>
  )
}

export default Today
