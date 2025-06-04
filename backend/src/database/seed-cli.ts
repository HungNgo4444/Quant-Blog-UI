import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { seed } from './seed';
import databaseConfig from '../config/database.config';

// Load environment variables
config();

async function runSeed() {
  console.log('🚀 Initializing database seeding...');

  const configService = new ConfigService();
  const dbConfig = databaseConfig();

  const dataSource = new DataSource(dbConfig as any);

  try {
    await dataSource.initialize();
    console.log('📦 Database connection established');

    await seed(dataSource);

    console.log('✨ Seeding completed successfully!');
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seed function
runSeed(); 