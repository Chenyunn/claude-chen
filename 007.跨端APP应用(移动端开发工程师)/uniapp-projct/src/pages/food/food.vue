<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Transaction, FoodCategoryStats } from '@/types';
import { getFoodStats, getFoodTransactions } from '@/api/food';

// 子分类定义
interface SubCategory {
  key: string;
  emoji: string;
  name: string;
}

const subCategories: SubCategory[] = [
  { key: 'all', emoji: '🍽️', name: '全部' },
  { key: 'breakfast', emoji: '🥐', name: '早餐' },
  { key: 'lunch', emoji: '🍱', name: '午餐' },
  { key: 'dinner', emoji: '🍲', name: '晚餐' },
  { key: 'takeout', emoji: '🥡', name: '外卖' },
  { key: 'snack', emoji: '🍿', name: '零食' },
  { key: 'drink', emoji: '🧋', name: '饮品' },
  { key: 'social', emoji: '🥂', name: '聚餐' },
];

// 状态
const selectedSubCategory = ref('all');
const sortBy = ref<'date' | 'amount'>('date');
const sortDirection = ref<'asc' | 'desc'>('desc');
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const hasMore = ref(true);

// 统计数据
const totalAmount = ref(0);
const totalCount = ref(0);
const averageAmount = ref(0);
const previousAmount = ref(0);
const categoryStats = ref<FoodCategoryStats[]>([]);

// 交易列表
const transactions = ref<Transaction[]>([]);

// 分组后的交易
const groupedTransactions = computed(() => {
  let filtered = transactions.value;

  // 子分类筛选
  if (selectedSubCategory.value !== 'all') {
    filtered = filtered.filter(
      t => t.note?.toLowerCase().includes(selectedSubCategory.value)
    );
  }

  // 排序
  filtered = [...filtered].sort((a, b) => {
    if (sortBy.value === 'date') {
      return sortDirection.value === 'desc'
        ? b.date.localeCompare(a.date)
        : a.date.localeCompare(b.date);
    } else {
      return sortDirection.value === 'desc'
        ? b.amount - a.amount
        : a.amount - b.amount;
    }
  });

  // 按日期分组
  const grouped: Record<string, Transaction[]> = {};
  filtered.forEach(t => {
    const date = t.date.split(' ')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(t);
  });

  // 计算每天总额，并按日期降序排序
  const sortedEntries = Object.entries(grouped).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  return sortedEntries.map(([date, items]) => {
    const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
    return {
      date,
      transactions: items,
      dayTotal: dayTotal,
    };
  });
});

// 子分类背景色
function getSubIconBg(subKey: string): string {
  const colors: Record<string, string> = {
    breakfast: '#B5EAD7',
    lunch: '#FFB6C1',
    dinner: '#FFDAB9',
    takeout: '#FFF0F5',
    snack: '#E2D1F9',
    drink: '#FFB7A5',
    social: '#FFF8DC',
  };
  return colors[subKey] || '#F0F0F0';
}

function getBreakdownBarColor(index: number): string {
  const colors = [
    '#FFB6C1',
    '#FF8C9A',
    '#E8B4BC',
    '#FFB7A5',
    '#B5EAD7',
    '#E2D1F9',
  ];
  return colors[index] || '#CCCCCC';
}

// 格式化百分比变化
function getPercentageChange(current: number, previous: number): {
  percentage: number;
  isUp: boolean;
} {
  if (previous === 0) {
    return { percentage: 0, isUp: true };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    percentage: Math.abs(Math.round(change * 10) / 10),
    isUp: change > 0,
  };
}

const change = computed(() =>
  getPercentageChange(totalAmount.value, previousAmount.value)
);

// 获取子分类名称
function getSubCategoryName(key: string): string {
  const found = subCategories.find(c => c.key === key);
  return found ? found.name : key;
}

