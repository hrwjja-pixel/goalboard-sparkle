import { Goal, SubGoal, GoalSize, Note, GoalCategory, Attachment } from '@/types/goal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Trash2, Plus, Maximize2, StickyNote, Pin, ChevronUp, ChevronDown, Pencil, Save, X, Paperclip, Upload, Download, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { LinkifiedText } from '@/components/LinkifiedText';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';

interface GoalDetailModalProps {
  goal: Goal | null;
  open: boolean;
  onClose: () => void;
  onSave: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  categories?: GoalCategory[];
}

export const GoalDetailModal = ({ goal, open, onClose, onSave, onDelete, categories = ['SERVICE', 'AI', 'OPERATIONS'] }: GoalDetailModalProps) => {
  const [editedGoal, setEditedGoal] = useState<Goal | null>(goal);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingStatusNote, setIsEditingStatusNote] = useState(false);
  const [editingSubGoalStatusNotes, setEditingSubGoalStatusNotes] = useState<Set<string>>(new Set());

  // Update editedGoal when goal changes
  useEffect(() => {
    if (goal) {
      console.log('GoalDetailModal: Updating with new goal data', goal);
      setEditedGoal(goal);
      setIsEditingDescription(false);
      setIsEditingStatusNote(false);
      setEditingSubGoalStatusNotes(new Set());
    }
  }, [goal]);

  if (!editedGoal) return null;

  const toggleSubGoalStatusNoteEdit = (subGoalId: string) => {
    const newSet = new Set(editingSubGoalStatusNotes);
    if (newSet.has(subGoalId)) {
      newSet.delete(subGoalId);
    } else {
      newSet.add(subGoalId);
    }
    setEditingSubGoalStatusNotes(newSet);
  };

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

  const handleMoveSubGoalUp = (index: number) => {
    if (index === 0 || !editedGoal.subGoals) return;

    const updatedSubGoals = [...editedGoal.subGoals];
    [updatedSubGoals[index - 1], updatedSubGoals[index]] = [updatedSubGoals[index], updatedSubGoals[index - 1]];

    setEditedGoal({ ...editedGoal, subGoals: updatedSubGoals });
  };

  const handleMoveSubGoalDown = (index: number) => {
    if (!editedGoal.subGoals || index === editedGoal.subGoals.length - 1) return;

    const updatedSubGoals = [...editedGoal.subGoals];
    [updatedSubGoals[index], updatedSubGoals[index + 1]] = [updatedSubGoals[index + 1], updatedSubGoals[index]];

    setEditedGoal({ ...editedGoal, subGoals: updatedSubGoals });
  };

  const handleAddNote = (content: string, isPinned: boolean) => {
    if (!content.trim()) return;

    const newNote: Note = {
      id: uuidv4(),
      content,
      createdAt: new Date().toISOString(),
      isPinned,
    };

    const updatedNotes = [...(editedGoal.notes || []), newNote];
    setEditedGoal({ ...editedGoal, notes: updatedNotes });
  };

  const handleTogglePin = (noteId: string) => {
    const updatedNotes = editedGoal.notes?.map((note) =>
      note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
    );
    setEditedGoal({ ...editedGoal, notes: updatedNotes });
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = editedGoal.notes?.filter((note) => note.id !== noteId);
    setEditedGoal({ ...editedGoal, notes: updatedNotes });
  };

  const handleEditNote = (noteId: string, newContent: string) => {
    const updatedNotes = editedGoal.notes?.map((note) =>
      note.id === noteId ? { ...note, content: newContent, updatedAt: new Date().toISOString() } : note
    );
    setEditedGoal({ ...editedGoal, notes: updatedNotes });
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
    { value: 'xs', label: '최저 중요도', description: '1x1 카드' },
    { value: 'small', label: '낮은 중요도', description: '1x1 카드' },
    { value: 'medium', label: '중간 중요도', description: '1x2 카드 (높이 2배)' },
    { value: 'large', label: '높은 중요도', description: '2x2 카드 (가로/세로 2배)' },
    { value: 'xl', label: '최고 중요도', description: '2x3 카드 (매우 큰 크기)' },
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
              <div className="flex justify-between items-center mb-2">
                <Label>설명</Label>
                <Button
                  onClick={() => setIsEditingDescription(!isEditingDescription)}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                >
                  {isEditingDescription ? (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      완료
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-1" />
                      편집
                    </>
                  )}
                </Button>
              </div>
              {isEditingDescription ? (
                <Textarea
                  value={editedGoal.description || ''}
                  onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                  rows={3}
                />
              ) : (
                <div className="p-3 min-h-[80px] bg-muted rounded-md border text-sm">
                  {editedGoal.description ? (
                    <LinkifiedText text={editedGoal.description} />
                  ) : (
                    <span className="text-muted-foreground">설명이 없습니다</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>담당자</Label>
              <Input
                value={editedGoal.owner}
                onChange={(e) => setEditedGoal({ ...editedGoal, owner: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label>카테고리 (최소 1개, 최대 5개)</Label>
              <div className="mt-2 space-y-2 p-3 border rounded-md bg-background">
                {categories.map((category) => {
                  const isSelected = editedGoal.categories?.includes(category);
                  const canSelect = !isSelected && (editedGoal.categories?.length || 0) < 5;
                  const canDeselect = isSelected && (editedGoal.categories?.length || 0) > 1;

                  return (
                    <label
                      key={category}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                        isSelected ? "bg-primary/10" : "hover:bg-muted",
                        !canSelect && !isSelected && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={(!canSelect && !isSelected) || (!canDeselect && isSelected)}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(editedGoal.categories || []), category]
                            : (editedGoal.categories || []).filter(c => c !== category);

                          setEditedGoal({ ...editedGoal, categories: newCategories });
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                선택됨: {editedGoal.categories?.length || 0} / 5
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Maximize2 className="w-5 h-5 text-primary" />
              <Label className="text-base">카드 크기 (중요도)</Label>
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
              <div className="flex justify-between items-center mb-2">
                <Label>상태 메모</Label>
                <Button
                  onClick={() => setIsEditingStatusNote(!isEditingStatusNote)}
                  variant="ghost"
                  size="sm"
                  className="h-7"
                >
                  {isEditingStatusNote ? (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      완료
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4 mr-1" />
                      편집
                    </>
                  )}
                </Button>
              </div>
              {isEditingStatusNote ? (
                <Input
                  value={editedGoal.statusNote || ''}
                  onChange={(e) => setEditedGoal({ ...editedGoal, statusNote: e.target.value })}
                />
              ) : (
                <div className="p-2 min-h-[40px] bg-muted rounded-md border text-sm flex items-center">
                  {editedGoal.statusNote ? (
                    <LinkifiedText text={editedGoal.statusNote} />
                  ) : (
                    <span className="text-muted-foreground">상태 메모가 없습니다</span>
                  )}
                </div>
              )}
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
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">메모</h3>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <NoteInput onAddNote={handleAddNote} />
              
              {editedGoal.notes && editedGoal.notes.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {editedGoal.notes
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onTogglePin={handleTogglePin}
                        onDelete={handleDeleteNote}
                        onEdit={handleEditNote}
                      />
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  아직 메모가 없습니다
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">첨부파일</h3>
              </div>
            </div>

            <AttachmentSection
              goalId={editedGoal.id}
              attachments={editedGoal.attachments || []}
              onAttachmentsChange={(attachments) => setEditedGoal({ ...editedGoal, attachments })}
            />
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
                {editedGoal.subGoals!.map((subGoal, index) => (
                  <div key={subGoal.id} className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-muted-foreground">하위 목표 {index + 1}</span>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleMoveSubGoalUp(index)}
                          disabled={index === 0}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleMoveSubGoalDown(index)}
                          disabled={index === editedGoal.subGoals!.length - 1}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteSubGoal(subGoal.id)}
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
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

                      <div className="col-span-2">
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs">상태 메모</Label>
                          <Button
                            onClick={() => toggleSubGoalStatusNoteEdit(subGoal.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                          >
                            {editingSubGoalStatusNotes.has(subGoal.id) ? (
                              <>
                                <Save className="w-3 h-3 mr-1" />
                                완료
                              </>
                            ) : (
                              <>
                                <Pencil className="w-3 h-3 mr-1" />
                                편집
                              </>
                            )}
                          </Button>
                        </div>
                        {editingSubGoalStatusNotes.has(subGoal.id) ? (
                          <Input
                            value={subGoal.statusNote || ''}
                            onChange={(e) => handleSubGoalChange(subGoal.id, 'statusNote', e.target.value)}
                            className="mt-1"
                          />
                        ) : (
                          <div className="p-2 min-h-[38px] bg-background rounded-md border text-xs flex items-center">
                            {subGoal.statusNote ? (
                              <LinkifiedText text={subGoal.statusNote} />
                            ) : (
                              <span className="text-muted-foreground">상태 메모가 없습니다</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="col-span-3">
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
                      </div>
                    </div>
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

const NoteCard = ({
  note,
  onTogglePin,
  onDelete,
  onEdit
}: {
  note: Note;
  onTogglePin: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onEdit: (noteId: string, newContent: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);

  const handleSave = () => {
    if (!editContent.trim()) return;
    onEdit(note.id, editContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        'p-3 rounded-lg border-2 transition-all',
        note.isPinned
          ? 'bg-primary/10 border-primary/30'
          : 'bg-muted border-border'
      )}
    >
      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full"
          />
          <div className="flex justify-end gap-1">
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="sm"
              className="h-7"
            >
              <X className="w-4 h-4 mr-1" />
              취소
            </Button>
            <Button
              onClick={handleSave}
              variant="default"
              size="sm"
              className="h-7"
            >
              <Save className="w-4 h-4 mr-1" />
              저장
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm text-foreground flex-1">
              <LinkifiedText text={note.content} />
            </p>
            <div className="flex gap-1">
              <Button
                onClick={() => setIsEditing(true)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title="수정"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onTogglePin(note.id)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                title={note.isPinned ? "고정 해제" : "고정"}
              >
                <Pin className={cn("w-4 h-4", note.isPinned && "fill-primary text-primary")} />
              </Button>
              <Button
                onClick={() => onDelete(note.id)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {note.updatedAt
              ? `수정: ${new Date(note.updatedAt).toLocaleString('ko-KR')}`
              : new Date(note.createdAt).toLocaleString('ko-KR')}
          </p>
        </>
      )}
    </div>
  );
};

const NoteInput = ({ onAddNote }: { onAddNote: (content: string, isPinned: boolean) => void }) => {
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const handleAdd = () => {
    if (!content.trim()) return;
    onAddNote(content, isPinned);
    setContent('');
    setIsPinned(false);
  };

  return (
    <div className="p-3 bg-card border-2 border-border rounded-lg space-y-2">
      <Textarea
        placeholder="메모 내용을 입력하세요..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      <div className="flex items-center gap-2 justify-end">
        <Button
          onClick={() => setIsPinned(!isPinned)}
          variant={isPinned ? "default" : "outline"}
          size="sm"
          className="gap-1"
        >
          <Pin className={cn("w-4 h-4", isPinned && "fill-current")} />
          {isPinned ? '중요' : '일반'}
        </Button>
        <Button onClick={handleAdd} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          추가
        </Button>
      </div>
    </div>
  );
};

const AttachmentSection = ({
  goalId,
  attachments,
  onAttachmentsChange,
}: {
  goalId: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const newAttachment = await api.uploadAttachment(goalId, file);
      onAttachmentsChange([...attachments, newAttachment]);

      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (attachmentId: string) => {
    api.downloadAttachment(attachmentId);
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('이 파일을 삭제하시겠습니까?')) return;

    try {
      await api.deleteAttachment(attachmentId);
      onAttachmentsChange(attachments.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('파일 삭제에 실패했습니다.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor="file-upload"
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-md border-2 border-dashed cursor-pointer transition-colors",
            isUploading
              ? "bg-muted border-muted-foreground/50 cursor-not-allowed"
              : "hover:bg-accent border-border"
          )}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">
            {isUploading ? '업로드 중...' : '파일 선택'}
          </span>
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <span className="text-xs text-muted-foreground">
          최대 10MB
        </span>
      </div>

      {uploadError && (
        <p className="text-sm text-destructive">{uploadError}</p>
      )}

      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.originalName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => handleDownload(attachment.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="다운로드"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(attachment.id)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          첨부된 파일이 없습니다
        </p>
      )}
    </div>
  );
};
