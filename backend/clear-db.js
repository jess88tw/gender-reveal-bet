const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function clearAll() {
  const bets = await p.bet.deleteMany();
  const config = await p.revealConfig.deleteMany();
  const users = await p.user.deleteMany();
  console.log('已清空：');
  console.log('  Bets:', bets.count);
  console.log('  RevealConfig:', config.count);
  console.log('  Users:', users.count);
  await p.$disconnect();
}

clearAll();
