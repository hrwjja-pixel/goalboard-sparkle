import { GoalCategory } from '@/types/goal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Plus, X, ChevronDown, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedOwner: string;
  onOwnerChange: (owner: string) => void;
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  owners: string[];
  categories: GoalCategory[];
  categoryColors: Record<string, string>;
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onCategoryColorChange: (category: string, color: string) => void;
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
  categoryColors,
  onAddCategory,
  onDeleteCategory,
  onCategoryColorChange,
}: FilterBarProps) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [editingColor, setEditingColor] = useState<string | null>(null);

  const handleAddCategoryClick = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setNewCategoryName('');
      setIsAddingCategory(false);
    }
  };


  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="bg-card rounded-lg shadow-md mb-6 border border-border">
      <div className="p-6 pb-4">
        <CollapsibleTrigger className="flex items-center gap-2 w-full hover:opacity-70 transition-opacity">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">필터</h3>
          <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform ml-auto", isOpen && "rotate-180")} />
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="px-6 pb-6">
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
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category);
            const color = categoryColors[category] || '#6b7280';
            
            return (
              <div key={category} className="relative group">
                <div
                  onClick={() => onCategoryToggle(category)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 transition-all cursor-pointer pr-16',
                    isSelected 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'hover:opacity-80'
                  )}
                  style={!isSelected ? {
                    backgroundColor: `${color}10`,
                    borderColor: `${color}40`,
                  } : undefined}
                >
                  <Badge
                    style={{
                      backgroundColor: color,
                      color: '#ffffff',
                    }}
                    className="text-xs font-semibold"
                  >
                    {category}
                  </Badge>
                </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingColor(editingColor === category ? null : category);
                  }}
                  className="p-1 hover:bg-accent/20 rounded"
                  title="색상 변경"
                >
                  <Palette className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category);
                  }}
                  className="p-1 hover:bg-destructive/20 rounded"
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
      </CollapsibleContent>
    </Collapsible>
  );
};
