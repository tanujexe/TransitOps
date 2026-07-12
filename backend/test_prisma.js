const prisma = require('./src/config/database');

async function run() {
  try {
    const res = await prisma.vehicle.create({
      data: {
        registrationNumber: 'TEST-PLATE-123',
        model: 'Tata Super Ace',
        type: 'Mini Truck',
        capacityKg: 1000,
        odometer: 0,
        acquisitionCost: 500000.00,
        region: 'West India',
        status: 'AVAILABLE'
      }
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
