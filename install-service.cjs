const Service = require('node-windows').Service;
const path = require('path');

// 서비스 객체 생성
const svc = new Service({
  name: 'Goalboard Server',
  description: 'Goalboard 애플리케이션 백그라운드 서버',
  script: path.join(__dirname, 'server', 'production.cjs'),
  nodeOptions: [
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "production"
    },
    {
      name: "PORT",
      value: "80"
    },
    {
      name: "DATABASE_URL",
      value: "file:" + path.join(__dirname, 'prisma', 'dev.db').replace(/\\/g, '/')
    },
    {
      name: "GOOGLE_CLIENT_ID",
      value: "dummy_client_id"
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      value: "dummy_client_secret"
    },
    {
      name: "GOOGLE_CALLBACK_URL",
      value: "http://localhost/api/auth/google/callback"
    },
    {
      name: "SESSION_SECRET",
      value: "your-secret-key-here"
    }
  ]
});

// 서비스 설치 이벤트 리스너
svc.on('install', function() {
  console.log('✅ 서비스 설치 완료!');
  console.log('서비스를 시작합니다...');
  svc.start();
});

svc.on('alreadyinstalled', function() {
  console.log('⚠️  서비스가 이미 설치되어 있습니다.');
  console.log('서비스를 다시 설치하려면 먼저 uninstall-service.cjs를 실행하세요.');
});

svc.on('start', function() {
  console.log('✅ 서비스가 시작되었습니다!');
  console.log('');
  console.log('브라우저에서 다음 주소로 접속하세요:');
  console.log('  - 로컬: http://localhost');
  console.log('  - 네트워크: http://10.51.18.139');
  console.log('');
  console.log('서비스 관리:');
  console.log('  - 서비스 중지: services.msc에서 "Goalboard Server" 중지');
  console.log('  - 서비스 제거: node uninstall-service.cjs 실행 (관리자 권한)');
});

svc.on('error', function(err) {
  console.error('❌ 오류 발생:', err);
});

// 서비스 설치 시작
console.log('========================================');
console.log('   Goalboard 서비스 설치');
console.log('========================================');
console.log('');
console.log('서비스를 설치합니다...');
console.log('');
svc.install();