// 格式化日期
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `今天 <span class="date-detail">${date.getMonth() + 1}月${date.getDate()}日</span>`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 <span class="date-detail">${date.getMonth() + 1}月${date.getDate()}日</span>`;
  }

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${date.getMonth() + 1}月${date.getDate()}日 <span class="date-detail">${weekday}</span>`;
}

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// 加载数据
async function loadData(reset: boolean = false) {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;

  loading.value = true;

  try {
    // 加载统计数据
    const statsRes = await getFoodStats();
    if (statsRes.data) {
      totalAmount.value = statsRes.data.totalAmount || 0;
      totalCount.value = statsRes.data.totalCount || 0;
      averageAmount.value = statsRes.data.averageAmount || 0;
      previousAmount.value = statsRes.data.previousAmount || 0;
      categoryStats.value = statsRes.data.categoryStats || [];
    }

    // 加载交易列表
    const params = {
      page: reset ? 1 : page.value,
      pageSize: pageSize.value,
      subCategory: selectedSubCategory.value === 'all' ? undefined : selectedSubCategory.value,
      orderBy: sortBy.value,
      orderDirection: sortDirection.value,
    };

    const transRes = await getFoodTransactions(params);
    if (reset) {
      transactions.value = transRes.data.transactions || [];
    } else {
      transactions.value.push(...(transRes.data.transactions || []));
    }
    hasMore.value = transRes.data.hasMore || false;
    page.value = reset ? 2 : page.value + 1;
  } catch (err) {
    console.error('Failed to load food data:', err);
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

// 选择子分类
function selectSubCategory(key: string) {
  selectedSubCategory.value = key;
  loadData(true);
}

// 切换排序
function toggleSort(sort: 'date' | 'amount') {
  if (sortBy.value === sort) {
    sortDirection.value = sortDirection.value === 'desc' ? 'asc' : 'desc';
  } else {
    sortBy.value = sort;
    sortDirection.value = 'desc';
  }
  loadData(true);
}

// 跳转首页添加餐饮
function goToAddFood() {
  uni.switchTab({
    url: '/pages/index/index',
  });
}

// 加载更多
function loadMore() {
  if (!loading.value && hasMore.value) {
    loadData();
  }
}

onMounted(() => {
  loadData(true);
});
</script>

<template>
  <view class="page-container">
    <!-- Page Header -->
    <view class="page-header">
      <view class="header-left">
        <view class="header-title-group">
          <text class="page-title">🍜 餐饮</text>
          <text class="page-subtitle body-sm">每一餐都值得被记录</text>
        </view>
      </view>
      <view class="header-right">
        <button class="icon-btn" @click="goToAddFood">
          <text class="material-icon">add_circle</text>
        </button>
      </view>
    </view>

    <!-- Dining Summary Cards -->
    <view class="summary-row">
      <view class="summary-card">
        <view class="summary-card-icon">
          <text class="material-icon">calendar_month</text>
        </view>
        <view class="summary-card-body">
          <text class="summary-label label-md">本月餐饮</text>
          <text class="summary-value">¥{{ formatAmount(totalAmount) }}</text>
          <text
            class="summary-trend"
            :class="{ up: change.isUp, down: !change.isUp }"
          >
            较上月 {{ change.isUp ? '+' : '-' }}{{ change.percentage }}%
          </text>
        </view>
      </view>
      <view class="summary-card">
        <view class="summary-card-icon accent">
          <text class="material-icon">lunch_dining</text>
        </view>
        <view class="summary-card-body">
          <text class="summary-label label-md">本月笔数</text>
          <text class="summary-value">{{ totalCount }} 笔</text>
          <text class="summary-trend down">日均 {{ (totalCount / 30).toFixed(1) }} 笔</text>
        </view>
      </view>
      <view class="summary-card">
        <view class="summary-card-icon">
          <text class="material-icon">avg_time</text>
        </view>
        <view class="summary-card-body">
          <text class="summary-label label-md">笔均消费</text>
          <text class="summary-value">¥{{ formatAmount(averageAmount) }}</text>
          <text
            class="summary-trend"
            :class="{ down: change.percentage > 0 }"
          >
            较上月 {{ change.percentage > 0 ? '-' : '+' }}{{ change.percentage }}%
          </text>
        </view>
      </view>
    </view>

    <!-- Sub-Category Quick Filter -->
    <view class="sub-category-section">
      <text class="section-title h3">餐饮分类</text>
      <view class="sub-category-grid">
        <view
          v-for="cat in subCategories"
          :key="cat.key"
          class="sub-category-item"
          :class="{ active: selectedSubCategory === cat.key }"
          @click="selectSubCategory(cat.key)"
        >
          <text class="sub-icon">{{ cat.emoji }}</text>
          <span>{{ cat.name }}</span>
        </view>
      </view>
    </view>

    <!-- Sub-Category Spending Breakdown -->
    <view class="breakdown-section">
      <text class="section-title h3">消费分布</text>
      <view class="breakdown-list">
        <view
          v-for="(stat, index) in categoryStats"
          :key="stat.subCategory"
          class="breakdown-item"
        >
          <view class="breakdown-left">
            <text class="breakdown-emoji">
              {{ getSubCategoryName(stat.subCategory).match(/[\p{Emoji}]/u)?.[0] || '🍽️' }}
            </text>
            <view class="breakdown-info">
              <text class="breakdown-name">{{ getSubCategoryName(stat.subCategory) }}</text>
              <view class="breakdown-bar-wrapper">
                <view
                  class="breakdown-bar"
                  :style="{ width: stat.percentage + '%', backgroundColor: getBreakdownBarColor(index) }"
                ></view>
              </view>
            </view>
          </view>
          <view class="breakdown-right">
            <text class="breakdown-amount">¥{{ formatAmount(stat.amount) }}</text>
            <text class="breakdown-percent">{{ Math.round(stat.percentage) }}%</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Recent Dining Transactions -->
    <view class="transaction-section">
      <view class="section-header">
        <text class="section-title h3">餐饮记录</text>
        <view class="sort-selector">
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'date' }"
            @click="toggleSort('date')"
          >
            最新
          </button>
          <button
            class="sort-btn"
            :class="{ active: sortBy === 'amount' }"
            @click="toggleSort('amount')"
          >
            金额
          </button>
        </view>
      </view>

      <view
        v-for="group in groupedTransactions"
        :key="group.date"
        class="date-group"
      >
        <view class="date-header">
          <text class="date-title" v-html="formatDateDisplay(group.date)"></text>
          <text class="day-total">小计: ¥{{ formatAmount(group.dayTotal) }}</text>
        </view>

        <view class="food-list">
          <view
            v-for="transaction in group.transactions"
            :key="transaction.id"
            class="food-item"
          >
            <view
              class="food-icon"
              :style="{ backgroundColor: transaction.note ? getSubIconBg(transaction.note) : '#FFB6C1' }"
            >
              {{ transaction.category?.icon || '🍽️' }}
            </view>
            <view class="food-info">
              <view class="food-top">
                <text class="food-name">{{ transaction.note || transaction.category?.name || '餐饮' }}</text>
                <text class="food-amount">-¥{{ formatAmount(transaction.amount) }}</text>
              </view>
              <view class="food-bottom">
                <text class="food-meta">
                  {{ transaction.note ? getSubCategoryName(transaction.note) : '餐饮' }}
                </text>
                <text class="food-payment">{{ transaction.account?.name }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- Load More -->
      <view class="load-more" v-if="hasMore">
        <button
          class="btn btn-secondary"
          :disabled="loading"
          @click="loadMore"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </view>

      <!-- Empty State -->
      <view
        class="empty-state"
        v-if="groupedTransactions.length === 0 && !loading"
      >
        <text class="empty-text body-sm text-outline">暂无餐饮记录</text>
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);

  &:active {
    background: rgba(255, 183, 197, 0.2);
    color: var(--color-primary);
  }

  .material-icon {
    font-size: 20px;
  }
}

