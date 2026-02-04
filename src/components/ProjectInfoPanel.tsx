import { useState, useEffect } from 'react';
import { Project } from '@/types/goal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Folder, Trash2, Save, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProjectInfoPanelProps {
  project: Project | null;
  parentProject: Project | null;
  onUpdate: (id: string, data: { name?: string; description?: string }) => Promise<void>;
  onDelete: (id: string, adminPassword: string) => Promise<void>;
  onRemoveParent: (id: string) => Promise<void>;
  canDelete: boolean;
}

export function ProjectInfoPanel({
  project,
  parentProject,
  onUpdate,
  onDelete,
  onRemoveParent,
  canDelete,
}: ProjectInfoPanelProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // 프로젝트 변경 시 폼 초기화
  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setIsDirty(false);
    } else {
      setName('');
      setDescription('');
      setIsDirty(false);
    }
  }, [project?.id]);

  // 변경 감지
  useEffect(() => {
    if (!project) return;
    const hasChanges =
      name !== project.name ||
      description !== (project.description || '');
    setIsDirty(hasChanges);
  }, [name, description, project]);

  const handleSave = async () => {
    if (!project || !isDirty) return;

    if (!name.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('프로젝트 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setAdminPassword('');
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!project) return;

    if (!adminPassword) {
      alert('관리자 비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(project.id, adminPassword);
      setDeleteConfirmOpen(false);
      setAdminPassword('');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      if (error.message === 'Invalid admin password') {
        alert('관리자 비밀번호가 올바르지 않습니다.');
      } else if (error.message?.includes('child project')) {
        alert('하위 프로젝트가 있어 삭제할 수 없습니다. 먼저 하위 프로젝트를 삭제하거나 이동해주세요.');
      } else {
        alert('프로젝트 삭제에 실패했습니다.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>프로젝트를 선택하세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-2 pb-2 border-b">
          <Folder className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">프로젝트 정보</h3>
        </div>

        {/* 이름 */}
        <div className="space-y-2">
          <Label htmlFor="projectName">프로젝트 이름 *</Label>
          <Input
            id="projectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프로젝트 이름"
          />
        </div>

        {/* 설명 */}
        <div className="space-y-2">
          <Label htmlFor="projectDescription">설명</Label>
          <Textarea
            id="projectDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트 설명 (선택사항)"
            rows={3}
          />
        </div>

        {/* 부모 프로젝트 정보 */}
        <div className="space-y-2">
          <Label>부모 프로젝트</Label>
          <div className="flex items-center gap-2">
            <div className="flex-1 text-sm px-3 py-2 bg-muted rounded-md">
              {parentProject ? (
                <span className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-amber-500" />
                  {parentProject.name}
                </span>
              ) : (
                <span className="text-muted-foreground">없음 (최상위)</span>
              )}
            </div>
            {parentProject && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (project) {
                    try {
                      await onRemoveParent(project.id);
                    } catch (error) {
                      console.error('Failed to remove parent:', error);
                      alert('부모 제거에 실패했습니다.');
                    }
                  }
                }}
              >
                부모 제거
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            트리에서 드래그 앤 드롭으로도 위치를 변경할 수 있습니다.
          </p>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div className="flex justify-between pt-4 border-t mt-4">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDeleteClick}
          disabled={!canDelete || isSaving}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          삭제
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty || isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          저장
        </Button>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div>
                  "{project.name}" 프로젝트를 삭제하시겠습니까?
                  <br />
                  <br />
                  <strong className="text-destructive">
                    이 프로젝트의 모든 목표, 카테고리, 데이터가 영구적으로 삭제됩니다.
                  </strong>
                  <br />
                  이 작업은 취소할 수 없습니다.
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="adminPassword" className="text-foreground">
                    관리자 비밀번호
                  </Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="관리자 비밀번호를 입력하세요"
                    disabled={isDeleting}
                    autoFocus
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
