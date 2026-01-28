# 운영 관리 스크립트

프로젝트 배포와 백업을 위한 스크립트 모음입니다.

## 📁 디렉토리 구조

```
scripts/
├── deploy-to-server.sh          # 운영 서버 자동 배포
├── backup-db-server.sh           # DB 백업 (서버에서 실행)
├── download-backup.sh            # 백업 파일 로컬 다운로드
├── .env.deploy.example           # 배포 서버 설정 템플릿
├── .env.backup.example           # DB 백업 설정 템플릿
├── .env.deploy                   # 실제 배포 서버 설정 (gitignore)
├── .env.backup                   # 실제 DB 백업 설정 (gitignore)
└── README.md                     # 이 파일
```

## 🚀 배포 (Deployment)

### 초기 설정 (한 번만)

```bash
cd scripts/
cp .env.deploy.example .env.deploy
vi .env.deploy  # 서버 정보 입력
```

### 배포 실행

```bash
cd scripts/
./deploy-to-server.sh
```

**자동 처리 항목:**
1. 배포 전 DB 자동 백업
2. 프론트엔드 빌드
3. 의존성 패키지 준비
4. SSH를 통한 파일 전송
5. PM2 서버 재시작

**장점:**
- ✅ 오프라인 서버 지원 (인터넷 불필요)
- ✅ rsync로 변경된 파일만 전송 (빠름)
- ✅ 사용자 데이터 보존 (uploads/, logs/, .env)
- ✅ 배포 전 자동 백업

## 💾 백업 (Backup)

### 초기 설정 (한 번만)

```bash
cd scripts/
cp .env.backup.example .env.backup
vi .env.backup  # DB 연결 정보 입력
```

### 1. 서버에서 자동 백업 설정

운영 서버에 스크립트 복사:
```bash
cd scripts/
scp -P 2022 .env.backup backup-db-server.sh leeyongmin@172.16.125.185:/home/ktg2926/dashboard/scripts/
```

운영 서버에서 cron 설정:
```bash
# 운영 서버에 접속
ssh -p 2022 leeyongmin@172.16.125.185

# crontab 편집
crontab -e

# 매일 새벽 2시 자동 백업 추가
0 2 * * * /home/ktg2926/dashboard/scripts/backup-db-server.sh >> /home/ktg2926/dashboard/logs/backup.log 2>&1
```

### 2. 수동 백업

```bash
# 운영 서버에서 실행
cd /home/ktg2926/dashboard/scripts
./backup-db-server.sh
```

### 3. 백업 파일 로컬 다운로드

```bash
cd scripts/
./download-backup.sh        # 최근 5개 백업 다운로드
./download-backup.sh 10     # 최근 10개 백업 다운로드
```

다운로드된 파일 위치: `backups/goalboard_backup_YYYYMMDD_HHMMSS.sql.gz`

### 4. 백업 복원

```bash
# 1. 압축 해제
cd backups/
gunzip goalboard_backup_20260128_020000.sql.gz

# 2. PostgreSQL 복원
PGPASSWORD='비밀번호' psql \
  -h 172.16.124.137 \
  -p 5432 \
  -U ktg2926 \
  -d postgres \
  < goalboard_backup_20260128_020000.sql
```

## 🛡️ 3중 백업 시스템

1. **서버 자동 백업**: cron으로 매일 새벽 2시 (30일 보관)
2. **배포 전 백업**: 배포 스크립트 실행 시 자동 백업
3. **로컬 백업**: 주기적으로 로컬 PC에 다운로드

## ⚠️ 주의사항

- `.env.deploy`, `.env.backup` 파일은 **절대 Git에 커밋하지 마세요**
- 민감 정보 (IP, 비밀번호)가 포함되어 있습니다
- 백업 파일도 안전하게 보관하세요
- 정기적으로 백업 복원 테스트를 권장합니다

## 📖 상세 문서

각 스크립트의 상세 사용법은 스크립트 내부 주석을 참고하세요.
