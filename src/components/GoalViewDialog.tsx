import { useState, useEffect } from 'react';
import { Goal, SubGoal, GoalCategory, Note, Attachment } from '@/types/goal';
import { ActivityLog, formatRelativeTime, formatActivitySummary } from '@/types/activity';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Pencil,
  Check,
  User,
  Calendar,
  ChevronRight,
  ChevronDown,
  Pin,
  FileText,
  Download,
  Paperclip,
  StickyNote,
  Target,
  History,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinkifiedText } from '@/components/LinkifiedText';
import { ChangeDetails } from '@/components/ChangeDetails';
import { api } from '@/lib/api';

interface GoalViewDialogProps {
  goal: Goal | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleComplete: (id: string, completed: boolean) => void;
  categories: GoalCategory[];
  categoryColors: Record<string, string>;
}

export const GoalViewDialog = ({
  goal,
  open,
  onClose,
  onEdit,
  onToggleComplete,
  categories,
  categoryColors,
}: GoalViewDialogProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Load activities when dialog opens or goal changes (including after edit)
  useEffect(() => {
    if (open && goal?.id) {
      setIsLoadingActivities(true);
      api.getGoalActivity(goal.id, 10)
        .then(setActivities)
        .catch(console.error)
        .finally(() => setIsLoadingActivities(false));
    }
  }, [open, goal?.id, goal?.version]);

  if (!goal) return null;

  const sizeLabels: Record<string, string> = {
    xs: '최저',
    small: '낮음',
    medium: '중간',
    large: '높음',
    xl: '최고',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
    });
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (attachmentId: string) => {
    api.downloadAttachment(attachmentId);
  };

  const hasSubGoals = goal.subGoals && goal.subGoals.length > 0;
  const hasNotes = goal.notes && goal.notes.length > 0;
  const hasAttachments = goal.attachments && goal.attachments.length > 0;

  // Sort notes: pinned first, then by date
  const sortedNotes = goal.notes
    ? [...goal.notes].sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
    : [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col h-full"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b bg-background sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="sr-only">목표 상세 보기</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Button
                variant={goal.completed ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => onToggleComplete(goal.id, !goal.completed)}
                className={cn(
                  goal.completed && 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                )}
              >
                <Check className="h-4 w-4 mr-1" />
                {goal.completed ? '완료됨' : '완료'}
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Pencil className="h-4 w-4 mr-1" />
                편집
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Title & Meta Section */}
          <div className="space-y-3">
            {/* Categories & Priority */}
            <div className="flex flex-wrap gap-2">
              {goal.categories?.map((category) => (
                <Badge
                  key={category}
                  style={{
                    backgroundColor: categoryColors[category] || '#6b7280',
                    color: '#ffffff',
                  }}
                >
                  {category}
                </Badge>
              ))}
              <Badge variant="outline" className="text-muted-foreground">
                중요도: {sizeLabels[goal.size] || goal.size}
              </Badge>
            </div>

            {/* Title */}
            <h2 className={cn(
              "text-2xl font-bold",
              goal.completed && "text-muted-foreground line-through"
            )}>
              {goal.title}
            </h2>

            {/* Owner & Date */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{goal.owner}</span>
              </div>
              {(goal.startDate || goal.dueDate) && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(goal.startDate)}
                    {goal.startDate && goal.dueDate && ' ~ '}
                    {formatDate(goal.dueDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">진행률</span>
              <span className="text-lg font-bold text-primary">{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
            {goal.statusNote && (
              <div className="mt-3 p-3 bg-background rounded-md border text-sm italic text-muted-foreground">
                "<LinkifiedText text={goal.statusNote} />"
              </div>
            )}
          </div>

          {/* Description Section */}
          {goal.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                설명
              </h3>
              <div className="text-sm leading-relaxed">
                <LinkifiedText text={goal.description} />
              </div>
            </div>
          )}

          {/* SubGoals Section */}
          {hasSubGoals && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Target className="h-4 w-4" />
                하위 목표 ({goal.subGoals!.length})
              </h3>
              <div className="space-y-2">
                {goal.subGoals!.map((subGoal, index) => (
                  <SubGoalCard key={subGoal.id} subGoal={subGoal} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Notes Section */}
          {hasNotes && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                메모 ({goal.notes!.length})
              </h3>
              <div className="space-y-2">
                {sortedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} formatFullDate={formatFullDate} />
                ))}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {hasAttachments && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                첨부파일 ({goal.attachments!.length})
              </h3>
              <div className="space-y-2">
                {goal.attachments!.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownload(attachment.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 flex-shrink-0"
                      title="다운로드"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity History Section - Collapsible */}
          {activities.length > 0 && (
            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <History className="h-4 w-4" />
                    변경 이력 ({activities.length}건)
                  </h3>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 space-y-2">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      {activity.user?.picture ? (
                        <img
                          src={activity.user.picture}
                          alt={activity.displayName}
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <Globe className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        {formatActivitySummary(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.displayName} · {formatRelativeTime(activity.createdAt)}
                      </p>
                      {/* 변경 상세 내용 표시 */}
                      <ChangeDetails changes={activity.changes} />
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 py-4 border-t bg-background">
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-1" />
              편집
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// SubGoal Card Component
const SubGoalCard = ({ subGoal, index }: { subGoal: SubGoal; index: number }) => {
  return (
    <div className="p-3 bg-muted/50 rounded-lg border space-y-2">
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{subGoal.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {subGoal.owner}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={subGoal.progress} className="h-1.5 flex-1" />
        <span className="text-xs font-medium text-muted-foreground w-8 text-right">
          {subGoal.progress}%
        </span>
      </div>
      {subGoal.statusNote && (
        <p className="text-xs text-muted-foreground italic pl-7">
          "<LinkifiedText text={subGoal.statusNote} />"
        </p>
      )}
    </div>
  );
};

// Note Card Component
const NoteCard = ({
  note,
  formatFullDate,
}: {
  note: Note;
  formatFullDate: (date: string) => string;
}) => {
  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        note.isPinned
          ? 'bg-primary/5 border-primary/20'
          : 'bg-muted/50 border-border'
      )}
    >
      <div className="flex items-start gap-2">
        {note.isPinned && (
          <Pin className="h-3.5 w-3.5 text-primary fill-primary flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm">
            <LinkifiedText text={note.content} />
          </p>
          <p className="text-xs text-muted-foreground mt-1.5">
            {note.updatedAt
              ? `수정됨: ${formatFullDate(note.updatedAt)}`
              : formatFullDate(note.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

