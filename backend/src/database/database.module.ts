import { Module, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({})
export class DatabaseModule implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      console.log('🔗 Connecting to PostgreSQL database...');
      const options = this.dataSource.options as any;
      console.log(`📍 Host: ${options.host}:${options.port}`);
      console.log(`🗄️  Database: ${options.database}`);
      console.log(`👤 User: ${options.username}`);
      
      // Test connection
      await this.dataSource.query('SELECT 1');
      console.log('✅ PostgreSQL database connected successfully!');
      
      // Log table count
      const tables = await this.dataSource.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log(`📊 Found ${tables[0].count} tables in database`);
      
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  }
} 