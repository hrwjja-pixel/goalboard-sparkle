import { Goal, GoalCategory } from '@/types/goal';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, User, CheckCircle2, Circle, Filter, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PriorityIcon } from '@/components/PriorityIcon';
import { CategoryQuickEditor } from '@/components/CategoryQuickEditor';

interface ListViewProps {
  goals: Goal[];
  categories?: GoalCategory[];
  categoryColors?: Record<string, string>;
  onGoalClick: (goal: Goal) => void;
  onToggleComplete?: (goalId: string, completed: boolean) => void;
  onUpdateCategories?: (goalId: string, categories: GoalCategory[]) => Promise<void>;
  onAddCategory?: (name: string) => Promise<void>;
  onUpdateCategoryColor?: (category: string, color: string) => Promise<void>;
  onUpdateCategoryName?: (oldName: string, newName: string) => Promise<void>;
  onDeleteCategory?: (category: string) => Promise<void>;
  categoryUsageCount?: Record<string, number>;
  showCompleted: boolean;
}

type SortField = 'title' | 'owner' | 'progress' | 'completed' | 'startDate' | null;
type SortDirection = 'asc' | 'desc';

export const ListView = ({
  goals,
  categories: allCategories = [],
  categoryColors,
  onGoalClick,
  onToggleComplete,
  onUpdateCategories,
  onAddCategory,
  onUpdateCategoryColor,
  onUpdateCategoryName,
  onDeleteCategory,
  categoryUsageCount,
  showCompleted,
}: ListViewProps) => {
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [statusSearch, setStatusSearch] = useState('');

  // Sort state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Get unique owners and categories
  const owners = useMemo(() => {
    const ownerSet = new Set<string>();
    goals.forEach((goal) => ownerSet.add(goal.owner));
    return Array.from(ownerSet).sort();
  }, [goals]);

  const categories = useMemo(() => {
    const categorySet = new Set<GoalCategory>();
    goals.forEach((goal) => {
      if (goal.categories) {
        goal.categories.forEach((cat) => categorySet.add(cat));
      }
    });
    return Array.from(categorySet).sort();
  }, [goals]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort goals
  const filteredAndSortedGoals = useMemo(() => {
    let filtered = goals.filter((goal) => {
      // Completed filter - only show completed if showCompleted is true
      if (!showCompleted && goal.completed) {
        return false;
      }

      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(searchLower);
        const matchesDesc = goal.description?.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Owner filter
      if (selectedOwners.length > 0 && !selectedOwners.includes(goal.owner)) {
        return false;
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!goal.categories || !goal.categories.some(cat => selectedCategories.includes(cat))) {
          return false;
        }
      }

      // Status filter
      if (statusSearch && goal.statusNote) {
        if (!goal.statusNote.toLowerCase().includes(statusSearch.toLowerCase())) {
          return false;
        }
      }

      return true;
    });

    // Sort
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        switch (sortField) {
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          case 'owner':
            aVal = a.owner.toLowerCase();
            bVal = b.owner.toLowerCase();
            break;
          case 'progress':
            aVal = a.progress;
            bVal = b.progress;
            break;
          case 'completed':
            aVal = a.completed ? 1 : 0;
            bVal = b.completed ? 1 : 0;
            break;
          case 'startDate':
            aVal = a.startDate ? new Date(a.startDate).getTime() : 0;
            bVal = b.startDate ? new Date(b.startDate).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [goals, showCompleted, searchText, selectedOwners, selectedCategories, statusSearch, sortField, sortDirection]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getCategoryStyle = (category: GoalCategory) => {
    const color = categoryColors?.[category];
    if (!color) return {};
    return {
      backgroundColor: color,
      color: '#ffffff',
    };
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return sortDirection === 'asc' ?
      <ArrowUp className="w-3 h-3 ml-1" /> :
      <ArrowDown className="w-3 h-3 ml-1" />;
  };

  return (
    <div className="bg-card rounded-lg shadow-md border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">목표 목록</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>전체: {goals.length}개</span>
            <span className="text-primary font-semibold">필터 결과: {filteredAndSortedGoals.length}개</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-muted/50">
              {/* 완료 컬럼 */}
              <TableHead className="w-12 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                  onClick={() => handleSort('completed')}
                >
                  완료
                  {getSortIcon('completed')}
                </Button>
              </TableHead>

              {/* 목표 컬럼 */}
              <TableHead className="min-w-[200px] font-semibold">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                      onClick={() => handleSort('title')}
                    >
                      목표
                      {getSortIcon('title')}
                      <Filter className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <Input
                      placeholder="목표 검색..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      className="h-8"
                    />
                  </PopoverContent>
                </Popover>
              </TableHead>

              {/* 담당자 컬럼 */}
              <TableHead className="w-32 font-semibold">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                      onClick={() => handleSort('owner')}
                    >
                      담당자
                      {getSortIcon('owner')}
                      <Filter className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="flex gap-2 pb-2 border-b">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setSelectedOwners(owners)}
                        >
                          전체 선택
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setSelectedOwners([])}
                        >
                          전체 해제
                        </Button>
                      </div>
                      {owners.map((owner) => (
                        <div key={owner} className="flex items-center space-x-2">
                          <Checkbox
                            id={`owner-${owner}`}
                            checked={selectedOwners.includes(owner)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedOwners([...selectedOwners, owner]);
                              } else {
                                setSelectedOwners(selectedOwners.filter(o => o !== owner));
                              }
                            }}
                          />
                          <label htmlFor={`owner-${owner}`} className="text-sm cursor-pointer">
                            {owner}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              {/* 카테고리 컬럼 */}
              <TableHead className="w-48 font-semibold">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                    >
                      카테고리
                      <Filter className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      <div className="flex gap-2 pb-2 border-b">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setSelectedCategories(categories)}
                        >
                          전체 선택
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 text-xs"
                          onClick={() => setSelectedCategories([])}
                        >
                          전체 해제
                        </Button>
                      </div>
                      {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategories([...selectedCategories, category]);
                              } else {
                                setSelectedCategories(selectedCategories.filter(c => c !== category));
                              }
                            }}
                          />
                          <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </TableHead>

              {/* 진행률 컬럼 */}
              <TableHead className="w-32 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                  onClick={() => handleSort('progress')}
                >
                  진행률
                  {getSortIcon('progress')}
                </Button>
              </TableHead>

              {/* 기간 컬럼 */}
              <TableHead className="w-48 font-semibold">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                  onClick={() => handleSort('startDate')}
                >
                  기간
                  {getSortIcon('startDate')}
                </Button>
              </TableHead>

              {/* 상태 컬럼 */}
              <TableHead className="min-w-[150px] font-semibold">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 flex items-center gap-1 hover:bg-accent font-semibold"
                    >
                      상태
                      <Filter className="w-3 h-3 ml-1 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <Input
                      placeholder="상태 검색..."
                      value={statusSearch}
                      onChange={(e) => setStatusSearch(e.target.value)}
                      className="h-8"
                    />
                  </PopoverContent>
                </Popover>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedGoals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  필터 조건에 맞는 목표가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedGoals.map((goal) => (
                <TableRow
                  key={goal.id}
                  className={cn(
                    "cursor-pointer hover:bg-accent/20 transition-colors",
                    goal.completed && "opacity-60 saturate-50"
                  )}
                  onClick={() => onGoalClick(goal)}
                >
                  <TableCell className="text-center">
                    {onToggleComplete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(goal.id, !goal.completed);
                        }}
                        className={cn(
                          "p-1 rounded-full transition-all duration-200",
                          goal.completed
                            ? "text-green-600 hover:bg-green-100"
                            : "text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-start gap-2">
                      <PriorityIcon size={goal.size} className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col gap-1">
                        <span className="line-clamp-1">{goal.title}</span>
                        {goal.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1">
                            {goal.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{goal.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 items-center">
                      {goal.categories?.map((category, index) => (
                        <Badge
                          key={index}
                          style={getCategoryStyle(category as GoalCategory)}
                          className="text-[10px] font-semibold py-0 px-1.5"
                        >
                          {category}
                        </Badge>
                      ))}
                      {onUpdateCategories && (
                        <CategoryQuickEditor
                          goal={goal}
                          categories={allCategories}
                          categoryColors={categoryColors || {}}
                          onUpdateCategories={onUpdateCategories}
                          onAddCategory={onAddCategory}
                          onUpdateCategoryColor={onUpdateCategoryColor}
                          onUpdateCategoryName={onUpdateCategoryName}
                          onDeleteCategory={onDeleteCategory}
                          categoryUsageCount={categoryUsageCount}
                          size="sm"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={goal.progress} className="h-2 flex-1" />
                      <span className="text-sm font-semibold min-w-[3ch] text-right">
                        {goal.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span className="whitespace-nowrap">
                        {formatDate(goal.startDate)} ~ {formatDate(goal.dueDate)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {goal.statusNote && (
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {goal.statusNote}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
