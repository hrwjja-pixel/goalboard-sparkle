import { useProject } from '@/contexts/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectManageDialog } from '@/components/ProjectManageDialog';
import { useState } from 'react';

export const ProjectSelector = () => {
  const { projects, currentProject, setCurrentProject, isLoading, createProject, updateProject, deleteProject } = useProject();
  const [manageDialogOpen, setManageDialogOpen] = useState(false);

  if (isLoading || !currentProject) {
    return (
      <div className="text-lg">
        <span className="font-bold text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Select
          value={currentProject.id}
          onValueChange={(value) => {
            const project = projects.find(p => p.id === value);
            if (project) {
              setCurrentProject(project);
            }
          }}
        >
          <SelectTrigger className="border-none shadow-none hover:bg-muted/50 transition-colors p-0 h-auto gap-2 w-auto [&>svg]:hidden">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{currentProject.name}</h2>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
              {currentProject.description && (
                <p className="text-sm text-muted-foreground">
                  {currentProject.description}
                </p>
              )}
            </div>
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex flex-col">
                  <span className="font-semibold">{project.name}</span>
                  {project.description && (
                    <span className="text-xs text-muted-foreground">{project.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setManageDialogOpen(true)}
          className="h-8 w-8 p-0"
          title="프로젝트 관리"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ProjectManageDialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        projects={projects}
        currentProject={currentProject}
        onCreateProject={createProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
        onSelectProject={setCurrentProject}
      />
    </>
  );
};