.header-title-group .page-title {
  font-size: 24px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.header-title-group .page-subtitle {
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
  margin-top: 2px;
}

.header-right {
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: none;
    background: var(--color-primary-container);
    border-radius: var(--radius-full);
    color: var(--color-on-primary-container);
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 12px rgba(134, 78, 90, 0.2);

    &:active {
      transform: scale(0.95);
    }

    .material-icon {
      font-size: 24px;
    }
  }
}

/* Summary Row */
.summary-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.summary-card {
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);

  &:active {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(201, 184, 232, 0.2);
  }
}

.summary-card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;

  &.accent {
    background: var(--color-secondary-container);
  }

  .material-icon {
    font-size: 20px;
    color: var(--color-on-primary-container);
  }

  &.accent .material-icon {
    color: var(--color-on-secondary-container);
  }
}

.summary-card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 22px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

.summary-trend {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);

  &.up {
    color: var(--color-error);
  }

  &.down {
    color: #2E7D32;
  }
}

/* Section Title */
.section-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  margin-bottom: var(--space-md);
}

/* Sub-Category Grid */
.sub-category-section {
  margin-bottom: var(--space-xl);
}

.sub-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.sub-category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-md) var(--space-sm);
  border: 2px solid transparent;
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:active {
    background: var(--color-pale-pink-white);
    border-color: var(--color-outline-variant);
  }

  &.active {
    background: var(--color-primary-container);
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(134, 78, 90, 0.2);
  }

  .sub-icon {
    font-size: 28px;
    transition: all var(--transition-fast);
  }

  &.active .sub-icon {
    transform: scale(1.1);
  }

  span:last-child {
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-on-surface-variant);
  }

  &.active span:last-child {
    color: var(--color-on-primary-container);
    font-weight: var(--font-weight-semibold);
  }
}

