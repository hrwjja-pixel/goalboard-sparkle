import { Goal } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OverallSummaryProps {
  goals: Goal[];
  filteredGoals: Goal[];
  onAddGoal: () => void;
  categoryColors?: Record<string, string>;
}

export const OverallSummary = ({ goals, filteredGoals, onAddGoal, categoryColors }: OverallSummaryProps) => {
  const overallAverage = Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  );
  
  const filteredAverage = filteredGoals.length > 0
    ? Math.round(
        filteredGoals.reduce((sum, goal) => sum + goal.progress, 0) / filteredGoals.length
      )
    : 0;

  // Calculate category statistics
  const categoryStats = goals.reduce((acc, goal) => {
    if (!acc[goal.category]) {
      acc[goal.category] = { count: 0, totalProgress: 0 };
    }
    acc[goal.category].count++;
    acc[goal.category].totalProgress += goal.progress;
    return acc;
  }, {} as Record<string, { count: number; totalProgress: number }>);

  return (
    <div className="bg-card rounded-xl shadow-lg p-5 mb-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">팀 목표 대시보드</h2>
          <p className="text-sm text-muted-foreground">Healthcare IT Planning Team</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">진행 중</span>
          </div>
          <Button onClick={onAddGoal} size="default" className="shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            새 목표 추가
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">전체 평균 진행률</p>
              <p className="text-3xl font-bold text-primary">{overallAverage}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">총 목표</p>
              <p className="text-xl font-semibold">{goals.length}개</p>
            </div>
          </div>
          <Progress value={overallAverage} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">필터된 목표 평균</p>
              <p className="text-3xl font-bold text-accent">{filteredAverage}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">필터된 목표</p>
              <p className="text-xl font-semibold">{filteredGoals.length}개</p>
            </div>
          </div>
          <Progress value={filteredAverage} className="h-2" />
        </div>
      </div>

      {Object.keys(categoryStats).length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">카테고리별 현황</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const color = categoryColors?.[category] || '#6b7280';
              const avgProgress = Math.round(stats.totalProgress / stats.count);
              
              return (
                <div
                  key={category}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: `${color}10`,
                    borderColor: `${color}40`,
                  }}
                >
                  <Badge
                    style={{
                      backgroundColor: color,
                      color: '#ffffff',
                    }}
                    className="text-xs font-semibold"
                  >
                    {category}
                  </Badge>
                  <span className="text-xs font-medium" style={{ color }}>
                    {stats.count}개 · {avgProgress}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
