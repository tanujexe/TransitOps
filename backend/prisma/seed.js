const prisma = require('../src/config/database');
const bcrypt = require('bcrypt');

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenance.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash('Password123', 12);

  // 3. Create Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Fleet Manager',
        email: 'manager@transitops.com',
        password: hashedPassword,
        role: 'FLEET_MANAGER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Dispatcher John',
        email: 'dispatcher@transitops.com',
        password: hashedPassword,
        role: 'DISPATCHER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Safety Officer Sarah',
        email: 'safety@transitops.com',
        password: hashedPassword,
        role: 'SAFETY_OFFICER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Financial Analyst Fiona',
        email: 'analyst@transitops.com',
        password: hashedPassword,
        role: 'FINANCIAL_ANALYST',
      },
    }),
  ]);

  console.log(`👤 Seeded ${users.length} users with password 'Password123'.`);

  // 4. Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        registrationNumber: 'MH-12-PQ-1234',
        model: 'Tata Ace Gold',
        type: 'Mini Truck',
        capacityKg: 750,
        odometer: 12000,
        acquisitionCost: 550000.00,
        region: 'West India',
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNumber: 'MH-14-XY-9876',
        model: 'Mahindra Bolero Pik-Up',
        type: 'Pickup Truck',
        capacityKg: 1200,
        odometer: 25000,
        acquisitionCost: 850000.00,
        region: 'West India',
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNumber: 'KA-01-AB-4567',
        model: 'Eicher Pro 2049',
        type: 'Light Truck',
        capacityKg: 3500,
        odometer: 45000,
        acquisitionCost: 1250000.00,
        region: 'South India',
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNumber: 'DL-01-CD-8901',
        model: 'Maruti Suzuki Super Carry',
        type: 'Mini Truck',
        capacityKg: 500,
        odometer: 8000,
        acquisitionCost: 480000.00,
        region: 'North India',
        status: 'AVAILABLE',
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNumber: 'DL-02-EF-3456',
        model: 'Tata T.16 Ultra',
        type: 'Heavy Truck',
        capacityKg: 10000,
        odometer: 60000,
        acquisitionCost: 2800000.00,
        region: 'North India',
        status: 'IN_SHOP', // Starts in maintenance
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNumber: 'KA-02-GH-7890',
        model: 'Ashok Leyland Dost',
        type: 'Pickup Truck',
        capacityKg: 1500,
        odometer: 110000,
        acquisitionCost: 720000.00,
        region: 'South India',
        status: 'RETIRED', // Starts retired
      },
    }),
  ]);

  console.log(`🚚 Seeded ${vehicles.length} vehicles.`);

  // 5. Create Drivers
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: 'Alex Kumar',
        licenseNumber: 'DL-1234567890123',
        licenseCategory: 'HMV',
        licenseExpiry: oneYearFromNow,
        phone: '+919876543210',
        safetyScore: 4.80,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'John Doe',
        licenseNumber: 'DL-9876543210987',
        licenseCategory: 'LMV',
        licenseExpiry: sixMonthsFromNow,
        phone: '+919123456789',
        safetyScore: 4.50,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Jane Smith',
        licenseNumber: 'DL-5555555555555',
        licenseCategory: 'LMV',
        licenseExpiry: oneYearFromNow,
        phone: '+919999999999',
        safetyScore: 4.90,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Expired License Driver',
        licenseNumber: 'DL-0000000000000',
        licenseCategory: 'LMV',
        licenseExpiry: oneMonthAgo,
        phone: '+918888888888',
        safetyScore: 3.50,
        status: 'AVAILABLE',
      },
    }),
    prisma.driver.create({
      data: {
        name: 'Suspended Driver Roy',
        licenseNumber: 'DL-1111111111111',
        licenseCategory: 'LMV',
        licenseExpiry: oneYearFromNow,
        phone: '+917777777777',
        safetyScore: 2.10,
        status: 'SUSPENDED',
      },
    }),
  ]);

  console.log(`👨‍✈️ Seeded ${drivers.length} drivers.`);

  console.log('✅ Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
