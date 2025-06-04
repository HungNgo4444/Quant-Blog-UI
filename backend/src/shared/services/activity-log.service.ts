import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../../entities/activity-log.entity';

export interface LogActivityDto {
  userId?: string;
  type: ActivityType;
  description?: string;
  ipAddress: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async log(data: LogActivityDto): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      userId: data.userId,
      type: data.type,
      description: data.description,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      metadata: data.metadata,
    });

    return this.activityLogRepository.save(log);
  }

  async getUserActivities(
    userId: string,
    limit = 50,
    offset = 0,
  ): Promise<{ activities: ActivityLog[]; total: number }> {
    const [activities, total] = await this.activityLogRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return { activities, total };
  }

  async getActivityStats(userId?: string): Promise<Record<ActivityType, number>> {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .select('log.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.type');

    if (userId) {
      query.where('log.userId = :userId', { userId });
    }

    const results = await query.getRawMany();
    
    const stats: Record<ActivityType, number> = {} as Record<ActivityType, number>;
    
    // Initialize all activity types with 0
    Object.values(ActivityType).forEach(type => {
      stats[type] = 0;
    });
    
    // Fill in actual counts
    results.forEach(result => {
      stats[result.type as ActivityType] = parseInt(result.count, 10);
    });

    return stats;
  }

  async getRecentActivities(limit = 100): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }

  async deleteOldLogs(daysToKeep = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    await this.activityLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();
  }
} 