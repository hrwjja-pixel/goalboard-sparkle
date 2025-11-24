import { GoalCategory } from '@/types/goal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedOwner: string;
  onOwnerChange: (owner: string) => void;
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  owners: string[];
  categories: GoalCategory[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export const FilterBar = ({
  searchText,
  onSearchChange,
  selectedOwner,
  onOwnerChange,
  selectedCategories,
  onCategoryToggle,
  owners,
  categories,
  onAddCategory,
  onDeleteCategory,
}: FilterBarProps) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategoryClick = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };

  const categoryColors = [
    'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
    'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20',
    'bg-teal-500/10 text-teal-500 hover:bg-teal-500/20',
  ];

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <h3 className="font-semibold text-lg">필터</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="목표 검색..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={selectedOwner} onValueChange={onOwnerChange}>
          <SelectTrigger>
            <SelectValue placeholder="담당자 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 담당자</SelectItem>
            {owners.map((owner) => (
              <SelectItem key={owner} value={owner}>
                {owner}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2">
          {categories.map((category, index) => (
            <div key={category} className="relative group">
              <Button
                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryToggle(category)}
                className={cn(
                  'transition-all pr-8',
                  !selectedCategories.includes(category) && getCategoryColor(index)
                )}
              >
                {category}
              </Button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(category);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-destructive/20 rounded"
              >
                <X className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ))}
          
          {isAddingCategory ? (
            <div className="flex gap-1 items-center">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="카테고리명"
                className="h-9 w-32"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategoryClick();
                  if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }
                }}
                autoFocus
              />
              <Button onClick={handleAddCategoryClick} size="sm" variant="default">
                추가
              </Button>
              <Button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                size="sm"
                variant="ghost"
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingCategory(true)}
              size="sm"
              variant="outline"
              className="border-dashed"
            >
              <Plus className="w-4 h-4 mr-1" />
              카테고리 추가
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
