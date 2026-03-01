import Card from '@/components/ui/Card'

const Growth = () => {
  return (
    <div className="page-container space-y-4">
      <div className="mb-6">
        <p className="text-arcana-muted text-xs font-mono tracking-widest">GROWTH</p>
        <h1 className="font-display text-3xl text-arcana-white tracking-wider">成长记录</h1>
      </div>

      {/* Streak */}
      <Card variant="gold" className="flex items-center justify-between">
        <div>
          <p className="text-arcana-muted text-xs font-mono">CURRENT STREAK</p>
          <p className="font-display text-4xl text-arcana-gold">0 <span className="text-lg">天</span></p>
        </div>
        <div className="text-right">
          <p className="text-arcana-muted text-xs font-mono">BEST</p>
          <p className="font-display text-2xl text-arcana-white">0 天</p>
        </div>
      </Card>

      {/* Heatmap placeholder */}
      <Card className="py-6">
        <p className="text-arcana-muted text-xs font-mono tracking-widest mb-4">90-DAY HEATMAP</p>
        <div className="grid grid-cols-13 gap-1">
          {Array.from({ length: 90 }).map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          ))}
        </div>
      </Card>

      {/* Milestones */}
      <Card>
        <p className="text-arcana-muted text-xs font-mono tracking-widest mb-3">MILESTONES</p>
        <p className="text-arcana-muted text-sm text-center py-4">完成第一次打卡后解锁</p>
      </Card>
    </div>
  )
}

export default Growth
