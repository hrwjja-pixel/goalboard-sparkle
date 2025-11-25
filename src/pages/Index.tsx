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

const STORAGE_KEY = 'team-goals';
const CATEGORIES_STORAGE_KEY = 'team-categories';
const CATEGORY_COLORS_STORAGE_KEY = 'team-category-colors';

const Index = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<GoalCategory[]>([]);
  const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
  const [searchText, setSearchText] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedCategories, setSelectedCategories] = useState<GoalCategory[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load categories and goals from localStorage
  useEffect(() => {
    const storedCategories = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const defaultCategories = ['SERVICE', 'AI', 'OPERATIONS'];
    const defaultColors = {
      'SERVICE': '#3b82f6',
      'AI': '#8b5cf6', 
      'OPERATIONS': '#10b981'
    };
    
    if (storedCategories) {
      try {
        const parsedCategories = JSON.parse(storedCategories);
        setCategories(parsedCategories);
        setSelectedCategories(parsedCategories);
      } catch {
        setCategories(defaultCategories);
        setSelectedCategories(defaultCategories);
      }
    } else {
      setCategories(defaultCategories);
      setSelectedCategories(defaultCategories);
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(defaultCategories));
    }

    const storedColors = localStorage.getItem(CATEGORY_COLORS_STORAGE_KEY);
    if (storedColors) {
      try {
        setCategoryColors(JSON.parse(storedColors));
      } catch {
        setCategoryColors(defaultColors);
        localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, JSON.stringify(defaultColors));
      }
    } else {
      setCategoryColors(defaultColors);
      localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, JSON.stringify(defaultColors));
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setGoals(JSON.parse(stored));
      } catch {
        setGoals(initialGoals);
      }
    } else {
      setGoals(initialGoals);
    }
  }, []);

  // Save goals and categories to localStorage
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    }
  }, [goals]);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    }
  }, [categories]);

  useEffect(() => {
    if (Object.keys(categoryColors).length > 0) {
      localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, JSON.stringify(categoryColors));
    }
  }, [categoryColors]);

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
      if (!selectedCategories.includes(goal.category)) {
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

  const handleSaveGoal = (updatedGoal: Goal) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === updatedGoal.id ? updatedGoal : g))
    );
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== goalId));
  };

  const handleAddGoal = (newGoal: Goal) => {
    setGoals((prev) => {
      const maxOrder = Math.max(...prev.map((g) => g.order ?? 0), -1);
      return [...prev, { ...newGoal, order: maxOrder + 1 }];
    });
  };

  const handleAddCategory = (newCategory: string) => {
    if (!newCategory.trim() || categories.includes(newCategory.trim())) return;
    const trimmedCategory = newCategory.trim();
    setCategories((prev) => [...prev, trimmedCategory]);
    setSelectedCategories((prev) => [...prev, trimmedCategory]);
    // Set default color for new category
    setCategoryColors((prev) => ({ ...prev, [trimmedCategory]: '#6b7280' }));
  };

  const handleCategoryColorChange = (category: string, color: string) => {
    setCategoryColors((prev) => ({ ...prev, [category]: color }));
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    // Don't allow deletion if goals exist with this category
    const hasGoalsWithCategory = goals.some((g) => g.category === categoryToDelete);
    if (hasGoalsWithCategory) {
      alert('이 카테고리를 사용하는 목표가 있어 삭제할 수 없습니다.');
      return;
    }
    setCategories((prev) => prev.filter((c) => c !== categoryToDelete));
    setSelectedCategories((prev) => prev.filter((c) => c !== categoryToDelete));
  };

  const handleCardClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailModalOpen(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setGoals((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const reordered = arrayMove(items, oldIndex, newIndex);
        // Update order property for all goals
        return reordered.map((goal, index) => ({ ...goal, order: index }));
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-6">
        <OverallSummary 
          goals={goals} 
          filteredGoals={filteredGoals}
          onAddGoal={() => setIsAddModalOpen(true)}
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
