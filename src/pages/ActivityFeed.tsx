import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  ActivityLog,
  formatRelativeTime,
  groupActivitiesByDate,
  formatActivitySummary,
  ACTION_LABELS,
} from '@/types/activity';
import { useProject } from '@/contexts/ProjectContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Globe,
  User,
  Plus,
  Pencil,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const ACTION_ICONS: Record<string, React.ReactNode> = {
  CREATE: <Plus className="h-3 w-3" />,
  UPDATE: <Pencil className="h-3 w-3" />,
  DELETE: <Trash2 className="h-3 w-3" />,
  REORDER: <ArrowUpDown className="h-3 w-3" />,
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  REORDER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function ActivityFeed() {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const loadActivities = async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const newOffset = reset ? 0 : offset;
      const data = await api.getActivityFeed(
        currentProject?.id,
        limit,
        newOffset
      );

      if (reset) {
        setActivities(data);
        setOffset(limit);
      } else {
        setActivities((prev) => [...prev, ...data]);
        setOffset((prev) => prev + limit);
      }

      setHasMore(data.length === limit);
    } catch (err) {
      setError('활동 내역을 불러오는 데 실패했습니다.');
      console.error('Error loading activities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(true);
  }, [currentProject?.id]);

  const groupedActivities = groupActivitiesByDate(activities);

  const handleGoalClick = (goalId?: string) => {
    if (goalId && goalId !== 'bulk') {
      navigate(`/?goalId=${goalId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">활동 내역</h1>
            {currentProject && (
              <p className="text-sm text-muted-foreground">
                {currentProject.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {activities.length === 0 && !isLoading && (
          <div className="text-center py-12 text-muted-foreground">
            활동 내역이 없습니다.
          </div>
        )}

        {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
          <div key={dateLabel} className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground mb-4 sticky top-[73px] bg-background py-2">
              {dateLabel}
            </h2>
            <div className="space-y-3">
              {dateActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onGoalClick={handleGoalClick}
                />
              ))}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {hasMore && !isLoading && activities.length > 0 && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              onClick={() => loadActivities(false)}
            >
              더 불러오기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActivityCardProps {
  activity: ActivityLog;
  onGoalClick?: (goalId?: string) => void;
}

function ActivityCard({ activity, onGoalClick }: ActivityCardProps) {
  const actionColor = ACTION_COLORS[activity.action] || ACTION_COLORS.UPDATE;
  const actionIcon = ACTION_ICONS[activity.action] || ACTION_ICONS.UPDATE;
  const actionLabel = ACTION_LABELS[activity.action] || activity.action;

  return (
    <div className="bg-card rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* User/IP indicator */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            {activity.user?.picture ? (
              <img
                src={activity.user.picture}
                alt={activity.displayName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {/* User name and time */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate">
                {activity.displayName}
              </span>
              <span className="text-muted-foreground text-xs">
                {formatRelativeTime(activity.createdAt)}
              </span>
            </div>

            {/* Activity summary */}
            <p className="text-sm mt-1">
              {formatActivitySummary(activity)}
            </p>

            {/* Action badge */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={`text-xs ${actionColor}`}>
                {actionIcon}
                <span className="ml-1">{actionLabel}</span>
              </Badge>
              {activity.entityType && (
                <Badge variant="outline" className="text-xs">
                  {activity.entityType}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        {activity.goalId && activity.goalId !== 'bulk' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onGoalClick?.(activity.goalId)}
            className="flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
