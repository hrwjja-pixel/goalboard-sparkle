# 데이터베이스 관리 가이드

## 📁 데이터베이스 파일 위치

- **파일명**: `dev.db`
- **위치**: 프로젝트 루트 폴더 (goalboard-sparkle/)
- **유형**: SQLite 데이터베이스

---

## 🔄 데이터베이스 전송 방법

### Mac → Windows PC 전송

#### 방법 1: Git 사용 (가장 쉬움)
1. Mac에서 이미 Git에 포함시켜 놓았습니다
2. Windows PC에서:
   ```powershell
   git clone https://github.com/hrwjja-pixel/goalboard-sparkle.git
   cd goalboard-sparkle
   ```
3. `dev.db` 파일이 자동으로 포함됩니다

#### 방법 2: 직접 복사
1. Mac에서 `dev.db` 파일 복사
2. USB 또는 네트워크로 Windows PC로 전송
3. Windows PC의 `C:\goalboard-sparkle\` 폴더에 붙여넣기

---

## 💾 데이터베이스 백업

### Windows에서 백업 (자동)
```powershell
.\backup-db.bat
```

백업 파일은 `backups\` 폴더에 날짜/시간과 함께 저장됩니다.

### 수동 백업
1. `dev.db` 파일 복사
2. 안전한 위치에 저장 (예: `backups\dev_backup_20251125.db`)

---

## 🔧 데이터베이스 복원

### 백업에서 복원
1. 서버 중지 (Ctrl+C 또는 `pm2 stop goalboard`)
2. 현재 `dev.db` 파일 백업 (혹시 모르니)
3. 백업 파일을 `dev.db`로 이름 변경하여 복사
4. 서버 재시작

```powershell
# PM2 사용 시
pm2 stop goalboard
copy backups\dev_20251125.db dev.db
pm2 start goalboard

# 수동 실행 시
# Ctrl+C로 서버 종료
copy backups\dev_20251125.db dev.db
npm start
```

---

## 🗑️ 데이터베이스 초기화 (모든 데이터 삭제)

```powershell
# 서버 중지
pm2 stop goalboard

# 기존 DB 삭제
del dev.db

# 새 DB 생성
npx prisma migrate deploy

# 서버 시작
pm2 start goalboard
```

**경고**: 이 작업은 모든 데이터를 삭제합니다!

---

## 📊 데이터베이스 관리 도구

### SQLite 뷰어 사용

**Windows 추천 도구:**
1. **DB Browser for SQLite** (무료)
   - https://sqlitebrowser.org/dl/
   - GUI로 데이터 확인/수정 가능

2. **DBeaver** (무료)
   - https://dbeaver.io/download/
   - 다양한 DB 지원

### 설치 후 사용법:
1. 프로그램 실행
2. File → Open Database
3. `C:\goalboard-sparkle\dev.db` 선택
4. 테이블 확인:
   - `Goal`: 목표 카드
   - `Category`: 카테고리
   - `SubGoal`: 하위 목표
   - `Note`: 메모

---

## 🔄 데이터 동기화 (Mac ↔ Windows)

### Mac에서 변경 후 Windows에 반영

**Mac에서:**
```bash
cd "/Users/yongmin/Repositories/AI Lab/goalboard-sparkle"
git add -f dev.db
git commit -m "Update database"
git push
```

**Windows에서:**
```powershell
cd C:\goalboard-sparkle

# 현재 DB 백업 (혹시 모르니)
copy dev.db backups\dev_before_update.db

# 최신 변경사항 받기
git pull

# 서버 재시작
pm2 restart goalboard
```

---

## ⚠️ 주의사항

1. **백업 습관화**
   - 중요한 데이터 입력 후 즉시 백업
   - 정기적으로 백업 (예: 주 1회)

2. **동시 수정 방지**
   - Mac과 Windows에서 동시에 수정하지 말 것
   - 한 곳에서만 수정 후 다른 곳에 동기화

3. **서버 중지 후 DB 작업**
   - DB 파일 복사/삭제 시 서버 중지 필수
   - 그렇지 않으면 파일 손상 가능

4. **Git 충돌 주의**
   - 양쪽에서 DB를 수정하면 Git 충돌 발생
   - 한 쪽의 DB를 선택해야 함

---

## 🆘 문제 해결

### DB 파일 손상된 경우
```powershell
# 백업에서 복원
copy backups\dev_latest.db dev.db

# 또는 새로 시작
del dev.db
npx prisma migrate deploy
```

### DB가 로드되지 않는 경우
```powershell
# Prisma 재생성
npx prisma generate
npx prisma migrate deploy
```

### 데이터가 보이지 않는 경우
1. `dev.db` 파일이 프로젝트 루트에 있는지 확인
2. `.env` 파일의 `DATABASE_URL` 확인:
   ```
   DATABASE_URL="file:./dev.db"
   ```

---

## 💡 팁

1. **자동 백업 설정**
   - Windows 작업 스케줄러로 매일 자동 백업 가능

2. **클라우드 백업**
   - `backups\` 폴더를 OneDrive, Google Drive 등에 동기화

3. **버전 관리**
   - 중요한 마일스톤마다 Git에 커밋하여 버전 관리
