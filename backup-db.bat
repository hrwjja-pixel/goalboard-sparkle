@echo off
echo ========================================
echo   데이터베이스 백업
echo ========================================
echo.

cd /d %~dp0

REM 백업 폴더 생성
if not exist "backups" mkdir backups

REM 현재 날짜와 시간으로 백업 파일 이름 생성
set timestamp=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%

REM dev.db 백업
copy dev.db "backups\dev_%timestamp%.db"

echo.
echo 백업 완료: backups\dev_%timestamp%.db
echo.
pause
