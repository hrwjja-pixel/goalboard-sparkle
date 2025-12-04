# Goalboard 윈도우 서비스 설치 가이드

## 개요

Goalboard를 윈도우 서비스로 등록하면:
- **백그라운드 실행**: 터미널 창 없이 백그라운드에서 실행됩니다
- **자동 시작**: Windows 부팅 시 자동으로 시작됩니다
- **안정성**: 실수로 창을 닫아도 서비스가 중지되지 않습니다
- **자동 재시작**: 오류 발생 시 자동으로 재시작됩니다

## 필수 요구사항

- Node.js 설치
- 관리자 권한 (서비스 설치/제거 시)
- 빌드된 애플리케이션 (`npm run build` 실행 완료)

## 설치 방법

### 1. 애플리케이션 빌드

서비스를 설치하기 전에 먼저 애플리케이션을 빌드해야 합니다:

```bash
npm run build
```

### 2. 서비스 설치

**관리자 권한**으로 PowerShell 또는 명령 프롬프트를 실행한 후:

```bash
cd C:\goalboard-sparkle
node install-service.cjs
```

설치가 완료되면 서비스가 자동으로 시작됩니다.

### 3. 접속 확인

브라우저에서 다음 주소로 접속:
- 로컬: http://localhost:3001
- 네트워크: http://10.51.18.139:3001

## 서비스 관리

### 서비스 상태 확인

1. `Win + R` → `services.msc` 입력
2. "Goalboard Server" 찾기
3. 상태 확인 (실행 중/중지됨)

### 서비스 중지/시작

**방법 1: 서비스 관리자 사용**
1. `services.msc` 실행
2. "Goalboard Server" 우클릭
3. "중지" 또는 "시작" 선택

**방법 2: PowerShell 사용**
```powershell
# 서비스 중지
Stop-Service -Name "Goalboard Server"

# 서비스 시작
Start-Service -Name "Goalboard Server"

# 서비스 재시작
Restart-Service -Name "Goalboard Server"

# 서비스 상태 확인
Get-Service -Name "Goalboard Server"
```

### 서비스 제거

서비스를 제거하려면 **관리자 권한**으로:

```bash
cd C:\goalboard-sparkle
node uninstall-service.cjs
```

## 로그 확인

서비스 로그는 다음 위치에 저장됩니다:

```
C:\goalboard-sparkle\daemon\
```

- `Goalboard Server.out.log`: 일반 출력 로그
- `Goalboard Server.err.log`: 에러 로그
- `Goalboard Server.wrapper.log`: 서비스 래퍼 로그

## 문제 해결

### 서비스가 시작되지 않을 때

1. **빌드 확인**: `npm run build`가 성공적으로 실행되었는지 확인
2. **로그 확인**: `daemon` 폴더의 에러 로그 확인
3. **포트 충돌**: 3001 포트가 이미 사용 중인지 확인
   ```bash
   netstat -ano | findstr :3001
   ```
4. **권한 확인**: 관리자 권한으로 실행했는지 확인

### 서비스 완전 재설치

```bash
# 1. 서비스 제거 (관리자 권한)
node uninstall-service.cjs

# 2. daemon 폴더 삭제
rmdir /s /q daemon

# 3. 재빌드
npm run build

# 4. 서비스 재설치 (관리자 권한)
node install-service.cjs
```

### 포트 변경이 필요한 경우

`install-service.cjs` 파일을 열어서 PORT 환경변수를 수정:

```javascript
env: [
  {
    name: "PORT",
    value: "원하는포트번호"  // 예: "8080"
  }
]
```

## 기존 작업 스케줄러 제거

서비스로 전환했다면 기존 작업 스케줄러는 제거하는 것이 좋습니다:

```bash
# 기존 자동시작 제거 (관리자 권한)
remove-autostart.bat
```

또는 작업 스케줄러 직접 실행:
1. `Win + R` → `taskschd.msc` 입력
2. "Goalboard Start" 작업 찾기
3. 우클릭 → "삭제"

## 비교: 작업 스케줄러 vs 윈도우 서비스

| 특징 | 작업 스케줄러 | 윈도우 서비스 |
|------|---------------|---------------|
| 터미널 창 표시 | ✅ 표시됨 (실수로 닫힘) | ❌ 표시 안됨 |
| 백그라운드 실행 | ⚠️ 창이 보임 | ✅ 완전한 백그라운드 |
| 자동 재시작 | ❌ 없음 | ✅ 오류 시 자동 재시작 |
| 관리 편의성 | ⚠️ 보통 | ✅ 서비스 관리자로 쉬움 |
| 로그 관리 | ❌ 별도 설정 필요 | ✅ 자동 로그 파일 생성 |

## 주의사항

- 서비스 설치/제거는 **반드시 관리자 권한**으로 실행해야 합니다
- 코드 변경 시 `npm run build` 후 서비스를 재시작해야 반영됩니다
- 서비스는 Windows 부팅 시 자동으로 시작됩니다 (자동 시작 설정 가능)
