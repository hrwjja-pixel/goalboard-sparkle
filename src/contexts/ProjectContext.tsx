import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '@/types/goal';
import { api } from '@/lib/api';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  refreshProjects: () => Promise<void>;
  isLoading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    try {
      const fetchedProjects = await api.getProjects();
      setProjects(fetchedProjects);

      // If no current project is set, or current project no longer exists, set to first project
      const storedProjectId = localStorage.getItem('currentProjectId');
      const storedProject = fetchedProjects.find(p => p.id === storedProjectId);

      if (storedProject) {
        setCurrentProjectState(storedProject);
      } else if (fetchedProjects.length > 0) {
        setCurrentProjectState(fetchedProjects[0]);
        localStorage.setItem('currentProjectId', fetchedProjects[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    localStorage.setItem('currentProjectId', project.id);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        setCurrentProject,
        refreshProjects,
        isLoading,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
