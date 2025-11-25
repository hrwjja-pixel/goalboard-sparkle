@echo off
echo ========================================
echo   Goalboard 서버 시작
echo ========================================
echo.

cd /d %~dp0

echo [1/3] 프로젝트 빌드 중...
call npm run build

echo.
echo [2/3] 서버 시작 중...
echo.
echo 브라우저에서 다음 주소로 접속하세요:
echo   - 로컬: http://localhost:3001
echo   - 네트워크: http://10.51.18.139:3001
echo.
echo 서버를 종료하려면 Ctrl+C를 누르세요.
echo.

call npm start
