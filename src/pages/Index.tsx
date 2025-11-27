import { useState, useEffect, useMemo } from 'react';
import { Goal, GoalCategory } from '@/types/goal';
import { initialGoals } from '@/data/initialGoals';
import { OverallSummary } from '@/components/OverallSummary';
import { FilterBar } from '@/components/FilterBar';
import { GoalCard } from '@/components/GoalCard';
import { GoalDetailModal } from '@/components/GoalDetailModal';
import { AddGoalModal } from '@/components/AddGoalModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [categoryIds, setCategoryIds] = useState<Record<string, string>>({});
  const [searchText, setSearchText] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories and goals from API
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load categories
        const categoriesData = await api.getCategories();
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

        // Load goals
        const goalsData = await api.getGoals();
        setGoals(goalsData);
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
  }, []);

  // Get unique owners
  const owners = useMemo(() => {
    const ownerSet = new Set<string>();
    goals.forEach((goal) => {
      ownerSet.add(goal.owner);
      goal.subGoals?.forEach((sg) => ownerSet.add(sg.owner));
    });
    return Array.from(ownerSet).sort();
  }, [goals]);

  // Filter and sort goals
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      // Category filter
      if (!goal.categories || !goal.categories.some(cat => selectedCategories.includes(cat))) {
        return false;
      }

      // Owner filter
      if (selectedOwner !== 'all' && goal.owner !== selectedOwner) {
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
  }, [goals, selectedCategories, selectedOwner, searchText]);

  const handleCategoryToggle = (category: GoalCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleSaveGoal = async (updatedGoal: Goal) => {
    try {
      await api.updateGoal(updatedGoal.id, updatedGoal);
      setGoals((prev) =>
        prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
      );
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('목표 저장에 실패했습니다.');
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await api.deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error('Failed to delete goal:', error);
      alert('목표 삭제에 실패했습니다.');
    }
  };

  const handleAddGoal = async (newGoal: Goal) => {
    try {
      const maxOrder = Math.max(...goals.map((g) => g.order ?? 0), -1);
      const goalWithOrder = { ...newGoal, order: maxOrder + 1 };
      const createdGoal = await api.createGoal(goalWithOrder);
      setGoals((prev) => [...prev, createdGoal]);
    } catch (error) {
      console.error('Failed to add goal:', error);
      alert('목표 추가에 실패했습니다.');
    }
  };

  const handleAddCategory = async (newCategory: string) => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    const trimmedCategory = newCategory.trim();

    try {
      const category = await api.createCategory(trimmedCategory, '#6b7280');
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

  const handleCardClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailModalOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground">데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-6">
        <OverallSummary
          goals={goals}
          filteredGoals={filteredGoals}
          onAddGoal={() => setIsAddModalOpen(true)}
          categoryColors={categoryColors}
        />

        <FilterBar
          searchText={searchText}
          onSearchChange={setSearchText}
          selectedOwner={selectedOwner}
          onOwnerChange={setSelectedOwner}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
          owners={owners}
          categories={categories}
          categoryColors={categoryColors}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onCategoryColorChange={handleCategoryColorChange}
          onCategoryNameChange={handleCategoryNameChange}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredGoals.map((goal) => goal.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
              {filteredGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onClick={() => handleCardClick(goal)} categoryColors={categoryColors} />
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
      </div>

      <GoalDetailModal
        goal={selectedGoal}
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedGoal(null);
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        categories={categories}
      />

      <AddGoalModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddGoal}
        categories={categories}
      />
    </div>
  );
};

export default Index;
