import { GoalCategory } from '@/types/goal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Plus, X, Palette, Edit2, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedOwners: string[];
  onOwnerToggle: (owner: string) => void;
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  owners: string[];
  categories: GoalCategory[];
  categoryColors: Record<string, string>;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onCategoryColorChange: (category: string, color: string) => void;
  onCategoryNameChange?: (oldName: string, newName: string) => void;
}

export const FilterBar = ({
  searchText,
  onSearchChange,
  selectedOwners,
  onOwnerToggle,
  selectedCategories,
  onCategoryToggle,
  owners,
  categories,
  categoryColors,
  onAddCategory,
  onDeleteCategory,
  onCategoryColorChange,
  onCategoryNameChange,
}: FilterBarProps) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingColor, setEditingColor] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');

  const handleAddCategoryClick = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };


  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">필터</h3>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="목표 검색..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-40 h-9 justify-between font-normal bg-background hover:bg-accent hover:text-accent-foreground"
            >
              <span className="text-sm truncate">
                {selectedOwners.length === 0
                  ? "담당자 선택"
                  : `${selectedOwners.length}명 선택`}
              </span>
              <ChevronDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3">
            {owners.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                담당자가 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-2 pb-2 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => owners.forEach(owner => {
                      if (!selectedOwners.includes(owner)) {
                        onOwnerToggle(owner);
                      }
                    })}
                  >
                    전체 선택
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => {
                      selectedOwners.forEach(owner => onOwnerToggle(owner));
                    }}
                  >
                    전체 해제
                  </Button>
                </div>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {owners.map((owner) => (
                    <div
                      key={owner}
                      className="flex items-center space-x-3 px-2 py-1.5 rounded-md hover:bg-accent/20 cursor-pointer transition-colors"
                      onClick={() => onOwnerToggle(owner)}
                    >
                      <Checkbox
                        id={`owner-${owner}`}
                        checked={selectedOwners.includes(owner)}
                        onCheckedChange={() => onOwnerToggle(owner)}
                        className="!rounded-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor={`owner-${owner}`}
                        className="text-sm leading-none cursor-pointer flex-1 select-none"
                      >
                        {owner}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <div className="flex flex-wrap gap-2 flex-1">
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            const color = categoryColors[category] || '#6b7280';
            const isEditingThisName = editingName === category;

            return (
              <div key={category} className="relative group">
                <div
                  onClick={() => !isEditingThisName && onCategoryToggle(category)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-all pr-16',
                    !isEditingThisName && 'cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 border-primary/30'
                      : 'hover:opacity-80'
                  )}
                  style={!isSelected ? {
                    backgroundColor: `${color}10`,
                    borderColor: `${color}40`,
                  } : undefined}
                >
                  {isEditingThisName ? (
                    <Input
                      value={tempCategoryName}
                      onChange={(e) => setTempCategoryName(e.target.value)}
                      className="h-5 px-2 text-[10px] font-semibold w-20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tempCategoryName.trim()) {
                          onCategoryNameChange?.(category, tempCategoryName.trim());
                          setEditingName(null);
                          setTempCategoryName('');
                        }
                        if (e.key === 'Escape') {
                          setEditingName(null);
                          setTempCategoryName('');
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <Badge
                      style={{
                        backgroundColor: color,
                        color: '#ffffff',
                      }}
                      className="text-[10px] font-semibold py-0 px-1.5"
                    >
                      {category}
                    </Badge>
                  )}
                </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempCategoryName(category);
                    setEditingName(category);
                    setEditingColor(null);
                  }}
                  className="p-0.5 hover:bg-accent/20 rounded"
                  title="이름 변경"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingColor(editingColor === category ? null : category);
                    setEditingName(null);
                  }}
                  className="p-0.5 hover:bg-accent/20 rounded"
                  title="색상 변경"
                >
                  <Palette className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category);
                  }}
                  className="p-0.5 hover:bg-destructive/20 rounded"
                  title="카테고리 삭제"
                >
                  <X className="w-3 h-3 text-destructive" />
                </button>
              </div>

              {editingColor === category && (
                <div
                  className="absolute top-full mt-1 left-0 z-50 p-3 bg-card border border-border rounded-lg shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="color"
                      value={categoryColors[category] || '#6b7280'}
                      onChange={(e) => {
                        onCategoryColorChange(category, e.target.value);
                      }}
                      className="w-12 h-8 rounded cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground">색상 선택</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setEditingColor(null)}
                    className="w-full"
                  >
                    완료
                  </Button>
                </div>
              )}
            </div>
          );
          })}

          {isAddingCategory ? (
            <div className="flex gap-1 items-center">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="카테고리명"
                className="h-7 w-24 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategoryClick();
                  if (e.key === 'Escape') {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }
                }}
                autoFocus
              />
              <Button onClick={handleAddCategoryClick} size="sm" variant="default" className="h-7 px-2 text-xs">
                추가
              </Button>
              <Button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                }}
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs"
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setIsAddingCategory(true)}
              size="sm"
              variant="outline"
              className="border-dashed h-7 px-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              카테고리 추가
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
