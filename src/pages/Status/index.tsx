import Card from '@/components/ui/Card'

const dimensions = [
  { name: '专业力', level: 1, exp: 0, maxExp: 100, color: '#C3002F' },
  { name: '体能',   level: 1, exp: 0, maxExp: 100, color: '#E8C840' },
  { name: '社交',   level: 1, exp: 0, maxExp: 100, color: '#4FC3F7' },
  { name: '创造',   level: 1, exp: 0, maxExp: 100, color: '#A5D6A7' },
  { name: '自律',   level: 1, exp: 0, maxExp: 100, color: '#CE93D8' },
]

const Status = () => {
  return (
    <div className="page-container space-y-4">
      {/* Character Card */}
      <Card variant="red" className="mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-arcana-dim card-skew-tr flex items-center justify-center">
            <span className="font-display text-2xl text-arcana-red">M</span>
          </div>
          <div>
            <h2 className="font-display text-2xl tracking-widest text-arcana-white">MILO</h2>
            <p className="text-arcana-muted text-xs font-mono">TOTAL LV. 1 · PHANTOM THIEF</p>
          </div>
        </div>
      </Card>

      {/* Dimensions */}
      <div className="space-y-3">
        {dimensions.map((dim) => (
          <Card key={dim.name} className="py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display tracking-widest text-arcana-white">{dim.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-arcana-muted font-mono text-xs">{dim.exp}/{dim.maxExp} EXP</span>
                <span className="font-display text-arcana-gold text-sm">LV.{dim.level}</span>
              </div>
            </div>
            {/* EXP Bar */}
            <div className="h-1.5 bg-arcana-dim rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(dim.exp / dim.maxExp) * 100}%`,
                  backgroundColor: dim.color,
                }}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Radar placeholder */}
      <Card className="h-48 flex items-center justify-center mt-4">
        <p className="text-arcana-muted font-mono text-sm">[ RADAR CHART COMING SOON ]</p>
      </Card>
    </div>
  )
}

export default Status
