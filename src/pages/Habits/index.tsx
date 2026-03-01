import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const Habits = () => {
  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-arcana-muted text-xs font-mono tracking-widest">HABITS</p>
          <h1 className="font-display text-3xl text-arcana-white tracking-wider">习惯管理</h1>
        </div>
        <Button variant="primary" className="text-xs px-4 py-2">+ 新建</Button>
      </div>

      {['早晨', '下午', '夜晚'].map((slot) => (
        <div key={slot}>
          <p className="font-mono text-arcana-red text-xs tracking-widest mb-2">── {slot} ──</p>
          <Card className="border-dashed">
            <p className="text-arcana-muted text-sm text-center py-4">暂无习惯</p>
          </Card>
        </div>
      ))}
    </div>
  )
}

export default Habits
