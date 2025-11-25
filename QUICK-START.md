# ⚡ Windows 배포 빠른 시작 가이드

## 🎯 목표
Windows 11 Home PC (IP: 10.51.18.139)에서 Goalboard를 실행하여 네트워크의 다른 PC에서 접속 가능하게 만들기

---

## 📝 체크리스트

Windows PC에서 아래 순서대로 진행하세요:

### ✅ 1. Node.js 설치 (5분)
1. https://nodejs.org 접속
2. "LTS" 버전 다운로드
3. 설치 (기본 옵션)
4. PowerShell 열고 확인:
   ```powershell
   node --version
   ```

### ✅ 2. 프로젝트 가져오기 (2분)
프로젝트 폴더를 `C:\goalboard-sparkle`에 복사

### ✅ 3. 설치 및 실행 (5분)
PowerShell에서:
```powershell
cd C:\goalboard-sparkle
npm install
.\start-windows.bat
```

### ✅ 4. 방화벽 설정 (3분)
**관리자 권한 PowerShell**에서:
```powershell
New-NetFirewallRule -DisplayName "Goalboard Server" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

### ✅ 5. 접속 테스트
- 같은 PC: http://localhost:3001
- 다른 PC: http://10.51.18.139:3001

---

## 🚀 자동 시작 설정 (선택사항, 10분)

PC 재시작 시 자동으로 실행되게 하려면:

```powershell
# PM2 설치
npm install -g pm2

# 서버 등록
cd C:\goalboard-sparkle
pm2 start npm --name "goalboard" -- start

# 자동 시작 설정
pm2 save
pm2 startup
```

**PM2 명령어:**
- `pm2 list` - 상태 확인
- `pm2 logs goalboard` - 로그 보기
- `pm2 restart goalboard` - 재시작

---

## 🔄 업데이트 방법

1. 새 파일을 `C:\goalboard-sparkle`에 복사
2. PowerShell에서:
   ```powershell
   cd C:\goalboard-sparkle
   npm install
   npm run build
   pm2 restart goalboard
   ```
   (PM2 미사용 시: Ctrl+C로 종료 후 `npm start`)

---

## 🆘 문제 해결

### 포트 사용 중 에러
```powershell
netstat -ano | findstr :3001
taskkill /PID [PID번호] /F
```

### 접속 안됨
1. 방화벽 확인 (4번 단계)
2. Windows PC IP 확인: `ipconfig`
3. 같은 네트워크인지 확인

### 서버 재시작
```powershell
pm2 restart goalboard
```
또는 Ctrl+C 후 `npm start`

---

## 📱 원격 관리

**Chrome Remote Desktop 사용 (무료):**
1. https://remotedesktop.google.com/access 접속
2. Chrome 설치
3. Remote Desktop 확장 프로그램 설치
4. 설정 완료 후 어디서나 접속 가능

---

## 📞 도움말

상세한 설명은 `README-WINDOWS-DEPLOYMENT.md` 파일을 참고하세요.