/* Breakdown Section */
.breakdown-section {
  margin-bottom: var(--space-xl);
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  box-shadow: var(--shadow-card);
}

.breakdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
  padding: var(--space-xs) 0;
}

.breakdown-left {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex: 1;
  min-width: 0;
}

.breakdown-emoji {
  font-size: 24px;
  flex-shrink: 0;
}

.breakdown-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.breakdown-name {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-on-surface);
}

.breakdown-bar-wrapper {
  width: 100%;
  height: 6px;
  background: var(--color-surface-container);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.breakdown-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 600ms ease-out;
}

.breakdown-right {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-shrink: 0;
}

.breakdown-amount {
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
}

.breakdown-percent {
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-medium);
  color: var(--color-outline);
  min-width: 32px;
  text-align: right;
}

/* Transaction Section */
.transaction-section {
  margin-bottom: var(--space-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);

  .section-title {
    margin-bottom: 0;
  }
}

.sort-selector {
  display: flex;
  background: var(--color-surface-container);
  padding: 3px;
  border-radius: var(--radius-full);
}

.sort-btn {
  padding: var(--space-xs) var(--space-md);
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-family: inherit;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.active {
    background: var(--color-surface-container-lowest);
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
}

/* Date Groups */
.date-group {
  margin-bottom: var(--space-lg);
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
  padding: 0 var(--space-xs);

  .date-title {
    font-size: var(--font-size-body-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-on-surface);

    .date-detail {
      font-weight: var(--font-weight-regular);
      color: var(--color-outline);
      margin-left: var(--space-xs);
    }
  }

  .day-total {
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-outline);
  }
}

/* Food Item List */
.food-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.food-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(201, 184, 232, 0.2);
  }
}

.food-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.food-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-sm);
}

.food-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.food-amount {
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-error);
  flex-shrink: 0;
}

.food-bottom {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.food-meta {
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
}

.food-payment {
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  background: var(--color-surface-container);
  padding: 1px 8px;
  border-radius: var(--radius-full);
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-lg) 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-xxl) 0;
}

/* Responsive */
@media (max-width: 768px) {
  .summary-row {
    grid-template-columns: 1fr;
    gap: var(--space-sm);
  }

  .summary-card {
    flex-direction: row;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
  }

  .sub-category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-xs);
  }

  .sub-category-item {
    padding: var(--space-sm);
    border-radius: var(--radius-lg);
  }

  .sub-category-item .sub-icon {
    font-size: 24px;
  }

  .sub-category-item span:last-child {
    font-size: 11px;
  }

  .food-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .food-item {
    padding: var(--space-sm) var(--space-md);
  }

  .breakdown-list {
    padding: var(--space-md);
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .header-title-group .page-title {
    font-size: 20px;
  }

  .sub-category-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .sub-category-item {
    padding: var(--space-xs);
  }

  .sub-category-item .sub-icon {
    font-size: 22px;
  }

  .sub-category-item span:last-child {
    font-size: 10px;
  }

  .breakdown-percent {
    display: none;
  }

  .food-name {
    font-size: var(--font-size-body-sm);
  }

  .food-amount {
    font-size: var(--font-size-body-sm);
  }

  .food-payment {
    display: none;
  }
}

@media (max-width: 340px) {
  .sub-category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
