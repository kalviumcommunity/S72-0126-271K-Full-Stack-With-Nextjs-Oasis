
import { prisma } from './lib/prisma';
import { UserRole, TeamRole } from '@prisma/client';

async function main() {
  console.log('🚀 Starting Prisma Transaction & Optimization Demo...\n');

  await runTransactions();
  await runRollback();
  await runOptimizations();
}

// 1. Understand Transactions & 2. Implement Transaction Rollbacks
async function runTransactions() {
  console.log('--- 1. Transaction Success Demo ---');
  const email = `owner-${Date.now()}@example.com`;
  
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create a User first (needed for TeamMember)
      const user = await tx.user.create({
        data: {
          name: 'Transaction Owner',
          email: email,
          role: UserRole.USER,
        },
      });

      // 2. Create a Team
      const team = await tx.team.create({
        data: {
          name: `Team Alpha ${Date.now()}`,
          description: 'A team created in a transaction',
        },
      });

      // 3. Add User to Team as Owner
      const member = await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: user.id,
          role: TeamRole.OWNER,
        },
      });

      return { user, team, member };
    });

    console.log('✅ Transaction Successful:', result);
  } catch (error) {
    console.error('❌ Transaction Failed:', error);
  }
  console.log('\n');
}

async function runRollback() {
  console.log('--- 2. Transaction Rollback Demo ---');
  const email = `fail-${Date.now()}@example.com`;

  try {
    await prisma.$transaction(async (tx) => {
      console.log('Attempting to create user...');
      const user = await tx.user.create({
        data: {
          name: 'Rollback User',
          email: email, 
          role: UserRole.USER,
        },
      });
      console.log('User created:', user.id);

      // Force an error: Try to create a team with a missing required field or conflicting unique constraint if we knew one
      // Here we'll throw an error explicitly to simulate failure logic
      console.log('Simulating an error...');
      throw new Error('Simulated Failure for Rollback');

      // Unreachable code
      // await tx.team.create({ ... }); 
    });
  } catch (error) {
    console.error('✅ Transaction correctly rolled back due to error:', (error as Error).message);
    
    // Verify rollback
    const userCheck = await prisma.user.findUnique({ where: { email } });
    if (!userCheck) {
      console.log('✅ Verification passed: User was NOT created in the database.');
    } else {
      console.error('❌ Verification failed: User WAS created despite rollback!');
    }
  }
  console.log('\n');
}

// 3. Optimize Queries
async function runOptimizations() {
  console.log('--- 3. Query Optimization Demo ---');

  // Clean up previous test data if needed, or just add new data
  // Batch Operations
  console.log('• Batch Insert (createMany)');
  const batchData = Array.from({ length: 5 }).map((_, i) => ({
    name: `Batch User ${i} - ${Date.now()}`,
    email: `batch${i}-${Date.now()}@example.com`,
  }));

  const batchResult = await prisma.user.createMany({
    data: batchData,
  });
  console.log(`  Inserted ${batchResult.count} users efficiently.`);

  // Inefficient Query (Over-fetching)
  console.log('• Inefficient Query (Select *)');
  const startAll = performance.now();
  const allUsers = await prisma.user.findMany({
    take: 5,
  });
  const endAll = performance.now();
  console.log(`  Fetched full objects in ${(endAll - startAll).toFixed(2)}ms`);

  // Optimized Query (Select specific fields)
  console.log('• Optimized Query (Select id, name)');
  const startOpt = performance.now();
  const partialUsers = await prisma.user.findMany({
    select: { id: true, name: true },
    take: 5,
  });
  const endOpt = performance.now();
  console.log(`  Fetched partial objects in ${(endOpt - startOpt).toFixed(2)}ms`);

  // Pagination
  console.log('• Pagination (skip/take)');
  const page1 = await prisma.user.findMany({
    skip: 0,
    take: 2,
    orderBy: { id: 'desc' },
    select: { id: true, name: true }
  });
  console.log('  Page 1:', page1);

  const page2 = await prisma.user.findMany({
    skip: 2,
    take: 2,
    orderBy: { id: 'desc' },
     select: { id: true, name: true }
  });
  console.log('  Page 2:', page2);
   console.log('\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
