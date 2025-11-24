import { GoalCategory } from '@/types/goal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  selectedOwner: string;
  onOwnerChange: (owner: string) => void;
  selectedCategories: GoalCategory[];
  onCategoryToggle: (category: GoalCategory) => void;
  owners: string[];
}

export const FilterBar = ({
  searchText,
  onSearchChange,
  selectedOwner,
  onOwnerChange,
  selectedCategories,
  onCategoryToggle,
  owners,
}: FilterBarProps) => {
  const categories: { value: GoalCategory; label: string; color: string }[] = [
    { value: 'SERVICE', label: 'SERVICE', color: 'badge-service' },
    { value: 'AI', label: 'AI', color: 'badge-ai' },
    { value: 'OPERATIONS', label: 'OPERATIONS', color: 'badge-operations' },
  ];

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
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategories.includes(category.value) ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryToggle(category.value)}
              className={cn(
                'transition-all',
                selectedCategories.includes(category.value) && category.color
              )}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
