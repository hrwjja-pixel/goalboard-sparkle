import { Goal } from '@/types/goal';
import { Progress } from '@/components/ui/progress';
import { TrendingUp } from 'lucide-react';

interface OverallSummaryProps {
  goals: Goal[];
  filteredGoals: Goal[];
}

export const OverallSummary = ({ goals, filteredGoals }: OverallSummaryProps) => {
  const overallAverage = Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  );
  
  const filteredAverage = filteredGoals.length > 0
    ? Math.round(
        filteredGoals.reduce((sum, goal) => sum + goal.progress, 0) / filteredGoals.length
      )
    : 0;

  return (
    <div className="bg-card rounded-xl shadow-lg p-8 mb-8 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">팀 목표 대시보드</h2>
          <p className="text-muted-foreground">Healthcare IT Planning Team</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">진행 중</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground mb-1">전체 평균 진행률</p>
              <p className="text-5xl font-bold text-primary">{overallAverage}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">총 목표</p>
              <p className="text-2xl font-semibold">{goals.length}개</p>
            </div>
          </div>
          <Progress value={overallAverage} className="h-3" />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-muted-foreground mb-1">필터된 목표 평균</p>
              <p className="text-5xl font-bold text-accent">{filteredAverage}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">필터된 목표</p>
              <p className="text-2xl font-semibold">{filteredGoals.length}개</p>
            </div>
          </div>
          <Progress value={filteredAverage} className="h-3" />
        </div>
      </div>
    </div>
  );
};
