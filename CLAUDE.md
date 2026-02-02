# 프로젝트 개발 지침

## 서버 코드 수정 시 주의사항

### 개발/운영 서버 파일 동기화
- `server/index.ts` (개발용) 수정 시 반드시 `server/production.ts` (운영용)도 동일하게 수정
- 수정 후 반드시 서버 빌드 실행: `npm run build:server`
- production.cjs는 production.ts를 esbuild로 번들링한 파일임

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
- PM2 대신 nohup 방식으로 서버 실행

### 배포 설정
- `scripts/.env.deploy` - 배포 서버 정보 (gitignore)
- `scripts/.env.backup` - DB 백업 정보 (gitignore)

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
