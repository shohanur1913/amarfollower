const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.platform.findMany({ select: { id: true, name: true, iconClass: true } })
  .then(r => { console.log(JSON.stringify(r, null, 2)); p.$disconnect(); })
  .catch(e => { console.error(e); p.$disconnect(); });
