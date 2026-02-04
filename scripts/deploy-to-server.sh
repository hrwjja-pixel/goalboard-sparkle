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
NGINX_DIST_PATH="${NGINX_DIST_PATH}"

echo "========================================="
echo "  목표 대시보드 오프라인 서버 배포"
echo "========================================="
echo ""
echo "배포 대상: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}"
echo "배포 경로: ${SERVER_PATH}"
if [ -n "${NGINX_DIST_PATH}" ]; then
    echo "nginx 경로: ${NGINX_DIST_PATH}"
fi
echo ""

# 1. 배포 전 자동 백업
echo "💾 배포 전 데이터베이스 백업 중..."
SSH_OPTS="-p ${SERVER_PORT}"

ssh ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST} << BACKUP_EOF
if [ -f ${SERVER_PATH}/scripts/backup-db-server.sh ]; then
    cd ${SERVER_PATH}/scripts
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

# 4. 원격 서버에서 서비스 재시작
echo "🔄 운영 서버 재시작 중..."
echo ""

ssh ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST} << ENDSSH
cd ${SERVER_PATH}

# 로그 디렉토리 생성
mkdir -p logs

# 기존 프로세스 종료
echo "🛑 기존 서버 프로세스 종료 중..."
OLD_PID=\$(pgrep -f "node.*production.cjs" || true)
if [ -n "\$OLD_PID" ]; then
    kill \$OLD_PID 2>/dev/null || true
    sleep 2
    echo "   기존 프로세스(PID: \$OLD_PID) 종료됨"
else
    echo "   실행 중인 프로세스 없음"
fi

# 새 서버 실행
echo "🚀 새 서버 시작 중..."
nohup /opt/nodejs/bin/node server/production.cjs > logs/server.log 2>&1 &
sleep 2

# 실행 확인
NEW_PID=\$(pgrep -f "node.*production.cjs" || true)
if [ -n "\$NEW_PID" ]; then
    echo "✅ 서버 시작 완료 (PID: \$NEW_PID)"
else
    echo "❌ 서버 시작 실패! 로그를 확인하세요:"
    echo "   tail -f ${SERVER_PATH}/logs/server.log"
    exit 1
fi

echo ""
echo "서버 상태:"
ps aux | grep "production.cjs" | grep -v grep || echo "프로세스 없음"
ENDSSH

# 5. nginx 정적 파일 경로에 dist 복사 및 nginx 재시작
if [ -n "${NGINX_DIST_PATH}" ]; then
    echo ""
    echo "🔄 nginx 정적 파일 업데이트 중..."
    echo "📋 dist 파일 복사: ${SERVER_PATH}/dist/ -> ${NGINX_DIST_PATH}/"
    echo "   (sudo 비밀번호가 필요할 수 있습니다)"
    echo ""

    # -t 옵션으로 pseudo-terminal 할당하여 sudo 비밀번호 입력 가능하게 함
    ssh -t ${SSH_OPTS} ${SERVER_USER}@${SERVER_HOST} "sudo cp -r ${SERVER_PATH}/dist/* ${NGINX_DIST_PATH}/ && echo '✅ 파일 복사 완료' && sudo nginx -t && sudo nginx -s reload && echo '✅ nginx 재시작 완료'"

    echo ""
    echo "✅ nginx 정적 파일 업데이트 완료"
fi

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
echo "  ssh -p ${SERVER_PORT} ${SERVER_USER}@${SERVER_HOST}"
echo "  cd ${SERVER_PATH}"
echo "  tail -f logs/server.log"
echo ""
echo "⚠️  주의사항:"
echo "  - uploads/ 폴더는 보존됩니다 (사용자 업로드 파일)"
echo "  - logs/ 폴더는 보존됩니다 (서버 로그)"
echo "  - .env 파일은 덮어쓰지 않습니다 (수동 관리)"
echo ""
