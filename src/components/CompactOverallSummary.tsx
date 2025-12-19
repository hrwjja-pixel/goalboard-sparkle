import { Goal } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Plus, Maximize2, List, Minimize2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CompactOverallSummaryProps {
  goals: Goal[];
  onAddGoal: () => void;
  viewMode?: 'normal' | 'compact' | 'list';
  onViewModeChange?: (mode: 'normal' | 'compact' | 'list') => void;
  categoryColors?: Record<string, string>;
  showCompleted: boolean;
  onShowCompletedToggle: () => void;
  completedCount: number;
}

export const CompactOverallSummary = ({ goals, onAddGoal, viewMode = 'compact', onViewModeChange, categoryColors, showCompleted, onShowCompletedToggle, completedCount }: CompactOverallSummaryProps) => {
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background/50 shadow-sm">
            <span className="text-xs font-medium text-muted-foreground">완료({completedCount})</span>
            <Switch
              checked={showCompleted}
              onCheckedChange={onShowCompletedToggle}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
          {onViewModeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="default" variant="default" className="shadow-lg bg-primary text-primary-foreground hover:bg-primary/90">
                  {viewMode === 'normal' && <><Maximize2 className="w-4 h-4 mr-2" />상세보기</>}
                  {viewMode === 'compact' && <><Minimize2 className="w-4 h-4 mr-2" />요약보기</>}
                  {viewMode === 'list' && <><List className="w-4 h-4 mr-2" />목록보기</>}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onViewModeChange('compact')}>
                  <Minimize2 className="w-4 h-4 mr-2" />
                  요약보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewModeChange('normal')}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  상세보기
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewModeChange('list')}>
                  <List className="w-4 h-4 mr-2" />
                  목록보기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
