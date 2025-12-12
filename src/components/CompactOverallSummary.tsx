import { Goal } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Plus, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CompactOverallSummaryProps {
  goals: Goal[];
  onAddGoal: () => void;
  onToggleView: () => void;
  categoryColors?: Record<string, string>;
}

export const CompactOverallSummary = ({ goals, onAddGoal, onToggleView, categoryColors }: CompactOverallSummaryProps) => {
  const overallAverage = goals.length > 0
    ? Math.round(goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length)
    : 0;

  // Calculate category statistics
  const categoryStats = goals.reduce((acc, goal) => {
    if (goal.categories && goal.categories.length > 0) {
      goal.categories.forEach((category) => {
        if (!acc[category]) {
          acc[category] = { count: 0, totalProgress: 0 };
        }
        acc[category].count++;
        acc[category].totalProgress += goal.progress;
      });
    }
    return acc;
  }, {} as Record<string, { count: number; totalProgress: number }>);

  return (
    <div className="bg-card rounded-lg shadow-md p-4 mb-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold mb-1">WEHAGO H 목표 대시보드</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  전체 평균: {overallAverage}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                총 {goals.length}개 목표
              </div>
            </div>
          </div>

          {/* Category Stats */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="flex flex-wrap gap-2 ml-8">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const color = categoryColors?.[category] || '#6b7280';
                const avgProgress = Math.round(stats.totalProgress / stats.count);

                return (
                  <div
                    key={category}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all"
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
                      className="text-[10px] font-semibold py-0 px-1.5"
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
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onToggleView} size="default" variant="default" className="shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
            <Maximize2 className="w-4 h-4 mr-2" />
            상세보기
          </Button>
          <Button onClick={onAddGoal} size="sm" variant="outline" className="shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            새 목표
          </Button>
        </div>
      </div>
      <Progress value={overallAverage} className="h-1.5" />
    </div>
  );
};
