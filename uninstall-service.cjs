const Service = require('node-windows').Service;
const path = require('path');

// 서비스 객체 생성 (설치할 때와 동일한 설정)
const svc = new Service({
  name: 'Goalboard Server',
  script: path.join(__dirname, 'server', 'production.cjs'),
});

// 서비스 제거 이벤트 리스너
svc.on('uninstall', function() {
  console.log('✅ 서비스가 성공적으로 제거되었습니다.');
  console.log('');
  console.log('서비스를 다시 설치하려면:');
  console.log('  node install-service.js (관리자 권한)');
});

svc.on('alreadyuninstalled', function() {
  console.log('⚠️  서비스가 이미 제거되어 있거나 설치되지 않았습니다.');
});

svc.on('error', function(err) {
  console.error('❌ 오류 발생:', err);
});

// 서비스 제거 시작
console.log('========================================');
console.log('   Goalboard 서비스 제거');
console.log('========================================');
console.log('');
console.log('서비스를 중지하고 제거합니다...');
console.log('');
svc.uninstall();
