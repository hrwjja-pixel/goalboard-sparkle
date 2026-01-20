import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: { dashboardTitle: string; dashboardSubtitle: string }) => void;
  currentTitle: string;
  currentSubtitle: string;
}

export const SettingsDialog = ({ open, onClose, onSave, currentTitle, currentSubtitle }: SettingsDialogProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [subtitle, setSubtitle] = useState(currentSubtitle);

  useEffect(() => {
    setTitle(currentTitle);
    setSubtitle(currentSubtitle);
  }, [currentTitle, currentSubtitle, open]);

  const handleSave = () => {
    onSave({
      dashboardTitle: title,
      dashboardSubtitle: subtitle,
    });
    onClose();
  };

  const handleReset = () => {
    setTitle('WEHAGO H 목표 대시보드');
    setSubtitle('EMR개발본부 > WEHAGO H 개발센터');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>대시보드 설정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">대시보드 제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: WEHAGO H 목표 대시보드"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subtitle">부제목</Label>
            <Input
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예: EMR개발본부 > WEHAGO H 개발센터"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            기본값 복원
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSave}>
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
