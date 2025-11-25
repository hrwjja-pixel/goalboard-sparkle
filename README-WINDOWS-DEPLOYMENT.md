# Windows 11 Home PC 배포 가이드

이 문서는 Windows 11 Home PC (IP: 10.51.18.139)에서 Goalboard를 배포하는 방법을 설명합니다.

## 📋 사전 준비

### 1. Node.js 설치
1. https://nodejs.org 접속
2. "LTS" 버전 다운로드 (예: 20.x.x)
3. 설치 프로그램 실행 (모든 기본 옵션 선택)
4. PowerShell 열고 확인:
   ```powershell
   node --version
   npm --version
   ```

### 2. Git 설치 (선택사항)
1. https://git-scm.com/download/win 접속
2. Git for Windows 다운로드 및 설치

---

## 🚀 배포 단계

### 1단계: 프로젝트 파일 가져오기

**방법 A: Git 사용 (추천)**
```powershell
cd C:\
git clone [Git 저장소 URL]
cd goalboard-sparkle
```

**방법 B: 파일 복사**
- USB 또는 네트워크를 통해 프로젝트 폴더를 `C:\goalboard-sparkle`에 복사

### 2단계: 의존성 설치
```powershell
cd C:\goalboard-sparkle
npm install
```

### 3단계: 환경 설정
`.env` 파일이 프로젝트 루트에 있는지 확인:
```
DATABASE_URL="file:./dev.db"
PORT=3001
```

### 4단계: 데이터베이스 초기화
```powershell
npx prisma generate
npx prisma migrate deploy
```

### 5단계: 빌드 및 실행

**간단한 방법 (배치 파일 사용):**
```powershell
start-windows.bat
```

**수동 실행:**
```powershell
npm run build
npm start
```

서버가 시작되면 다음 메시지를 볼 수 있습니다:
```
🚀 Goalboard Server running!
📡 Local: http://localhost:3001
🌐 Network: http://10.51.18.139:3001
```

---

## 🔥 방화벽 설정

Windows 방화벽에서 포트 3001을 허용해야 다른 PC에서 접속할 수 있습니다.

### 방법 1: GUI 사용

1. **Windows 키** 누르고 "Windows Defender 방화벽" 검색
2. **"고급 설정"** 클릭
3. 왼쪽 메뉴에서 **"인바운드 규칙"** 선택
4. 오른쪽 메뉴에서 **"새 규칙"** 클릭
5. 규칙 유형: **"포트"** 선택 → 다음
6. **TCP** 선택, 특정 로컬 포트: **3001** 입력 → 다음
7. **"연결 허용"** 선택 → 다음
8. 모든 프로필 (도메인, 개인, 공용) 선택 → 다음
9. 이름: **"Goalboard Server"** 입력 → 마침

### 방법 2: PowerShell 사용 (관리자 권한 필요)

```powershell
New-NetFirewallRule -DisplayName "Goalboard Server" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

---

## 🔄 자동 시작 설정 (PM2 사용)

서버가 자동으로 시작되고 관리되도록 PM2를 설정합니다.

### PM2 설치
```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### PM2로 서버 시작
```powershell
cd C:\goalboard-sparkle

# 서버 시작
pm2 start npm --name "goalboard" -- start

# 자동 시작 설정
pm2 save
pm2 startup
```

### PM2 유용한 명령어
```powershell
pm2 list              # 실행 중인 프로세스 목록
pm2 logs goalboard    # 로그 보기
pm2 restart goalboard # 재시작
pm2 stop goalboard    # 중지
pm2 delete goalboard  # 삭제
```

---

## 🌐 접속 방법

### 같은 PC에서
- http://localhost:3001

### 같은 네트워크의 다른 PC에서
- http://10.51.18.139:3001

---

## 🔧 문제 해결

### 포트가 이미 사용 중인 경우
```powershell
# 포트 3001을 사용하는 프로세스 확인
netstat -ano | findstr :3001

# 프로세스 종료 (PID 확인 후)
taskkill /PID [프로세스ID] /F
```

### 서버가 접속되지 않는 경우
1. 방화벽 설정 확인
2. Windows PC IP 주소 확인:
   ```powershell
   ipconfig
   ```
3. 같은 네트워크에 연결되어 있는지 확인

### 데이터베이스 오류
```powershell
# Prisma 재생성
npx prisma generate
npx prisma migrate reset
```

---

## 📦 업데이트 방법

### Git을 사용하는 경우
```powershell
cd C:\goalboard-sparkle

# 최신 코드 받기
git pull

# 의존성 업데이트
npm install

# 재빌드 및 재시작
npm run build

# PM2 사용 시
pm2 restart goalboard

# 수동 실행 시
# Ctrl+C로 서버 종료 후
npm start
```

### 수동 복사하는 경우
1. 서버 중지 (Ctrl+C 또는 `pm2 stop goalboard`)
2. 새 파일 복사
3. `npm install` 실행
4. `npm run build` 실행
5. 서버 재시작

---

## 📝 로그 확인

### 일반 실행 시
- PowerShell 창에 직접 표시됨

### PM2 사용 시
```powershell
pm2 logs goalboard
```

---

## 🛑 서버 종료

### 일반 실행 시
- PowerShell 창에서 **Ctrl+C** 누르기

### PM2 사용 시
```powershell
pm2 stop goalboard
```

---

## 💡 팁

1. **원격 접속**: Chrome Remote Desktop 설치 (https://remotedesktop.google.com)
2. **자동 업데이트**: 업데이트 스크립트 작성 (update.bat)
3. **백업**: dev.db 파일을 주기적으로 백업

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Node.js가 설치되어 있는지
2. 방화벽 설정이 올바른지
3. 포트 3001이 사용 가능한지
4. 네트워크 연결이 정상인지
