import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DashboardService } from './dashboard.service';
import { ApiResponse, DashboardStats } from '../../common/types';

@Controller('/dashboard')
@UseInterceptors(CacheInterceptor)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @CacheTTL(300) // Cache lưu trữ kết quả trong 5 phút
  async getStats(): Promise<ApiResponse<DashboardStats>> {
    const stats = await this.dashboardService.getStats();
    return {
      data: stats,
      meta: {
        timestamp: new Date().toISOString(),
        cached: true
      }
    };
  }
}
