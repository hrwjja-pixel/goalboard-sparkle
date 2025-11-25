import { Goal, GoalCategory, GoalSize } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, TrendingUp, GripVertical, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
}

const getCategoryClass = (category: GoalCategory) => {
  switch (category) {
    case 'SERVICE':
      return 'goal-card-service';
    case 'AI':
      return 'goal-card-ai';
    case 'OPERATIONS':
      return 'goal-card-operations';
    default:
      return 'goal-card-service'; // fallback
  }
};

const getCategoryBadgeClass = (category: GoalCategory) => {
  switch (category) {
    case 'SERVICE':
      return 'badge-service';
    case 'AI':
      return 'badge-ai';
    case 'OPERATIONS':
      return 'badge-operations';
    default:
      return 'badge-service'; // fallback
  }
};

const getSizeClass = (size: GoalSize) => {
  switch (size) {
    case 'xs':
      return 'md:col-span-1 md:row-span-1';
    case 'small':
      return 'md:col-span-1 md:row-span-1';
    case 'medium':
      return 'md:col-span-1 md:row-span-2';
    case 'large':
      return 'md:col-span-2 md:row-span-2';
    case 'xl':
      return 'md:col-span-2 md:row-span-3';
    default:
      return 'md:col-span-1 md:row-span-1'; // fallback
  }
};

const getSizeBadge = (size: GoalSize) => {
  switch (size) {
    case 'xs':
      return { label: '최저 우선순위', color: 'bg-muted/50 text-muted-foreground' };
    case 'small':
      return { label: '낮은 우선순위', color: 'bg-muted text-muted-foreground' };
    case 'medium':
      return { label: '중간 우선순위', color: 'bg-accent text-accent-foreground' };
    case 'large':
      return { label: '높은 우선순위', color: 'bg-primary/80 text-primary-foreground' };
    case 'xl':
      return { label: '최고 우선순위', color: 'bg-primary text-primary-foreground' };
    default:
      return { label: '중간 우선순위', color: 'bg-accent text-accent-foreground' }; // fallback
  }
};

export const GoalCard = ({ goal, onClick }: GoalCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const sizeBadge = getSizeBadge(goal.size);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border-2 p-6 cursor-pointer transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1 animate-fade-in relative',
        getCategoryClass(goal.category),
        getSizeClass(goal.size),
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab active:cursor-grabbing p-1 hover:bg-foreground/10 rounded transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-5 h-5 text-foreground/40" />
      </div>
      <div onClick={onClick}>
      <div className="flex items-start justify-between mb-4 gap-2 flex-wrap">
        <div className="flex gap-2">
          <Badge className={cn('text-xs font-semibold', getCategoryBadgeClass(goal.category))}>
            {goal.category}
          </Badge>
          <Badge className={cn('text-xs font-semibold', sizeBadge.color)}>
            {sizeBadge.label}
          </Badge>
        </div>
        <div className="flex items-center gap-1 text-sm text-foreground/70">
          <User className="w-4 h-4" />
          <span className="font-medium">{goal.owner}</span>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-2 line-clamp-2">{goal.title}</h3>
      
      {goal.description && (
        <p className="text-sm text-foreground/70 mb-4 line-clamp-2">{goal.description}</p>
      )}

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              진행률
            </span>
            <span className="text-lg font-bold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>

        {(goal.startDate || goal.dueDate) && (
          <div className="flex items-center gap-2 text-xs text-foreground/60">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {formatDate(goal.startDate)} ~ {formatDate(goal.dueDate)}
            </span>
          </div>
        )}

        {goal.statusNote && (
          <div className="text-sm">
            <span className="font-medium">상태: </span>
            <span className="text-foreground/70">{goal.statusNote}</span>
          </div>
        )}
      </div>

      {goal.notes && goal.notes.some(note => note.isPinned) && (
        <div className="pt-4 border-t border-foreground/10">
          <div className="flex items-center gap-2 mb-2">
            <StickyNote className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold">중요 메모</p>
          </div>
          <div className="space-y-2">
            {goal.notes
              .filter(note => note.isPinned)
              .slice(0, 2)
              .map((note) => (
                <div key={note.id} className="p-2 bg-primary/10 rounded-md border border-primary/20">
                  <p className="text-xs text-foreground/80 line-clamp-2">{note.content}</p>
                  <p className="text-[10px] text-foreground/50 mt-1">{formatDate(note.createdAt)}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {goal.subGoals && goal.subGoals.length > 0 && (
        <div className="pt-4 border-t border-foreground/10">
          <p className="text-sm font-semibold mb-2">
            하위 목표 {goal.subGoals.length}개
          </p>
          <div className="space-y-2">
            {goal.subGoals.slice(0, 3).map((subGoal) => (
              <div key={subGoal.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium line-clamp-1">{subGoal.title}</span>
                  <span className="text-xs font-semibold ml-2">{subGoal.progress}%</span>
                </div>
                <Progress value={subGoal.progress} className="h-1" />
              </div>
            ))}
            {goal.subGoals.length > 3 && (
              <p className="text-xs text-primary font-medium">
                +{goal.subGoals.length - 3}개 더보기
              </p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
