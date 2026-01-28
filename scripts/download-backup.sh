#!/bin/bash

# 운영 서버에서 백업 파일을 로컬로 다운로드
# 사용법: ./download-backup.sh [최근_N개] (기본값: 5)

set -e

# 스크립트 디렉토리와 프로젝트 루트
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# .env.deploy 파일에서 서버 정보 읽기
if [ ! -f "$SCRIPT_DIR/.env.deploy" ]; then
    echo "❌ .env.deploy 파일이 없습니다!"
    echo ""
    echo "다음 명령으로 생성하세요:"
    echo "  cd scripts/"
    echo "  cp .env.deploy.example .env.deploy"
    echo "  vi .env.deploy  # 서버 정보 입력"
    exit 1
fi

source "$SCRIPT_DIR/.env.deploy"

# 백업 설정 파일에서 백업 경로 읽기
if [ ! -f "$SCRIPT_DIR/.env.backup" ]; then
    echo "❌ .env.backup 파일이 없습니다!"
    echo ""
    echo "다음 명령으로 생성하세요:"
    echo "  cd scripts/"
    echo "  cp .env.backup.example .env.backup"
    echo "  vi .env.backup  # DB 정보 입력"
    exit 1
fi

source "$SCRIPT_DIR/.env.backup"

# 다운로드할 백업 개수 (기본값: 5개)
COUNT=${1:-5}

# 로컬 백업 저장 디렉토리
LOCAL_BACKUP_DIR="$PROJECT_ROOT/backups"
mkdir -p "$LOCAL_BACKUP_DIR"

echo "========================================="
echo "  백업 파일 다운로드"
echo "========================================="
echo ""
echo "서버: ${DEPLOY_SERVER_HOST}:${DEPLOY_SERVER_PORT}"
echo "원격 경로: ${BACKUP_DIR}"
echo "로컬 경로: ${LOCAL_BACKUP_DIR}"
echo "다운로드: 최근 ${COUNT}개"
echo ""

SSH_OPTS="-p ${DEPLOY_SERVER_PORT}"

# 원격 서버에서 최근 백업 파일 목록 가져오기
echo "📋 백업 파일 목록 확인 중..."
BACKUP_FILES=$(ssh ${SSH_OPTS} ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST} \
  "ls -1t ${BACKUP_DIR}/goalboard_backup_*.sql.gz 2>/dev/null | head -n ${COUNT}" || echo "")

if [ -z "$BACKUP_FILES" ]; then
    echo "❌ 백업 파일을 찾을 수 없습니다."
    echo ""
    echo "서버에서 백업을 먼저 실행하세요:"
    echo "  ssh ${SSH_OPTS} ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST}"
    echo "  cd /home/ktg2926/dashboard/scripts"
    echo "  ./backup-db-server.sh"
    exit 1
fi

echo ""
echo "다운로드할 파일:"
echo "$BACKUP_FILES"
echo ""

# 파일 다운로드
for REMOTE_FILE in $BACKUP_FILES; do
    FILENAME=$(basename "$REMOTE_FILE")
    echo "📥 다운로드 중: $FILENAME"

    scp ${SSH_OPTS} \
      ${DEPLOY_SERVER_USER}@${DEPLOY_SERVER_HOST}:${REMOTE_FILE} \
      ${LOCAL_BACKUP_DIR}/

    if [ $? -eq 0 ]; then
        SIZE=$(du -h "${LOCAL_BACKUP_DIR}/${FILENAME}" | cut -f1)
        echo "   ✅ 완료 (${SIZE})"
    else
        echo "   ❌ 실패"
    fi
    echo ""
done

echo "========================================="
echo "  다운로드 완료!"
echo "========================================="
echo ""
echo "로컬 백업 파일 위치: ${LOCAL_BACKUP_DIR}"
echo ""
echo "백업 복원 방법:"
echo "  1. 압축 해제: gunzip 파일명.sql.gz"
echo "  2. PostgreSQL 복원:"
echo "     psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} < 파일명.sql"
echo ""
