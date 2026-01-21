import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { UserSettings, ViewMode, Theme } from '@/hooks/useUserSettings';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSaveGlobal: (settings: { dashboardTitle: string; dashboardSubtitle: string }) => void;
  onSaveUser: (settings: UserSettings) => void;
  currentTitle: string;
  currentSubtitle: string;
  userSettings: UserSettings;
}

export const SettingsDialog = ({
  open,
  onClose,
  onSaveGlobal,
  onSaveUser,
  currentTitle,
  currentSubtitle,
  userSettings
}: SettingsDialogProps) => {
  // Global settings
  const [title, setTitle] = useState(currentTitle);
  const [subtitle, setSubtitle] = useState(currentSubtitle);

  // User settings
  const [localUserSettings, setLocalUserSettings] = useState<UserSettings>(userSettings);

  useEffect(() => {
    setTitle(currentTitle);
    setSubtitle(currentSubtitle);
    setLocalUserSettings(userSettings);
  }, [currentTitle, currentSubtitle, userSettings, open]);

  const handleSaveGlobal = () => {
    onSaveGlobal({
      dashboardTitle: title,
      dashboardSubtitle: subtitle,
    });
  };

  const handleSaveUser = () => {
    onSaveUser(localUserSettings);
  };

  const handleResetGlobal = () => {
    setTitle('WEHAGO H 목표 대시보드');
    setSubtitle('EMR개발본부 > WEHAGO H 개발센터');
  };

  const handleResetUser = () => {
    setLocalUserSettings({
      defaultViewMode: 'compact',
      autoRefreshInterval: 30,
      showCompletedByDefault: false,
      enableAutoRefresh: true,
      theme: 'system',
    });
  };

  const handleClose = () => {
    onClose();
  };

  const updateUserSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalUserSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">개인 설정</TabsTrigger>
            <TabsTrigger value="global">전체 설정</TabsTrigger>
          </TabsList>

          {/* 개인 설정 탭 */}
          <TabsContent value="user" className="space-y-4 mt-4">
            <div className="grid gap-4">
              {/* 기본 뷰 모드 */}
              <div className="grid gap-2">
                <Label htmlFor="viewMode">기본 뷰 모드</Label>
                <Select
                  value={localUserSettings.defaultViewMode}
                  onValueChange={(value: ViewMode) => updateUserSetting('defaultViewMode', value)}
                >
                  <SelectTrigger id="viewMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">요약 보기</SelectItem>
                    <SelectItem value="normal">상세 보기</SelectItem>
                    <SelectItem value="list">목록 보기</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  앱을 열 때 기본으로 표시할 뷰 모드입니다
                </p>
              </div>

              {/* 테마 */}
              <div className="grid gap-2">
                <Label htmlFor="theme">테마</Label>
                <Select
                  value={localUserSettings.theme}
                  onValueChange={(value: Theme) => updateUserSetting('theme', value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">시스템 설정 따라가기</SelectItem>
                    <SelectItem value="light">라이트 모드</SelectItem>
                    <SelectItem value="dark">다크 모드</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  화면 색상 테마를 선택합니다
                </p>
              </div>

              {/* 완료 항목 표시 기본값 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showCompleted">완료 항목 표시</Label>
                  <p className="text-xs text-muted-foreground">
                    앱을 열 때 완료된 목표를 기본으로 표시합니다
                  </p>
                </div>
                <Switch
                  id="showCompleted"
                  checked={localUserSettings.showCompletedByDefault}
                  onCheckedChange={(checked) => updateUserSetting('showCompletedByDefault', checked)}
                />
              </div>

              {/* 자동 갱신 활성화 */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRefresh">백그라운드 자동 갱신</Label>
                  <p className="text-xs text-muted-foreground">
                    다른 사용자의 변경사항을 자동으로 반영합니다
                  </p>
                </div>
                <Switch
                  id="autoRefresh"
                  checked={localUserSettings.enableAutoRefresh}
                  onCheckedChange={(checked) => updateUserSetting('enableAutoRefresh', checked)}
                />
              </div>

              {/* 자동 갱신 주기 */}
              {localUserSettings.enableAutoRefresh && (
                <div className="grid gap-2">
                  <Label htmlFor="refreshInterval">자동 갱신 주기 (초)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    min="10"
                    max="300"
                    step="5"
                    value={localUserSettings.autoRefreshInterval}
                    onChange={(e) => updateUserSetting('autoRefreshInterval', parseInt(e.target.value) || 30)}
                  />
                  <p className="text-xs text-muted-foreground">
                    10초 ~ 300초 사이로 설정 가능합니다 (권장: 30초)
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleResetUser}>
                기본값 복원
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  취소
                </Button>
                <Button onClick={() => { handleSaveUser(); handleClose(); }}>
                  저장
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* 전체 설정 탭 */}
          <TabsContent value="global" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">대시보드 제목</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: WEHAGO H 목표 대시보드"
                />
                <p className="text-xs text-muted-foreground">
                  모든 사용자에게 표시되는 대시보드 제목입니다
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subtitle">부제목</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="예: EMR개발본부 > WEHAGO H 개발센터"
                />
                <p className="text-xs text-muted-foreground">
                  대시보드 제목 아래 표시되는 부제목입니다
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleResetGlobal}>
                기본값 복원
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  취소
                </Button>
                <Button onClick={() => { handleSaveGlobal(); handleClose(); }}>
                  저장
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
