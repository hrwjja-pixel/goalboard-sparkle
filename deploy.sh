#!/bin/bash

# 배포 자동화 스크립트
# 사용법: ./deploy.sh

echo "========================================="
echo "  목표 대시보드 배포 패키지 생성 시작"
echo "========================================="
echo ""

# 1. 배포 폴더 이름 설정 (날짜 포함)
DEPLOY_NAME="goalboard-deploy-$(date +%Y%m%d-%H%M%S)"
echo "📦 배포 폴더: $DEPLOY_NAME"
echo ""

# 2. 임시 배포 폴더 생성
mkdir -p "$DEPLOY_NAME"

# 3. 프론트엔드 빌드
echo "🔨 프론트엔드 빌드 중..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    rm -rf "$DEPLOY_NAME"
    exit 1
fi
echo "✅ 빌드 완료"
echo ""

# 4. 필요한 파일/폴더 복사
echo "📋 필요한 파일 복사 중..."

# package.json, package-lock.json 복사
cp package.json "$DEPLOY_NAME/"
cp package-lock.json "$DEPLOY_NAME/"
echo "  ✓ package.json"
echo "  ✓ package-lock.json"

# 서버 코드 복사
cp -r server "$DEPLOY_NAME/"
echo "  ✓ server/"

# Prisma 폴더 복사 (스키마 + 마이그레이션 + DB)
cp -r prisma "$DEPLOY_NAME/"
echo "  ✓ prisma/"

# 빌드된 프론트엔드 복사
cp -r dist "$DEPLOY_NAME/"
echo "  ✓ dist/"

# .env 파일 복사 (있으면)
if [ -f .env ]; then
    cp .env "$DEPLOY_NAME/"
    echo "  ✓ .env"
else
    # .env가 없으면 기본 .env 생성
    echo "DATABASE_URL=\"file:./dev.db\"" > "$DEPLOY_NAME/.env"
    echo "  ✓ .env (기본값으로 생성)"
fi

echo ""
echo "✅ 파일 복사 완료"
echo ""

# 5. README 파일 생성 (운영 서버 설치 가이드)
cat > "$DEPLOY_NAME/README-DEPLOY.md" << 'EOF'
# 목표 대시보드 배포 가이드

## 1. 서버 요구사항
- Node.js 18 이상
- npm

## 2. 설치 방법

### 2-1. 파일 업로드
이 폴더의 모든 파일을 운영 서버의 원하는 위치에 업로드합니다.

### 2-2. 의존성 설치
```bash
npm install --production
```

### 2-3. Prisma Client 생성
```bash
npx prisma generate
```

## 3. 실행 방법

### 개발 모드 (자동 재시작)
```bash
npm run server
```

### 프로덕션 모드 (권장)
```bash
# PM2 설치 (전역으로 한 번만)
npm install -g pm2

# PM2로 실행
pm2 start server/index.ts --name goalboard --interpreter tsx

# 서버 재시작 시 자동 실행 설정
pm2 startup
pm2 save

# 상태 확인
pm2 status

# 로그 확인
pm2 logs goalboard

# 중지
pm2 stop goalboard

# 재시작
pm2 restart goalboard
```

## 4. 접속 확인
서버 실행 후 브라우저에서 접속:
- http://서버IP:3001/api/health (API 확인)
- http://서버IP:8080 (프론트엔드 - Nginx 설정 필요)

## 5. 데이터 백업
중요: `prisma/dev.db` 파일을 주기적으로 백업하세요!

```bash
# 백업 예시
cp prisma/dev.db prisma/dev.db.backup.$(date +%Y%m%d)
```

## 6. 문제 해결

### 포트 변경이 필요한 경우
`.env` 파일 수정:
```
PORT=원하는포트번호
DATABASE_URL="file:./dev.db"
```

### 데이터베이스 초기화 (주의!)
```bash
rm prisma/dev.db
npx prisma migrate dev
```
⚠️ 이 작업은 모든 데이터를 삭제합니다!
EOF

echo "📝 배포 가이드 생성 완료"
echo ""

# 6. 압축 파일 생성
echo "🗜️  압축 파일 생성 중..."
zip -r "${DEPLOY_NAME}.zip" "$DEPLOY_NAME" -q
echo "✅ 압축 완료: ${DEPLOY_NAME}.zip"
echo ""

# 7. 배포 폴더 정리 여부 확인
echo "🗑️  임시 폴더 삭제 중..."
rm -rf "$DEPLOY_NAME"
echo "✅ 정리 완료"
echo ""

# 8. 완료 메시지
echo "========================================="
echo "  배포 패키지 생성 완료! 🎉"
echo "========================================="
echo ""
echo "📦 생성된 파일: ${DEPLOY_NAME}.zip"
echo ""
echo "다음 단계:"
echo "1. ${DEPLOY_NAME}.zip 파일을 운영 서버로 전송"
echo "2. 압축 해제: unzip ${DEPLOY_NAME}.zip"
echo "3. 폴더 이동: cd ${DEPLOY_NAME}"
echo "4. README-DEPLOY.md 파일 참고하여 설치 및 실행"
echo ""
echo "⚠️  중요: prisma/dev.db 파일에 모든 데이터가 들어있습니다!"
echo ""
