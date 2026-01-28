#!/bin/bash

# 오프라인 운영 서버 자동 배포 스크립트
# 사용법: cd scripts && ./deploy-to-server.sh

set -e

# 스크립트 디렉토리와 프로젝트 루트 경로
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 배포 설정 파일 로드
if [ ! -f "$SCRIPT_DIR/.env.deploy" ]; then
    echo "❌ .env.deploy 파일이 없습니다!"
    echo ""
    echo "다음 명령으로 생성하세요:"
    echo "  cd scripts/"
    echo "  cp .env.deploy.example .env.deploy"
    echo "  vi .env.deploy  # 서버 정보 입력"
    exit 1
fi

# .env.deploy 파일에서 설정 읽기
source "$SCRIPT_DIR/.env.deploy"

SERVER_USER="${DEPLOY_SERVER_USER}"
SERVER_HOST="${DEPLOY_SERVER_HOST}"
SERVER_PORT="${DEPLOY_SERVER_PORT}"
SERVER_PATH="${DEPLOY_SERVER_PATH}"

echo "========================================="
echo "  목표 대시보드 오프라인 서버 배포"
echo "========================================="
echo ""
echo "배포 대상: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
echo "배포 경로: ${SERVER_PATH}"
echo ""

# 1. 배포 전 자동 백업
echo "💾 배포 전 데이터베이스 백업 중..."
SSH_OPTS="-p ${SERVER_PORT}"

ssh ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST} << 'BACKUP_EOF'
if [ -f /home/ktg2926/dashboard/scripts/backup-db-server.sh ]; then
    cd /home/ktg2926/dashboard/scripts
    ./backup-db-server.sh
    echo "✅ 백업 완료"
else
    echo "⚠️  백업 스크립트가 없습니다. 계속 진행합니다..."
fi
BACKUP_EOF

echo ""

# 2. 로컬에서 완전한 프로덕션 빌드 준비
echo "📦 프로덕션 빌드 준비 중..."
cd "$PROJECT_ROOT"
./prepare-production.sh

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패!"
    exit 1
fi
echo "✅ 빌드 완료"
echo ""

PROD_DIR="$PROJECT_ROOT/dashboard-production"

# 3. rsync로 전체 폴더 동기화
echo "🚀 파일 전송 중..."
echo ""

SSH_OPTS="-p ${SERVER_PORT}"

echo "전송 내용:"
echo "  - 빌드된 프론트엔드 (dist/)"
echo "  - 백엔드 코드 (server/)"
echo "  - 데이터베이스 스키마 (prisma/)"
echo "  - 모든 의존성 패키지 (node_modules/)"
echo "  - Prisma 엔진 바이너리 (미리 다운로드됨)"
echo ""

# 전체 프로덕션 폴더를 rsync로 동기화
# --delete 옵션 제거 (uploads/, logs/ 등 서버의 데이터 보존)
rsync -avz --progress \
  -e "ssh ${SSH_OPTS}" \
  --exclude='uploads/' \
  --exclude='logs/' \
  --exclude='.env' \
  ${PROD_DIR}/ \
  ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo ""
echo "✅ 파일 전송 완료"
echo ""

# 4. 원격 서버에서 서비스 재시작만 수행
echo "🔄 운영 서버 재시작 중..."
echo ""

ssh ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${SERVER_PATH}

echo "🔄 PM2 서버 재시작 중..."
if pm2 list | grep -q goalboard; then
    pm2 restart goalboard
    echo "✅ goalboard 재시작 완료"
else
    echo "⚠️  PM2 프로세스가 없습니다. 수동으로 시작하세요:"
    echo "   pm2 start ecosystem.config.js"
fi

echo ""
echo "서버 상태:"
pm2 status
ENDSSH

echo ""
echo "========================================="
echo "  배포 완료! 🎉"
echo "========================================="
echo ""
echo "배포된 내용:"
echo "  ✓ 빌드된 프론트엔드"
echo "  ✓ 백엔드 코드"
echo "  ✓ 모든 npm 패키지 (오프라인)"
echo "  ✓ Prisma 엔진 바이너리"
echo ""
echo "서버 확인:"
echo "  ssh ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST}"
echo "  cd ${SERVER_PATH}"
echo "  pm2 logs goalboard"
echo ""
echo "⚠️  주의사항:"
echo "  - uploads/ 폴더는 보존됩니다 (사용자 업로드 파일)"
echo "  - logs/ 폴더는 보존됩니다 (PM2 로그)"
echo "  - .env 파일은 덮어쓰지 않습니다 (수동 관리)"
echo ""
