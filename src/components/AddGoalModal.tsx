import { Goal, GoalCategory } from '@/types/goal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (goal: Goal) => void;
}

export const AddGoalModal = ({ open, onClose, onAdd }: AddGoalModalProps) => {
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    owner: '',
    category: 'SERVICE',
    progress: 0,
    startDate: '',
    dueDate: '',
    statusNote: '',
  });

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.owner) {
      alert('제목과 담당자는 필수 입력 항목입니다.');
      return;
    }

    const goal: Goal = {
      id: uuidv4(),
      title: newGoal.title,
      description: newGoal.description,
      owner: newGoal.owner,
      category: newGoal.category as GoalCategory,
      progress: newGoal.progress || 0,
      startDate: newGoal.startDate,
      dueDate: newGoal.dueDate,
      statusNote: newGoal.statusNote,
      subGoals: [],
    };

    onAdd(goal);
    
    // Reset form
    setNewGoal({
      title: '',
      description: '',
      owner: '',
      category: 'SERVICE',
      progress: 0,
      startDate: '',
      dueDate: '',
      statusNote: '',
    });
    
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">새 목표 추가</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>제목 *</Label>
            <Input
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="목표 제목을 입력하세요"
            />
          </div>

          <div>
            <Label>설명</Label>
            <Textarea
              value={newGoal.description}
              onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="목표에 대한 간단한 설명"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>담당자 *</Label>
              <Input
                value={newGoal.owner}
                onChange={(e) => setNewGoal({ ...newGoal, owner: e.target.value })}
                placeholder="담당자 이름"
              />
            </div>

            <div>
              <Label>카테고리</Label>
              <select
                value={newGoal.category}
                onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as GoalCategory })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="SERVICE">SERVICE</option>
                <option value="AI">AI</option>
                <option value="OPERATIONS">OPERATIONS</option>
              </select>
            </div>

            <div>
              <Label>시작일</Label>
              <Input
                type="date"
                value={newGoal.startDate}
                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
              />
            </div>

            <div>
              <Label>종료일</Label>
              <Input
                type="date"
                value={newGoal.dueDate}
                onChange={(e) => setNewGoal({ ...newGoal, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>상태 메모</Label>
            <Input
              value={newGoal.statusNote}
              onChange={(e) => setNewGoal({ ...newGoal, statusNote: e.target.value })}
              placeholder="현재 상태를 간단히 입력하세요"
            />
          </div>

          <div>
            <Label>진행률: {newGoal.progress}%</Label>
            <Slider
              value={[newGoal.progress || 0]}
              onValueChange={([value]) => setNewGoal({ ...newGoal, progress: value })}
              max={100}
              step={5}
              className="mt-2"
            />
            <Progress value={newGoal.progress || 0} className="mt-2 h-2" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} variant="outline">
              취소
            </Button>
            <Button onClick={handleAdd}>
              추가
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
