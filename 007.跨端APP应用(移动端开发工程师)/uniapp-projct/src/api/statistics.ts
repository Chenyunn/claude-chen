import { get } from '@/utils/api';
import type { StatisticsSummary, TrendPoint, CategoryShare } from '@/types';

/**
 * 获取统计数据
 */
export function getStatistics(period: 'month' | 'quarter' | 'year'): Promise<{
  data: {
    summary: StatisticsSummary;
    trend: TrendPoint[];
    shares: CategoryShare[];
  };
}> {
  return get('/statistics', { period });
}
