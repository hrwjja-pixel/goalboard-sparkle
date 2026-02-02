# 프로젝트 개발 지침

## 배포 정책
- **개발은 로컬에서 진행**
- **운영 배포는 사용자가 명시적으로 요청할 때만 수행**
- 배포 명령: `cd scripts && ./deploy-to-server.sh`

## 서버 코드 수정 시 주의사항 (중요!)

### 개발/운영 서버 파일 동기화 - 필수 체크리스트
- `server/index.ts` (개발용) 수정 시 **반드시** `server/production.ts` (운영용)도 **동일하게** 수정
- 수정 후 반드시 서버 빌드 실행: `npm run build:server`
- production.cjs는 production.ts를 esbuild로 번들링한 파일임

### API 엔드포인트 수정 시 특히 주의
두 파일의 다음 API들이 **완전히 동일**해야 함:
- `/api/goals` - GET (includeDescendants 파라미터 포함)
- `/api/categories` - GET (includeDescendants 파라미터 포함)
- 기타 모든 API 엔드포인트

### 수정 완료 전 확인사항
1. index.ts 수정 완료
2. production.ts에 동일한 수정 적용 확인
3. `npm run build:server` 실행
4. 로컬 테스트 후 배포

### 빌드 명령어
```bash
# 프론트엔드 빌드
npm run build

# 서버 빌드 (production.ts → production.cjs)
npm run build:server

# 전체 프로덕션 빌드 (프론트엔드 + 서버)
npm run prod
```

## 배포

### 배포 스크립트
```bash
cd scripts && ./deploy-to-server.sh
```
- 자동으로 DB 백업, 프론트엔드/서버 빌드, rsync 전송, 서버 재시작 수행
- PM2 대신 nohup 방식으로 서버 실행 (node 경로: `/opt/nodejs/bin/node`)
- nginx 정적 파일 경로로 dist 복사 및 nginx reload 자동 수행

### 배포 설정
- `scripts/.env.deploy` - 배포 서버 정보 (gitignore)
- `scripts/.env.backup` - DB 백업 정보 (gitignore)

### 서버 경로 구조 (중요!)
- **Node.js 서버 경로**: `/home/ktg2926/dashboard/` - 백엔드 실행 위치
- **nginx 정적 파일 경로**: `/home/apps/dashboard/dist/` - 프론트엔드 서빙 위치
- 배포 스크립트가 자동으로 dist 파일을 nginx 경로로 복사함
- `NGINX_DIST_PATH` 환경변수로 설정 가능

## 데이터베이스

### DB 스키마 변경 시
1. `prisma/schema.prisma` 수정
2. DB에 직접 ALTER TABLE 실행 또는 `npx prisma db push`
3. `npx prisma generate` 실행
4. server/index.ts와 server/production.ts 모두 수정
5. `npm run build:server` 실행

### 백업
- 개발/운영 DB: PostgreSQL (172.16.124.137)
- 로컬 백업: `scripts/download-backup.sh`
