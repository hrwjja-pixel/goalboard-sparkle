import { Goal, GoalCategory } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Plus, Minimize2, List, Maximize2, ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { FilterBar } from '@/components/FilterBar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OverallSummaryProps {
  goals: Goal[];
  filteredGoals: Goal[];
  onAddGoal: () => void;
  categoryColors?: Record<string, string>;
  viewMode?: 'normal' | 'compact' | 'list';
  onViewModeChange?: (mode: 'normal' | 'compact' | 'list') => void;
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedOwners: string[];
  onOwnerToggle: (owner: string) => void;
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  owners: string[];
  categories: GoalCategory[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onCategoryColorChange: (category: string, color: string) => void;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
  showCompleted: boolean;
  onShowCompletedToggle: () => void;
  completedCount: number;
  dashboardTitle?: string;
  dashboardSubtitle?: string;
  onSettingsClick?: () => void;
}

export const OverallSummary = ({
  goals,
  filteredGoals,
  onAddGoal,
  categoryColors,
  viewMode = 'normal',
  onViewModeChange,
  searchText,
  onSearchChange,
  selectedOwners,
  onOwnerToggle,
  selectedCategories,
  onCategoryToggle,
  owners,
  categories,
  onAddCategory,
  onDeleteCategory,
  onCategoryColorChange,
  onCategoryNameChange,
  showCompleted,
  onShowCompletedToggle,
  completedCount,
  dashboardTitle = 'WEHAGO H 목표 대시보드',
  dashboardSubtitle = 'EMR개발본부 > WEHAGO H 개발센터',
  onSettingsClick
}: OverallSummaryProps) => {
  // Filter goals based on showCompleted toggle
  const displayGoals = showCompleted ? goals : goals.filter(g => !g.completed);

  const overallAverage = displayGoals.length > 0
    ? Math.round(displayGoals.reduce((sum, goal) => sum + goal.progress, 0) / displayGoals.length)
    : 0;

  const filteredAverage = filteredGoals.length > 0
    ? Math.round(
        filteredGoals.reduce((sum, goal) => sum + goal.progress, 0) / filteredGoals.length
      )
    : 0;

  // Calculate category statistics based on showCompleted toggle
  const categoryStats = displayGoals.reduce((acc, goal) => {
    // Handle multiple categories per goal
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
    <div className="bg-card rounded-xl shadow-lg p-5 mb-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-1">{dashboardTitle}</h2>
            <p className="text-sm text-muted-foreground">{dashboardSubtitle}</p>
          </div>
          {Object.keys(categoryStats).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryStats).map(([category, stats]) => {
                const color = categoryColors?.[category] || '#6b7280';
                const avgProgress = Math.round(stats.totalProgress / stats.count);

                const isSelected = selectedCategories.includes(category);

                return (
                  <div
                    key={category}
                    onClick={() => onCategoryToggle(category)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md"
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
          )}
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'list' && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border bg-background/50 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">완료({completedCount})</span>
              <Switch
                checked={showCompleted}
                onCheckedChange={onShowCompletedToggle}
                className="data-[state=checked]:bg-green-600"
              />
            </div>
          )}
          {onViewModeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="default" variant="outline">
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
          <Button onClick={onAddGoal} size="default" className="shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            새 목표 추가
          </Button>
          {onSettingsClick && (
            <Button onClick={onSettingsClick} size="default" variant="outline" className="shadow-md">
              <Settings className="w-4 h-4" />
            </Button>
          )}
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

      {viewMode !== 'list' && (
        <div className="mt-4 pt-4 border-t border-border">
          <FilterBar
            searchText={searchText}
            onSearchChange={onSearchChange}
            selectedOwners={selectedOwners}
            onOwnerToggle={onOwnerToggle}
            selectedCategories={selectedCategories}
            onCategoryToggle={onCategoryToggle}
            owners={owners}
            categories={categories}
            categoryColors={categoryColors || {}}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
            onCategoryColorChange={onCategoryColorChange}
            onCategoryNameChange={onCategoryNameChange}
            showCompleted={showCompleted}
            onShowCompletedToggle={onShowCompletedToggle}
            completedCount={completedCount}
          />
        </div>
      )}
    </div>
  );
};
