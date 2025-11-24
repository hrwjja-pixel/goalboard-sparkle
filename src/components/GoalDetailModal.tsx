import { Goal, SubGoal, GoalSize } from '@/types/goal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, Maximize2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface GoalDetailModalProps {
  goal: Goal | null;
  open: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export const GoalDetailModal = ({ goal, open, onClose, onSave, onDelete }: GoalDetailModalProps) => {
  const [editedGoal, setEditedGoal] = useState<Goal | null>(goal);

  // Update editedGoal when goal changes
  if (goal && editedGoal?.id !== goal.id) {
    setEditedGoal(goal);
  }

  if (!editedGoal) return null;

  const handleSubGoalChange = (subGoalId: string, field: keyof SubGoal, value: any) => {
    const updatedSubGoals = editedGoal.subGoals?.map((sg) =>
      sg.id === subGoalId ? { ...sg, [field]: value } : sg
    );
    
    const newProgress = updatedSubGoals && updatedSubGoals.length > 0
      ? Math.round(updatedSubGoals.reduce((sum, sg) => sum + sg.progress, 0) / updatedSubGoals.length)
      : editedGoal.progress;
    
    setEditedGoal({ ...editedGoal, subGoals: updatedSubGoals, progress: newProgress });
  };

  const handleAddSubGoal = () => {
    const newSubGoal: SubGoal = {
      id: uuidv4(),
      title: '새 하위 목표',
      owner: editedGoal.owner,
      progress: 0,
    };
    
    const updatedSubGoals = [...(editedGoal.subGoals || []), newSubGoal];
    setEditedGoal({ ...editedGoal, subGoals: updatedSubGoals });
  };

  const handleDeleteSubGoal = (subGoalId: string) => {
    const updatedSubGoals = editedGoal.subGoals?.filter((sg) => sg.id !== subGoalId);
    const newProgress = updatedSubGoals && updatedSubGoals.length > 0
      ? Math.round(updatedSubGoals.reduce((sum, sg) => sum + sg.progress, 0) / updatedSubGoals.length)
      : 0;
    
    setEditedGoal({ ...editedGoal, subGoals: updatedSubGoals, progress: newProgress });
  };

  const handleSave = () => {
    onSave(editedGoal);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('이 목표를 삭제하시겠습니까?')) {
      onDelete(editedGoal.id);
      onClose();
    }
  };

  const hasSubGoals = editedGoal.subGoals && editedGoal.subGoals.length > 0;

  const sizeOptions: { value: GoalSize; label: string; description: string }[] = [
    { value: 'xs', label: '최저 우선순위', description: '1x1 카드' },
    { value: 'small', label: '낮은 우선순위', description: '1x1 카드' },
    { value: 'medium', label: '중간 우선순위', description: '1x2 카드 (높이 2배)' },
    { value: 'large', label: '높은 우선순위', description: '2x2 카드 (가로/세로 2배)' },
    { value: 'xl', label: '최고 우선순위', description: '2x3 카드 (매우 큰 크기)' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">목표 상세</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>제목</Label>
              <Input
                value={editedGoal.title}
                onChange={(e) => setEditedGoal({ ...editedGoal, title: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>설명</Label>
              <Textarea
                value={editedGoal.description || ''}
                onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>담당자</Label>
              <Input
                value={editedGoal.owner}
                onChange={(e) => setEditedGoal({ ...editedGoal, owner: e.target.value })}
              />
            </div>

            <div>
              <Label>카테고리</Label>
              <select
                value={editedGoal.category}
                onChange={(e) => setEditedGoal({ ...editedGoal, category: e.target.value as any })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="SERVICE">SERVICE</option>
                <option value="AI">AI</option>
                <option value="OPERATIONS">OPERATIONS</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Maximize2 className="w-5 h-5 text-primary" />
              <Label className="text-base">카드 크기 (우선순위)</Label>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEditedGoal({ ...editedGoal, size: option.value })}
                  className={cn(
                    'p-3 rounded-lg border-2 text-left transition-all',
                    editedGoal.size === option.value
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-primary/50'
                  )}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>시작일</Label>
              <Input
                type="date"
                value={editedGoal.startDate || ''}
                onChange={(e) => setEditedGoal({ ...editedGoal, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label>종료일</Label>
              <Input
                type="date"
                value={editedGoal.dueDate || ''}
                onChange={(e) => setEditedGoal({ ...editedGoal, dueDate: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>상태 메모</Label>
              <Input
                value={editedGoal.statusNote || ''}
                onChange={(e) => setEditedGoal({ ...editedGoal, statusNote: e.target.value })}
              />
            </div>

            {!hasSubGoals && (
              <div className="col-span-2">
                <Label>진행률: {editedGoal.progress}%</Label>
                <Slider
                  value={[editedGoal.progress]}
                  onValueChange={([value]) => setEditedGoal({ ...editedGoal, progress: value })}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <Progress value={editedGoal.progress} className="mt-2 h-2" />
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">하위 목표</h3>
              <Button onClick={handleAddSubGoal} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                하위 목표 추가
              </Button>
            </div>

            {hasSubGoals && (
              <div className="space-y-4">
                {editedGoal.subGoals!.map((subGoal) => (
                  <div key={subGoal.id} className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label className="text-xs">제목</Label>
                        <Input
                          value={subGoal.title}
                          onChange={(e) => handleSubGoalChange(subGoal.id, 'title', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">담당자</Label>
                        <Input
                          value={subGoal.owner}
                          onChange={(e) => handleSubGoalChange(subGoal.id, 'owner', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-xs">상태 메모</Label>
                        <Input
                          value={subGoal.statusNote || ''}
                          onChange={(e) => handleSubGoalChange(subGoal.id, 'statusNote', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-2">
                          <Label className="text-xs">진행률</Label>
                          <span className="text-sm font-bold">{subGoal.progress}%</span>
                        </div>
                        <Slider
                          value={[subGoal.progress]}
                          onValueChange={([value]) => handleSubGoalChange(subGoal.id, 'progress', value)}
                          max={100}
                          step={5}
                        />
                        <Progress value={subGoal.progress} className="mt-2 h-1.5" />
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleDeleteSubGoal(subGoal.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {hasSubGoals && (
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">자동 계산된 전체 진행률</span>
                  <span className="text-xl font-bold text-primary">{editedGoal.progress}%</span>
                </div>
                <Progress value={editedGoal.progress} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={handleDelete} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              목표 삭제
            </Button>
            <div className="flex gap-2">
              <Button onClick={onClose} variant="outline">
                취소
              </Button>
              <Button onClick={handleSave}>
                저장
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
