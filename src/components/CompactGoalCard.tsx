import { Goal, GoalCategory, GoalSize } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, TrendingUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkifiedText } from '@/components/LinkifiedText';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CompactGoalCardProps {
  goal: Goal;
  onClick: () => void;
  categoryColors?: Record<string, string>;
}

const getCategoryStyle = (category: GoalCategory, categoryColors?: Record<string, string>) => {
  const color = categoryColors?.[category];
  if (!color) {
    // Fallback to default styles if no custom color
    switch (category) {
      case 'SERVICE':
        return { className: 'goal-card-service', badgeClassName: 'badge-service' };
      case 'AI':
        return { className: 'goal-card-ai', badgeClassName: 'badge-ai' };
      case 'OPERATIONS':
        return { className: 'goal-card-operations', badgeClassName: 'badge-operations' };
      default:
        return { className: 'goal-card-service', badgeClassName: 'badge-service' };
    }
  }

  return {
    style: {
      backgroundColor: `${color}10`,
      borderColor: `${color}60`,
    },
    badgeStyle: {
      backgroundColor: color,
      color: '#ffffff',
    },
  };
};

export const CompactGoalCard = ({ goal, onClick, categoryColors }: CompactGoalCardProps) => {
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
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Use first category for card styling
  const primaryCategory = goal.categories && goal.categories.length > 0 ? goal.categories[0] : 'SERVICE';
  const categoryStyle = getCategoryStyle(primaryCategory as GoalCategory, categoryColors);

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, ...categoryStyle.style }}
      className={cn(
        'rounded-lg border-2 p-3 cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-0.5 animate-fade-in relative',
        categoryStyle.className,
        isDragging && 'opacity-50 z-50'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1.5 right-1.5 cursor-grab active:cursor-grabbing p-0.5 hover:bg-foreground/10 rounded transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-4 h-4 text-foreground/40" />
      </div>
      <div onClick={onClick}>
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs text-foreground/70 mb-1.5">
            <User className="w-3 h-3" />
            <span className="font-medium">{goal.owner}</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {goal.categories && goal.categories.map((category, index) => {
              const catStyle = getCategoryStyle(category as GoalCategory, categoryColors);
              return (
                <Badge
                  key={index}
                  style={catStyle.badgeStyle}
                  className={cn('text-[10px] font-semibold py-0 px-1.5', catStyle.badgeClassName)}
                >
                  {category}
                </Badge>
              );
            })}
          </div>
        </div>

        <h3 className="text-sm font-bold mb-1.5 line-clamp-1">{goal.title}</h3>

        {goal.description && (
          <p className="text-xs text-foreground/70 mb-2 line-clamp-1">
            <LinkifiedText text={goal.description} />
          </p>
        )}

        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                진행률
              </span>
              <span className="text-sm font-bold">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-1.5" />
          </div>

          {(goal.startDate || goal.dueDate) && (
            <div className="flex items-center gap-1.5 text-[10px] text-foreground/60">
              <Calendar className="w-3 h-3" />
              <span>
                {formatDate(goal.startDate)} ~ {formatDate(goal.dueDate)}
              </span>
            </div>
          )}

          {goal.statusNote && (
            <div className="text-xs">
              <span className="font-medium">상태: </span>
              <span className="text-foreground/70 line-clamp-1">
                <LinkifiedText text={goal.statusNote} />
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
