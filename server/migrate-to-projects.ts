import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToProjects() {
  console.log('🚀 Starting migration to multi-project structure...\n');

  try {
    // 1. Create default "WEHAGO H 개발센터" project
    console.log('📁 Creating default project: WEHAGO H 개발센터');

    // Get current settings for dashboard title/subtitle
    const titleSetting = await prisma.setting.findUnique({ where: { key: 'dashboardTitle' } });
    const subtitleSetting = await prisma.setting.findUnique({ where: { key: 'dashboardSubtitle' } });

    const defaultProject = await prisma.project.create({
      data: {
        name: 'WEHAGO H 개발센터',
        description: 'EMR개발본부 > WEHAGO H 개발센터',
        dashboardTitle: titleSetting?.value || 'WEHAGO H 목표 대시보드',
        dashboardSubtitle: subtitleSetting?.value || 'EMR개발본부 > WEHAGO H 개발센터',
      },
    });

    console.log(`✅ Created project: ${defaultProject.name} (ID: ${defaultProject.id})\n`);

    // 2. Update all existing Goals with projectId
    const goals = await prisma.goal.findMany();
    console.log(`📝 Migrating ${goals.length} goals...`);

    for (const goal of goals) {
      await prisma.goal.update({
        where: { id: goal.id },
        data: { projectId: defaultProject.id },
      });
    }
    console.log(`✅ Migrated ${goals.length} goals\n`);

    // 3. Update all existing Categories with projectId
    const categories = await prisma.category.findMany();
    console.log(`🏷️  Migrating ${categories.length} categories...`);

    for (const category of categories) {
      await prisma.category.update({
        where: { id: category.id },
        data: { projectId: defaultProject.id },
      });
    }
    console.log(`✅ Migrated ${categories.length} categories\n`);

    console.log('🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`  - Created project: ${defaultProject.name}`);
    console.log(`  - Migrated ${goals.length} goals`);
    console.log(`  - Migrated ${categories.length} categories`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateToProjects()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
