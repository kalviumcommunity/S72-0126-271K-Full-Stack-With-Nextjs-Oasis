
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ],
  });

  console.log('Seed data inserted successfully');
}

main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
=======
import { PrismaClient, UserRole, TeamRole, ProjectStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: UserRole.ADMIN,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      role: UserRole.USER,
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      role: UserRole.USER,
    },
  });

  // Create a team
  const oasisTeam = await prisma.team.create({
    data: {
      name: 'Oasis Team',
      description: 'Core product team',
      members: {
        create: [
          {
            userId: alice.id,
            role: TeamRole.OWNER,
          },
          {
            userId: bob.id,
            role: TeamRole.MEMBER,
          },
          {
            userId: charlie.id,
            role: TeamRole.MEMBER,
          },
        ],
      },
    },
    include: {
      members: true,
    },
  });

  // Create a project for the team
  const project = await prisma.project.create({
    data: {
      name: 'Full Stack Next.js App',
      description: 'Internal project management tool',
      ownerId: alice.id,
      teamId: oasisTeam.id,
      status: ProjectStatus.ACTIVE,
    },
  });

  // Create tasks assigned to users under the project
  const task1 = await prisma.task.create({
    data: {
      title: 'Complete assignment',
      description: 'Finish the initial database schema and migrations',
      userId: alice.id,
      projectId: project.id,
      completed: false,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Review code',
      description: 'Review pull requests for the new API routes',
      userId: bob.id,
      projectId: project.id,
      completed: true,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Write documentation',
      description: 'Document the schema and API endpoints',
      userId: alice.id,
      projectId: project.id,
      completed: false,
    },
  });

  // Add comments to tasks
  await prisma.comment.createMany({
    data: [
      {
        body: 'Make sure to cover normalization details in the README.',
        taskId: task1.id,
        authorId: alice.id,
      },
      {
        body: 'Left a few suggestions in the PR.',
        taskId: task2.id,
        authorId: bob.id,
      },
      {
        body: 'I can help with the ER diagram.',
        taskId: task3.id,
        authorId: charlie.id,
      },
    ],
  });

  console.log('Database seeded successfully ✅');
}

main()
  .catch((e) => {
    console.error('Seeding error ❌', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

