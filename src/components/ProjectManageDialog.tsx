import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { Project } from '@/types/goal';
import { Pencil, Trash2, Plus } from 'lucide-react';
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
import { ProjectTreeSelect } from '@/components/ProjectTreeSelect';
import { getProjectAndDescendantIds } from '@/lib/projectTree';

interface ProjectManageDialogProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  projectTree: Project[];
  currentProject: Project | null;
  onCreateProject: (project: { name: string; description?: string; parentId?: string | null }) => Promise<void>;
  onUpdateProject: (id: string, project: { name?: string; description?: string; parentId?: string | null }) => Promise<void>;
  onDeleteProject: (id: string, adminPassword: string) => Promise<void>;
  onSelectProject: (project: Project) => void;
}

export const ProjectManageDialog = ({
  open,
  onClose,
  projects,
  projectTree,
  currentProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
  onSelectProject,
}: ProjectManageDialogProps) => {
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMode('list');
      setEditingProject(null);
      setName('');
      setDescription('');
      setParentId(null);
    }
  }, [open]);

  const handleCreate = () => {
    setMode('create');
    setName('');
    setDescription('');
    setParentId(null);
  };

  const handleEdit = (project: Project) => {
    setMode('edit');
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || '');
    setParentId(project.parentId || null);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setAdminPassword('');
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    if (!adminPassword) {
      alert('관리자 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onDeleteProject(projectToDelete.id, adminPassword);
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      setAdminPassword('');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      if (error.message === 'Invalid admin password') {
        alert('관리자 비밀번호가 올바르지 않습니다.');
      } else {
        alert('프로젝트 삭제에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('프로젝트 이름을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === 'create') {
        await onCreateProject({
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId,
        });
      } else if (mode === 'edit' && editingProject) {
        await onUpdateProject(editingProject.id, {
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId,
        });
      }
      setMode('list');
      setName('');
      setDescription('');
      setParentId(null);
    } catch (error: any) {
      console.error('Failed to save project:', error);
      if (error.message && error.message.includes('circular reference')) {
        alert('순환 참조가 발생합니다. 다른 부모 프로젝트를 선택해주세요.');
      } else {
        alert('프로젝트 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setName('');
    setDescription('');
    setParentId(null);
    setEditingProject(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {mode === 'list' && '프로젝트 관리'}
              {mode === 'create' && '새 프로젝트 추가'}
              {mode === 'edit' && '프로젝트 편집'}
            </DialogTitle>
          </DialogHeader>

          {mode === 'list' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  총 {projects.length}개의 프로젝트
                </p>
                <Button onClick={handleCreate} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  새 프로젝트
                </Button>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors ${
                      currentProject?.id === project.id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        onSelectProject(project);
                        onClose();
                      }}
                    >
                      <h4 className="font-semibold">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(project)}
                        disabled={projects.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={onClose}>
                  닫기
                </Button>
              </div>
            </div>
          )}

          {(mode === 'create' || mode === 'edit') && (() => {
            // Calculate exclude IDs when editing (current project + all descendants)
            let excludeIds: string[] = [];
            if (mode === 'edit' && editingProject) {
              const projectInTree = projects.find(p => p.id === editingProject.id);
              if (projectInTree) {
                excludeIds = getProjectAndDescendantIds(projectInTree);
              }
            }

            return (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="projectName">프로젝트 이름 *</Label>
                  <Input
                    id="projectName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: WEHAGO H 목표 대시보드"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    대시보드 타이틀로 사용됩니다
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="projectDescription">설명</Label>
                  <Textarea
                    id="projectDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="예: EMR개발본부 > WEHAGO H 개발센터"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    타이틀 아래 표시되는 설명입니다
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="parentProject">부모 프로젝트</Label>
                  <ProjectTreeSelect
                    projects={projectTree}
                    value={parentId}
                    onChange={setParentId}
                    excludeIds={excludeIds}
                    placeholder="부모 프로젝트 선택 (선택사항)"
                  />
                  <p className="text-xs text-muted-foreground">
                    계층 구조를 만들려면 부모 프로젝트를 선택하세요
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={isSubmitting}>
                    {isSubmitting ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>프로젝트 삭제</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <div>
                  "{projectToDelete?.name}" 프로젝트를 삭제하시겠습니까?
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
                    disabled={isSubmitting}
                    autoFocus
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
