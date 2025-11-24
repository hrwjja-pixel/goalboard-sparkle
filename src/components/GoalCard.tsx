import { Goal, GoalCategory } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  }
};

export const GoalCard = ({ goal, onClick }: GoalCardProps) => {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 p-6 cursor-pointer transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-1',
        getCategoryClass(goal.category)
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <Badge className={cn('text-xs font-semibold', getCategoryBadgeClass(goal.category))}>
          {goal.category}
        </Badge>
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
  );
};
