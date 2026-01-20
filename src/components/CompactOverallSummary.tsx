import { Goal, GoalCategory } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Plus, Maximize2, List, Minimize2, ChevronDown, Settings } from 'lucide-react';
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
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  showCompleted: boolean;
  onShowCompletedToggle: () => void;
  completedCount: number;
  dashboardTitle?: string;
  dashboardSubtitle?: string;
  onSettingsClick?: () => void;
}

export const CompactOverallSummary = ({
  goals,
  onAddGoal,
  viewMode = 'compact',
  onViewModeChange,
  categoryColors,
  selectedCategories,
  onCategoryToggle,
  showCompleted,
  onShowCompletedToggle,
  completedCount,
  dashboardTitle = 'WEHAGO H 목표 대시보드',
  dashboardSubtitle = 'EMR개발본부 > WEHAGO H 개발센터',
  onSettingsClick
}: CompactOverallSummaryProps) => {
  // Filter goals based on showCompleted toggle
  const displayGoals = showCompleted ? goals : goals.filter(g => !g.completed);

  const overallAverage = displayGoals.length > 0
    ? Math.round(displayGoals.reduce((sum, goal) => sum + goal.progress, 0) / displayGoals.length)
    : 0;

  // Calculate category statistics based on showCompleted toggle
  const categoryStats = displayGoals.reduce((acc, goal) => {
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
            <h2 className="text-lg font-bold mb-1">{dashboardTitle}</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  전체 평균: {overallAverage}%
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                총 {displayGoals.length}개 목표
              </div>
            </div>
          </div>

          {/* Category Stats */}
          {Object.keys(categoryStats).length > 0 && (
            <div className="flex flex-wrap gap-2 ml-8">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const color = categoryColors?.[category] || '#6b7280';
                const avgProgress = Math.round(stats.totalProgress / stats.count);
                const isSelected = selectedCategories.includes(category);

                return (
                  <div
                    key={category}
                    onClick={() => onCategoryToggle(category)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all cursor-pointer hover:shadow-md"
                    style={{
                      backgroundColor: isSelected ? `${color}20` : `${color}10`,
                      borderColor: isSelected ? `${color}80` : `${color}40`,
                      opacity: isSelected ? 1 : 0.7,
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
          {onSettingsClick && (
            <Button onClick={onSettingsClick} size="sm" variant="outline" className="shadow-md">
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <Progress value={overallAverage} className="h-1.5" />
    </div>
  );
};
