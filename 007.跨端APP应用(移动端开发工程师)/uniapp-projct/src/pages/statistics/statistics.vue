<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { StatisticsSummary, TrendPoint, CategoryShare } from '@/types';
import { getStatistics } from '@/api/statistics';

// 统计周期
type Period = 'month' | 'quarter' | 'year';

// 状态
const period = ref<Period>('month');
const loading = ref(false);

// 数据
const summary = ref<StatisticsSummary>({
  totalExpense: 0,
  totalIncome: 0,
  topCategory: null,
});
const trend = ref<TrendPoint[]>([]);
const shares = ref<CategoryShare[]>([]);

// 颜色数组
const colors = ['#864e5a', '#655781', '#9b4053', '#deccfd', '#FFB6C1', '#B5EAD7', '#E2D1F9', '#FFB7A5'];

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// 获取当前周期文本
function getPeriodTitle(): string {
  const now = new Date();
  if (period.value === 'month') {
    return `${now.getFullYear()}年${now.getMonth() + 1}月`;
  } else if (period.value === 'quarter') {
    const quarter = Math.floor((now.getMonth() + 3) / 3);
    return `${now.getFullYear()}年 Q${quarter}`;
  } else {
    return `${now.getFullYear()}年`;
  }
}

// 获取颜色
function getColor(index: number): string {
  return colors[index % colors.length];
}

