import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('데이터베이스에 샘플 데이터를 추가합니다...');

  // 카테고리 생성
  const serviceCategory = await prisma.category.upsert({
    where: { name: 'SERVICE' },
    update: {},
    create: {
      name: 'SERVICE',
      color: '#3b82f6',
    },
  });

  const aiCategory = await prisma.category.upsert({
    where: { name: 'AI' },
    update: {},
    create: {
      name: 'AI',
      color: '#8b5cf6',
    },
  });

  const operationsCategory = await prisma.category.upsert({
    where: { name: 'OPERATIONS' },
    update: {},
    create: {
      name: 'OPERATIONS',
      color: '#10b981',
    },
  });

  console.log('✓ 카테고리 생성 완료');

  // 샘플 목표 생성
  const goal1 = await prisma.goal.create({
    data: {
      title: '고객 서비스 개선',
      description: '고객 만족도를 높이기 위한 서비스 품질 개선',
      owner: '홍길동',
      categoryId: serviceCategory.id,
      progress: 60,
      size: 'large',
      startDate: '2025-01-01',
      dueDate: '2025-06-30',
      statusNote: '진행 중',
      order: 0,
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      title: 'AI 챗봇 개발',
      description: '고객 응대를 위한 AI 챗봇 시스템 구축',
      owner: '김철수',
      categoryId: aiCategory.id,
      progress: 40,
      size: 'medium',
      startDate: '2025-02-01',
      dueDate: '2025-08-31',
      statusNote: '설계 단계',
      order: 1,
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      title: '운영 자동화',
      description: '반복 작업 자동화로 효율성 향상',
      owner: '이영희',
      categoryId: operationsCategory.id,
      progress: 80,
      size: 'small',
      startDate: '2025-01-15',
      dueDate: '2025-04-30',
      statusNote: '거의 완료',
      order: 2,
    },
  });

  console.log('✓ 샘플 목표 생성 완료');
  console.log(`  - ${goal1.title}`);
  console.log(`  - ${goal2.title}`);
  console.log(`  - ${goal3.title}`);
  console.log('\n✅ 샘플 데이터 추가 완료!');
}

main()
  .catch((e) => {
    console.error('오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
