import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database is healthy' })
  async databaseHealthCheck() {
    try {
      // Test database connection
      await this.dataSource.query('SELECT 1');
      
      // Get database info
      const dbInfo = await this.dataSource.query(`
        SELECT 
          version() as version,
          current_database() as database,
          current_user as user,
          inet_server_addr() as host,
          inet_server_port() as port
      `);

      return {
        status: 'ok',
        database: 'PostgreSQL',
        connected: true,
        timestamp: new Date().toISOString(),
        info: dbInfo[0],
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'PostgreSQL',
        connected: false,
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }

  @Get('database/tables')
  @ApiOperation({ summary: 'List database tables' })
  @ApiResponse({ status: 200, description: 'Database tables list' })
  async databaseTables() {
    try {
      const tables = await this.dataSource.query(`
        SELECT table_name, table_schema 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);

      const tableStats = await Promise.all(
        tables.map(async (table: any) => {
          const count = await this.dataSource.query(
            `SELECT COUNT(*) as count FROM ${table.table_name}`
          );
          return {
            name: table.table_name,
            schema: table.table_schema,
            rows: parseInt(count[0].count),
          };
        })
      );

      return {
        status: 'ok',
        totalTables: tables.length,
        tables: tableStats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
} 