// 计算饼图路径 - 使用SVG原生扇形
function getPiePath(percentage: number, startAngle: number): string {
  const radius = 40;
  const centerX = 50;
  const centerY = 50;

  const endAngle = startAngle + (percentage / 100) * 360;
  const startRad = (startAngle - 90) * Math.PI / 180;
  const endRad = (endAngle - 90) * Math.PI / 180;

  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);

  const largeArc = percentage > 50 ? 1 : 0;

  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} ${largeArc} 1 ${x2} ${y2} Z`;
}

// 计算累计起始角度
function getStartAngle(index: number): number {
  let angle = 0;
  for (let i = 0; i < index; i++) {
    angle += shares.value[i].percentage;
  }
  return angle * 360 / 100;
}

// 生成趋势图路径
function generateTrendPath() {
  if (trend.value.length < 2) {
    return { linePath: '', areaPath: '' };
  }

  const width = 400;
  const height = 150;
  const padding = 10;

  const maxAmount = Math.max(...trend.value.map(t => t.amount));
  const minAmount = Math.min(...trend.value.map(t => t.amount));
  const range = maxAmount - minAmount || 1;

  const points = trend.value.map((t, i) => {
    const x = padding + (i / (trend.value.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((t.amount - minAmount) / range) * (height - 2 * padding);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return { linePath, areaPath };
}

// 切换周期
function selectPeriod(p: Period) {
  period.value = p;
  loadData();
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res = await getStatistics(period.value);
    if (res.data) {
      summary.value = res.data.summary;
      trend.value = res.data.trend || [];
      shares.value = res.data.shares || [];
    }
  } catch (err) {
    console.error('Failed to load statistics:', err);
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

const trendPaths = computed(() => generateTrendPath());

onMounted(() => {
  loadData();
});
</script>

<template>
  <view class="page-container">
    <!-- Page Header -->
    <view class="page-header">
      <view class="header-top">
        <view>
          <text class="page-title h2">财务洞察</text>
          <text class="page-subtitle body-sm">正在查看 {{ getPeriodTitle() }} 的数据分析</text>
        </view>
        <view class="header-actions">
          <view class="period-toggle">
            <button
              class="period-btn"
              :class="{ active: period === 'month' }"
              @click="selectPeriod('month')"
            >
              按月
            </button>
            <button
              class="period-btn"
              :class="{ active: period === 'quarter' }"
              @click="selectPeriod('quarter')"
            >
              按季
            </button>
            <button
              class="period-btn"
              :class="{ active: period === 'year' }"
              @click="selectPeriod('year')"
            >
              按年
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- Summary Cards -->
    <view class="summary-section">
      <view class="summary-cards">
        <view class="summary-card">
          <text class="summary-label label-md">总支出</text>
          <view class="summary-value-row">
            <text class="summary-value">¥{{ formatAmount(summary.totalExpense) }}</text>
          </view>
        </view>
        <view class="summary-card">
          <text class="summary-label label-md">总收入</text>
          <view class="summary-value-row">
            <text class="summary-value income">¥{{ formatAmount(summary.totalIncome) }}</text>
          </view>
        </view>
        <view class="summary-card">
          <text class="summary-label label-md">支出大头</text>
          <view
            v-if="summary.topCategory"
            class="summary-category"
          >
            <view class="category-icon">
              {{ summary.topCategory.name }}
            </view>
            <span>{{ summary.topCategory.name }}</span>
          </view>
          <text v-else class="summary-value">暂无数据</text>
        </view>
      </view>
    </view>

    <!-- Charts Section -->
    <view class="charts-section">
      <!-- Trend Chart -->
      <view class="chart-card trend-chart">
        <text class="chart-title h3">支出趋势图</text>
        <view class="chart-legend">
          <span class="legend-item">
            <span class="legend-dot primary"></span> 实际支出
          </span>
        </view>
        <view class="chart-area">
          <svg class="trend-svg" viewBox="0 0 400 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#864e5a;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#864e5a;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path
              v-if="trendPaths.areaPath"
              class="trend-area"
              :d="trendPaths.areaPath"
              fill="url(#trendGradient)"
            />
            <path
              v-if="trendPaths.linePath"
              class="trend-line"
              :d="trendPaths.linePath"
              fill="none"
              stroke="#864e5a"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
          <view class="chart-labels" v-if="trend.length > 0">
            <span>{{ trend[0]?.date.slice(5) }}</span>
            <span>{{ trend[Math.floor(trend.length / 4)]?.date.slice(5) }}</span>
            <span>{{ trend[Math.floor(trend.length / 2)]?.date.slice(5) }}</span>
            <span>{{ trend[Math.floor(trend.length * 3 / 4)]?.date.slice(5) }}</span>
            <span>{{ trend[trend.length - 1]?.date.slice(5) }}</span>
          </view>
        </view>
      </view>

      <!-- Pie Chart -->
      <view class="chart-card pie-chart">
        <text class="chart-title h3">分类支出占比</text>
        <view class="pie-container">
          <svg class="pie-svg" viewBox="0 0 100 100">
            <path
              v-for="(share, index) in shares"
              :key="share.categoryId"
              :d="getPiePath(share.percentage, getStartAngle(index))"
              :fill="getColor(index)"
              fill-opacity="0.85"
            />
          </svg>
          <view class="pie-center">
            <span class="pie-label">总计</span>
            <span class="pie-value">¥{{ Math.round(summary.totalExpense / 1000) }}k</span>
          </view>
        </view>
        <view class="pie-legend">
          <view
            v-for="(share, index) in shares"
            :key="share.categoryId"
            class="legend-row"
          >
            <span
              class="legend-dot"
              :style="{ backgroundColor: getColor(index) }"
            ></span>
            <span class="legend-name">{{ share.categoryName }}</span>
            <span class="legend-percent">{{ Math.round(share.percentage) }}%</span>
          </view>
        </view>
      </view>
    </view>

    <!-- Details Section -->
    <view class="details-section">
      <view class="detail-card">
        <text class="chart-title h3">支出排行</text>
        <view class="detail-list">
          <view
            v-for="(share, index) in shares"
            :key="share.categoryId"
            class="detail-item"
          >
            <view
              class="detail-icon"
              :style="{ backgroundColor: getColor(index) + '33' }"
            >
              {{ share.categoryName.slice(0, 2) }}
            </view>
            <view class="detail-info">
              <span class="detail-name">{{ share.categoryName }}</span>
              <span class="detail-desc">{{ Math.round(share.percentage) }}% 占比</span>
            </view>
            <view class="detail-value">
              <span class="detail-amount">¥{{ formatAmount(share.amount) }}</span>
              <div class="detail-bar">
                <div
                  class="detail-bar-fill"
                  :style="{ width: share.percentage + '%', backgroundColor: getColor(index) }"
                ></div>
              </div>
            </view>
          </view>
        </view>

        <view
          class="empty-state"
          v-if="shares.length === 0 && !loading"
        >
          <text class="empty-text body-sm text-outline">暂无支出数据</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/design-system.css';

.page-container {
  padding: var(--space-md);
  padding-bottom: calc(var(--layout-bottom-nav-height) + var(--space-md) + var(--safe-bottom));
}

/* Page Header */
.page-header {
  margin-bottom: var(--space-xl);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
}

.page-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.page-subtitle {
  color: var(--color-outline);
  margin-top: var(--space-xs);
}

.header-actions {
  display: flex;
  gap: var(--space-md);
}

.period-toggle {
  display: flex;
  background: var(--color-surface-container-low);
  padding: 4px;
  border-radius: var(--radius-lg);
}

.period-btn {
  padding: var(--space-xs) var(--space-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);

  &:active {
    color: var(--color-on-surface);
  }

  &.active {
    background: var(--color-surface-container-lowest);
    color: var(--color-primary);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

/* Summary Section */
.summary-section {
  margin-bottom: var(--space-xl);
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.summary-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.summary-label {
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  text-transform: uppercase;
}

.summary-value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
}

.summary-value {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);

  &.income {
    color: var(--color-secondary);
  }
}

.summary-category {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.category-icon {
  width: 40px;
  height: 40px;
  background: var(--color-primary-container);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

/* Charts Section */
.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.chart-card {
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.chart-title {
  font-size: var(--font-size-h3);
  margin-bottom: var(--space-md);
}

.chart-legend {
  display: flex;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.primary {
    background: var(--color-primary);
  }

  &.secondary {
    background: var(--color-secondary);
  }
}

/* Trend Chart */
.chart-area {
  position: relative;
  height: 180px;
}

.trend-svg {
  width: 100%;
  height: 150px;
}

.trend-area {
  fill: url(#trendGradient);
}

.trend-line {
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* Pie Chart */
.pie-container {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto var(--space-lg);
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.pie-label {
  display: block;
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
}

.pie-value {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.legend-row {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Details Section */
.details-section {
  margin-bottom: var(--space-xl);
}

.detail-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-lg);
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  flex-shrink: 0;
}

.detail-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-desc {
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
}

.detail-value {
  text-align: right;
}

.detail-bar {
  width: 80px;
  height: 4px;
  background: var(--color-surface-container-highest);
  border-radius: 2px;
  margin-top: var(--space-xs);
  overflow: hidden;
}

.detail-bar-fill {
  height: 100%;
  border-radius: 2px;
}

.empty-state {
  text-align: center;
  padding: var(--space-xl) 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--space-md);
    padding-bottom: calc(var(--layout-bottom-nav-height) + var(--space-md) + var(--safe-bottom));
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .header-actions {
    width: 100%;
  }

  .period-toggle {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
  }

  .chart-card {
    padding: var(--space-md);
  }

  .pie-container {
    padding: 0;
  }
}
</style>
