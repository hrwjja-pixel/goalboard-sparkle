import { useProject } from '@/contexts/ProjectContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase } from 'lucide-react';

export const ProjectSelector = () => {
  const { projects, currentProject, setCurrentProject, isLoading } = useProject();

  if (isLoading || !currentProject) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50">
        <Briefcase className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    );
  }

  return (
    <Select
      value={currentProject.id}
      onValueChange={(value) => {
        const project = projects.find(p => p.id === value);
        if (project) {
          setCurrentProject(project);
        }
      }}
    >
      <SelectTrigger className="w-[280px] bg-background/95 backdrop-blur-sm border-border">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4" />
          <SelectValue />
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
  );
};
