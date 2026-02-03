import { useState, useEffect, useMemo } from 'react';
import { Goal, GoalCategory } from '@/types/goal';
import { initialGoals } from '@/data/initialGoals';
import { OverallSummary } from '@/components/OverallSummary';
import { CompactOverallSummary } from '@/components/CompactOverallSummary';
import { GoalCard } from '@/components/GoalCard';
import { CompactGoalCard } from '@/components/CompactGoalCard';
import { ListView } from '@/components/ListView';
import { GoalDetailModal } from '@/components/GoalDetailModal';
import { GoalViewDialog } from '@/components/GoalViewDialog';
import { AddGoalModal } from '@/components/AddGoalModal';
import { SettingsDialog } from '@/components/SettingsDialog';
import { Button } from '@/components/ui/button';
import { Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { api } from '@/lib/api';
import { useUserSettings, ViewMode } from '@/hooks/useUserSettings';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useProject } from '@/contexts/ProjectContext';

const Index = () => {
  const { user, logout } = useAuth();
  const { settings: userSettings, updateSettings: updateUserSettings } = useUserSettings();
  const { currentProject, includeDescendants } = useProject();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});
  const [searchText, setSearchText] = useState('');
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(userSettings.defaultViewMode);
  const [showCompleted, setShowCompleted] = useState(userSettings.showCompletedByDefault);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories and goals from API
  useEffect(() => {
    const loadData = async () => {
      if (!currentProject) {
        console.log('Index: No current project, setting isLoading to false');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Load categories and goals
        const [categoriesData, allGoalsData] = await Promise.all([
          api.getCategories(currentProject.id, includeDescendants),
          api.getGoals(currentProject.id, true, includeDescendants),
        ]);

        const categoryNames = categoriesData.map((c) => c.name);
        const colors: Record<string, string> = {};
        const ids: Record<string, string> = {};

        categoriesData.forEach((c) => {
          colors[c.name] = c.color;
          ids[c.name] = c.id;
        });

        setCategories(categoryNames);
        setSelectedCategories(categoryNames);
        setCategoryColors(colors);
        setCategoryIds(ids);

        // Load all goals (always load all, filtering will be done client-side)
        const completed = allGoalsData.filter(g => g.completed).length;
        setCompletedCount(completed);
        setGoals(allGoalsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to default data
        const defaultCategories = ['SERVICE', 'AI', 'OPERATIONS'];
        setCategories(defaultCategories);
        setSelectedCategories(defaultCategories);
        setCategoryColors({
          'SERVICE': '#3b82f6',
          'AI': '#8b5cf6',
          'OPERATIONS': '#10b981'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentProject, includeDescendants]);

  // Background data refresh - only when safe to update
  useEffect(() => {
    // Skip if auto refresh is disabled
    if (!userSettings.enableAutoRefresh) {
      return;
    }

    // Skip if no current project
    if (!currentProject) {
      return;
    }

    const refreshIntervalMs = userSettings.autoRefreshInterval * 1000;

    const refreshData = async () => {
      // Skip refresh if user is actively editing or viewing
      if (isViewDialogOpen || isDetailModalOpen || isAddModalOpen || isSettingsOpen || isDragging) {
        return;
      }

      // Skip refresh if tab is not visible
      if (document.hidden) {
        return;
      }

      try {
        const allGoalsData = await api.getGoals(currentProject.id, true, includeDescendants);
        setCompletedCount(allGoalsData.filter(g => g.completed).length);
        setGoals(allGoalsData);
        console.log('Background refresh completed');
      } catch (error) {
        console.error('Background refresh failed:', error);
      }
    };

    // Initial delay before first refresh
    const initialTimeout = setTimeout(() => {
      refreshData();
    }, refreshIntervalMs);

    // Set up interval for subsequent refreshes
    const refreshInterval = setInterval(refreshData, refreshIntervalMs);

    // Cleanup both timeout and interval
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(refreshInterval);
    };
  }, [currentProject, includeDescendants, isViewDialogOpen, isDetailModalOpen, isAddModalOpen, isSettingsOpen, isDragging, userSettings.enableAutoRefresh, userSettings.autoRefreshInterval]);

  // Filter and sort goals (for card views - excludes completed if showCompleted is false)
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      // Completed filter (only for card views, not list view)
      if (!showCompleted && goal.completed) {
        return false;
      }

      // Category filter
      if (!goal.categories || !goal.categories.some(cat => selectedCategories.includes(cat))) {
        return false;
      }

      // Owner filter - if any owners selected, goal owner must be in the list
      if (selectedOwners.length > 0 && !selectedOwners.includes(goal.owner)) {
        return false;
      }

      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(searchLower);
        const matchesDesc = goal.description?.toLowerCase().includes(searchLower);
        const matchesOwner = goal.owner.toLowerCase().includes(searchLower);

        return matchesTitle || matchesDesc || matchesOwner;
      }

      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [goals, selectedCategories, selectedOwners, searchText, showCompleted]);

  // Get unique owners from main goals only (filtered by category and search, excluding owner filter)
  const owners = useMemo(() => {
    const ownerSet = new Set<string>();
    goals.forEach((goal) => {
      // Apply same filters as filteredGoals except owner filter
      if (!goal.categories || !goal.categories.some(cat => selectedCategories.includes(cat))) {
        return;
      }

      if (searchText) {
        const searchLower = searchText.toLowerCase();
        const matchesTitle = goal.title.toLowerCase().includes(searchLower);
        const matchesDesc = goal.description?.toLowerCase().includes(searchLower);
        const matchesOwner = goal.owner.toLowerCase().includes(searchLower);

        if (!matchesTitle && !matchesDesc && !matchesOwner) {
          return;
        }
      }

      // Only add main goal owner, not subGoal owners
      ownerSet.add(goal.owner);
    });
    return Array.from(ownerSet).sort();
  }, [goals, selectedCategories, searchText]);

  const handleCategoryToggle = (category: GoalCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleOwnerToggle = (owner: string) => {
    setSelectedOwners((prev) =>
      prev.includes(owner)
        ? prev.filter((o) => o !== owner)
        : [...prev, owner]
    );
  };

  const handleSaveGoal = async (updatedGoal: Goal) => {
    try {
      console.log('Saving goal with version:', updatedGoal.version);
      await api.updateGoal(updatedGoal.id, updatedGoal);

      // Always refresh all goals after save to ensure all users see latest data
      // IMPORTANT: Always fetch ALL goals (true), filtering is done client-side
      if (!currentProject) return;
      const allGoalsData = await api.getGoals(currentProject.id, true, includeDescendants);
      setCompletedCount(allGoalsData.filter(g => g.completed).length);
      setGoals(allGoalsData);

      // Update selectedGoal with latest data for ViewDialog
      const savedGoal = allGoalsData.find(g => g.id === updatedGoal.id);
      if (savedGoal) {
        setSelectedGoal(savedGoal);
      }
    } catch (error: any) {
      console.error('Failed to save goal:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);

      // Handle conflict (409)
      if (error.response?.status === 409) {
        const shouldReload = confirm(
          '다른 사용자가 이 목표를 수정했습니다.\n' +
          '현재 화면을 새로고침하여 최신 데이터를 불러오시겠습니까?\n\n' +
          '"확인"을 누르면 새로고침되며, 작성 중인 내용은 손실됩니다.'
        );

        if (shouldReload) {
          // Close the modal
          setSelectedGoal(null);

          // Reload all goals to get the latest data
          // IMPORTANT: Always fetch ALL goals (true), filtering is done client-side
          if (!currentProject) return;
          const allGoalsData = await api.getGoals(currentProject.id, true, includeDescendants);
          setCompletedCount(allGoalsData.filter(g => g.completed).length);
          setGoals(allGoalsData);
        }

        throw new Error('목표가 다른 사용자에 의해 수정되었습니다.');
      }

      alert('목표 저장에 실패했습니다.');
      throw error;
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      // Close dialogs after delete
      setIsViewDialogOpen(false);
      setSelectedGoal(null);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('목표 삭제에 실패했습니다.');
    }
  };

  const handleToggleComplete = async (goalId: string, completed: boolean) => {
    if (!currentProject) return;

    try {
      await api.toggleGoalCompletion(goalId, completed);

      // Reload all goals and update completed count
      const allGoalsData = await api.getGoals(currentProject.id, true, includeDescendants);
      const completedTotal = allGoalsData.filter(g => g.completed).length;
      setCompletedCount(completedTotal);
      setGoals(allGoalsData);

      // Update selectedGoal if viewing this goal
      if (selectedGoal && selectedGoal.id === goalId) {
        const updatedGoal = allGoalsData.find(g => g.id === goalId);
        if (updatedGoal) {
          setSelectedGoal(updatedGoal);
        }
      }
    } catch (error) {
      console.error('Failed to toggle goal completion:', error);
      alert('목표 완료 상태 변경에 실패했습니다.');
    }
  };

  const handleAddGoal = async (newGoal: Goal) => {
    if (!currentProject) return;

    try {
      const maxOrder = Math.max(...goals.map((g) => g.order ?? 0), -1);
      const goalWithOrder = { ...newGoal, projectId: currentProject.id, order: maxOrder + 1 };
      const createdGoal = await api.createGoal(goalWithOrder);
      setGoals((prev) => [...prev, createdGoal]);
    } catch (error) {
      console.error('Failed to add goal:', error);
      alert('목표 추가에 실패했습니다.');
    }
  };

  const handleAddCategory = async (newCategory: string) => {
    if (!currentProject || !newCategory.trim() || categories.includes(newCategory.trim())) return;
    const trimmedCategory = newCategory.trim();

    try {
      const category = await api.createCategory(trimmedCategory, '#6b7280', currentProject.id);
      setCategories((prev) => [...prev, trimmedCategory]);
      setSelectedCategories((prev) => [...prev, trimmedCategory]);
      setCategoryColors((prev) => ({ ...prev, [trimmedCategory]: '#6b7280' }));
      setCategoryIds((prev) => ({ ...prev, [trimmedCategory]: category.id }));
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('카테고리 추가에 실패했습니다.');
    }
  };

  const handleCategoryColorChange = async (category: string, color: string) => {
    try {
      const categoryId = categoryIds[category];
      if (categoryId) {
        await api.updateCategoryColor(categoryId, color);
        setCategoryColors((prev) => ({ ...prev, [category]: color }));
      }
    } catch (error) {
      console.error('Failed to update category color:', error);
      alert('카테고리 색상 변경에 실패했습니다.');
    }
  };

  const handleCategoryNameChange = async (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;

    try {
      const categoryId = categoryIds[oldName];
      if (categoryId) {
        await api.updateCategoryName(categoryId, newName);

        // Update categories list
        setCategories((prev) => prev.map((c) => c === oldName ? newName : c));

        // Update selected categories
        setSelectedCategories((prev) => prev.map((c) => c === oldName ? newName : c));

        // Update category colors map
        const oldColor = categoryColors[oldName];
        setCategoryColors((prev) => {
          const updated = { ...prev };
          delete updated[oldName];
          updated[newName] = oldColor;
          return updated;
        });

        // Update category IDs map
        setCategoryIds((prev) => {
          const updated = { ...prev };
          delete updated[oldName];
          updated[newName] = categoryId;
          return updated;
        });

        // Update goals that use this category
        setGoals((prev) => prev.map((g) =>
          g.categories && g.categories.includes(oldName)
            ? { ...g, categories: g.categories.map(c => c === oldName ? newName : c) }
            : g
        ));
      }
    } catch (error) {
      console.error('Failed to update category name:', error);
      alert('카테고리 이름 변경에 실패했습니다.');
    }
  };

  const handleDeleteCategory = async (categoryToDelete: string) => {
    // Don't allow deletion if goals exist with this category
    const hasGoalsWithCategory = goals.some((g) => g.categories && g.categories.includes(categoryToDelete));
    if (hasGoalsWithCategory) {
      alert('이 카테고리를 사용하는 목표가 있어 삭제할 수 없습니다.');
      return;
    }

    try {
      const categoryId = categoryIds[categoryToDelete];
      if (categoryId) {
        await api.deleteCategory(categoryId);
        setCategories((prev) => prev.filter((c) => c !== categoryToDelete));
        setSelectedCategories((prev) => prev.filter((c) => c !== categoryToDelete));
      }
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('카테고리 삭제에 실패했습니다.');
    }
  };


  const handleCardClick = async (goal: Goal) => {
    // Clear previous selection first
    setSelectedGoal(null);
    setIsViewDialogOpen(true);

    try {
      // Fetch latest data from server
      console.log('Fetching latest goal data for:', goal.id);
      const latestGoal = await api.getGoal(goal.id);
      console.log('Received latest goal:', latestGoal);

      // Update the goal in the list as well
      setGoals((prev) =>
        prev.map((g) => (g.id === latestGoal.id ? latestGoal : g))
      );

      setSelectedGoal(latestGoal);
    } catch (error) {
      console.error('Failed to fetch goal details:', error);
      // Fallback to cached data
      setSelectedGoal(goal);
    }
  };

  const handleEditFromView = () => {
    // Close view dialog and open edit modal
    setIsViewDialogOpen(false);
    setIsDetailModalOpen(true);
  };

  const handleCloseView = () => {
    setIsViewDialogOpen(false);
    setSelectedGoal(null);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGoals((allGoals) => {
        // Find indices in the full goals array (not filtered)
        const oldIndex = allGoals.findIndex((item) => item.id === active.id);
        const newIndex = allGoals.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return allGoals;

        // Reorder the full array
        const reordered = arrayMove(allGoals, oldIndex, newIndex);

        // Update order property for all goals to match their new positions
        const updatedGoals = reordered.map((goal, index) => ({ ...goal, order: index }));

        // Save new order to API (only send goals that changed order)
        api.reorderGoals(
          updatedGoals.map((g) => ({ id: g.id, order: g.order ?? 0 }))
        ).catch((error) => {
          console.error('Failed to save order:', error);
          alert('순서 저장에 실패했습니다.');
        });

        return updatedGoals;
      });
    }
  };

  const { projects, isLoading: projectsLoading, createProject } = useProject();

  if (isLoading || projectsLoading) {
    return (
      <ThemeProvider theme={userSettings.theme} onThemeChange={(theme) => updateUserSettings({ theme })}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl text-muted-foreground">데이터 로딩 중...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  // If no projects exist, show a welcome screen
  if (!currentProject && projects.length === 0) {
    return (
      <ThemeProvider theme={userSettings.theme} onThemeChange={(theme) => updateUserSettings({ theme })}>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold mb-4">프로젝트가 없습니다</h1>
            <p className="text-muted-foreground mb-6">
              시작하려면 첫 번째 프로젝트를 생성하세요.
            </p>
            <Button
              onClick={async () => {
                const name = prompt('프로젝트 이름을 입력하세요:', 'My First Project');
                if (name) {
                  try {
                    await createProject({ name, description: '' });
                  } catch (error) {
                    console.error('Failed to create project:', error);
                    alert('프로젝트 생성에 실패했습니다.');
                  }
                }
              }}
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              첫 프로젝트 만들기
            </Button>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={userSettings.theme} onThemeChange={(theme) => updateUserSettings({ theme })}>
      <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-6">
        {viewMode === 'normal' || viewMode === 'list' ? (
          <OverallSummary
            goals={goals}
            filteredGoals={filteredGoals}
            onAddGoal={() => setIsAddModalOpen(true)}
            categoryColors={categoryColors}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            searchText={searchText}
            onSearchChange={setSearchText}
            selectedOwners={selectedOwners}
            onOwnerToggle={handleOwnerToggle}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            owners={owners}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onCategoryColorChange={handleCategoryColorChange}
            onCategoryNameChange={handleCategoryNameChange}
            showCompleted={showCompleted}
            onShowCompletedToggle={() => setShowCompleted(!showCompleted)}
            completedCount={completedCount}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
        ) : (
          <CompactOverallSummary
            goals={goals}
            onAddGoal={() => setIsAddModalOpen(true)}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            categoryColors={categoryColors}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
            showCompleted={showCompleted}
            onShowCompletedToggle={() => setShowCompleted(!showCompleted)}
            completedCount={completedCount}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
        )}

        {viewMode === 'list' ? (
          <ListView
            goals={filteredGoals}
            categoryColors={categoryColors}
            onGoalClick={handleCardClick}
            onToggleComplete={handleToggleComplete}
            showCompleted={showCompleted}
          />
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredGoals.map((goal) => goal.id)}
                strategy={rectSortingStrategy}
              >
                <div className={viewMode === 'compact'
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-auto"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto"
                }>
                  {filteredGoals.map((goal) => (
                    viewMode === 'compact' ? (
                      <CompactGoalCard
                        key={goal.id}
                        goal={goal}
                        onClick={() => handleCardClick(goal)}
                        categoryColors={categoryColors}
                        onToggleComplete={handleToggleComplete}
                      />
                    ) : (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onClick={() => handleCardClick(goal)}
                        categoryColors={categoryColors}
                        onToggleComplete={handleToggleComplete}
                      />
                    )
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {filteredGoals.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground">
                  필터 조건에 맞는 목표가 없습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <GoalViewDialog
        goal={selectedGoal}
        open={isViewDialogOpen}
        onClose={handleCloseView}
        onEdit={handleEditFromView}
        onToggleComplete={handleToggleComplete}
        categories={categories}
        categoryColors={categoryColors}
      />

      <GoalDetailModal
        goal={selectedGoal}
        open={isDetailModalOpen}
        onClose={async () => {
          setIsDetailModalOpen(false);
          // Re-open view dialog with updated data after edit
          if (selectedGoal) {
            try {
              // Fetch latest data from server
              const latestGoal = await api.getGoal(selectedGoal.id);
              setSelectedGoal(latestGoal);
              // Update in goals list as well
              setGoals((prev) =>
                prev.map((g) => (g.id === latestGoal.id ? latestGoal : g))
              );
            } catch (error) {
              console.error('Failed to refresh goal:', error);
            }
            setIsViewDialogOpen(true);
          }
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        categories={categories}
        categoryColors={categoryColors}
      />

      <AddGoalModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGoal}
        categories={categories}
        categoryColors={categoryColors}
      />

      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveUser={updateUserSettings}
        userSettings={userSettings}
      />

      {/* Copyright */}
      <div className="fixed bottom-4 right-4 text-xs text-muted-foreground opacity-40 pointer-events-none select-none">
        Copyright © L.Y.M & J.J.A. All rights reserved.
      </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
