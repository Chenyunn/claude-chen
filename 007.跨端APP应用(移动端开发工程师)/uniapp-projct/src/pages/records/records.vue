<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { Transaction, Category } from '@/types';
import { getTransactions, getMonthlyStats } from '@/api/transaction';
import { getCategories } from '@/api/category';

// 状态
const searchKeyword = ref('');
const selectedCategoryId = ref<number | null>(null);
const page = ref(1);
const pageSize = ref(20);
const loading = ref(false);
const hasMore = ref(true);
const totalExpense = ref(0);
const totalIncome = ref(0);
const prevExpense = ref(0);
const prevIncome = ref(0);

// 列表数据
const categories = ref<Category[]>([]);
const transactions = ref<Transaction[]>([]);
const groupedTransactions = computed(() => {
  const grouped: Record<string, Transaction[]> = {};

  // 按日期分组
  transactions.value.forEach(t => {
    const date = t.date.split(' ')[0];
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(t);
  });

  // 计算每天的总额，并按日期降序排序
  const sortedEntries = Object.entries(grouped).sort((a, b) =>
    b[0].localeCompare(a[0])
  );

  const result = sortedEntries.map(([date, items]) => {
    const dayExpense = items
      .filter(i => i.type === 'expense')
      .reduce((sum, i) => sum + i.amount, 0);
    return {
      date,
      transactions: items,
      dayExpense,
    };
  });

  return result;
});

// 预定义分类筛选
const filterChips = computed(() => {
  const all = [{ id: null, name: '全部分类' }];
  return [...all, ...categories.value.slice(0, 3)];
});

// 默认分类背景色
function getCategoryBg(icon: string): string {
  if (icon.includes('🍜')) return '#FFB6C1';
  if (icon.includes('🛒')) return '#FFF0F5';
  if (icon.includes('🚗')) return '#B5EAD7';
  if (icon.includes('🏠')) return '#FFF8DC';
  if (icon.includes('🎮')) return '#E2D1F9';
  if (icon.includes('💊')) return '#FFB7A5';
  if (icon.includes('📱')) return '#A8D8EA';
  if (icon.includes('📦')) return '#E5E5EA';
  if (icon.includes('💰')) return '#B5EAD7';
  return '#F0F0F0';
}

// 格式化金额
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// 格式化日期显示
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (date.toDateString() === today.toDateString()) {
    return `今天 <span class="date-detail">${month}月${day}日</span>`;
  } else if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 <span class="date-detail">${month}月${day}日</span>`;
  }

  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日 <span class="date-detail">${weekday}</span>`;
}

// 计算变化百分比
function getChange(current: number, previous: number): { percentage: number; isUp: boolean } {
  if (previous === 0) {
    return { percentage: 0, isUp: true };
  }
  const change = ((current - previous) / previous) * 100;
  return {
    percentage: Math.abs(Math.round(change)),
    isUp: change > 0,
  };
}

const expenseChange = computed(() =>
  getChange(totalExpense.value, prevExpense.value)
);
const incomeChange = computed(() =>
  getChange(totalIncome.value, prevIncome.value)
);

// 加载数据
async function loadData(reset: boolean = false) {
  if (loading.value) return;
  if (!hasMore.value && !reset) return;

  loading.value = true;

  try {
    // 加载分类
    const catRes = await getCategories();
    categories.value = catRes.data || [];

    // 加载月度统计
    const statsRes = await getMonthlyStats();
    if (statsRes.data) {
      totalExpense.value = statsRes.data.totalExpense || 0;
      totalIncome.value = statsRes.data.totalIncome || 0;
      prevExpense.value = statsRes.data.previousExpense || 0;
      prevIncome.value = statsRes.data.previousIncome || 0;
    }

    // 加载交易列表
    const params: any = {
      page: reset ? 1 : page.value,
      pageSize: pageSize.value,
    };
    if (searchKeyword.value) {
      params.search = searchKeyword.value;
    }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value;
    }

    const transRes = await getTransactions(params);
    if (reset) {
      transactions.value = transRes.data.data || [];
    } else {
      transactions.value.push(...(transRes.data.data || []));
    }
    hasMore.value = transRes.data.hasMore || false;
    page.value = reset ? 2 : page.value + 1;
  } catch (err) {
    console.error('Failed to load transactions:', err);
    uni.showToast({
      title: '加载失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
}

// 选择分类筛选
function selectFilter(categoryId: number | null) {
  selectedCategoryId.value = categoryId;
  loadData(true);
}

// 刷新数据
function onRefresh() {
  loadData(true);
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
      <view class="header-top">
        <text class="page-title h2">交易明细</text>
      </view>

      <!-- Summary Cards -->
      <view class="summary-cards">
        <view class="summary-card">
          <view class="summary-info">
            <text class="summary-label body-sm">本月总支出</text>
            <text class="summary-value expense">
              -¥{{ formatAmount(totalExpense) }}
            </text>
          </view>
          <view
            class="summary-badge"
            :class="{ up: expenseChange.isUp, down: !expenseChange.isUp }"
          >
            较上月 {{ expenseChange.isUp ? '+' : '-' }}{{ expenseChange.percentage }}%
          </view>
        </view>
        <view class="summary-card">
          <view class="summary-info">
            <text class="summary-label body-sm">本月总收入</text>
            <text class="summary-value income">
              +¥{{ formatAmount(totalIncome) }}
            </text>
          </view>
          <view
            class="summary-badge"
            :class="{ up: incomeChange.isUp, down: !incomeChange.isUp }"
          >
            较上月 {{ incomeChange.isUp ? '+' : '-' }}{{ incomeChange.percentage }}%
          </view>
        </view>
      </view>

      <!-- Search & Filters -->
      <view class="search-filters">
        <view class="search-box">
          <text class="material-icon">search</text>
          <input
            v-model="searchKeyword"
            type="text"
            placeholder="搜索交易、商户或备注..."
            @confirm="onRefresh"
          />
        </view>
        <view class="filter-chips">
          <button
            v-for="chip in filterChips"
            :key="chip.id ?? 0"
            class="filter-chip"
            :class="{ active: selectedCategoryId === chip.id }"
            @click="selectFilter(chip.id)"
          >
            {{ chip.name }}
          </button>
        </view>
      </view>
    </view>

    <!-- Transaction List -->
    <view class="transaction-section">
      <view v-for="group in groupedTransactions" :key="group.date" class="date-group">
        <view class="date-header">
          <text class="date-title" v-html="formatDateDisplay(group.date)"></text>
          <text class="day-total">今日支出: -¥{{ formatAmount(group.dayExpense) }}</text>
        </view>

        <view class="transaction-list">
          <view
            v-for="transaction in group.transactions"
            :key="transaction.id"
            class="transaction-item"
          >
            <view
              class="transaction-icon"
              :style="{ backgroundColor: transaction.category ? getCategoryBg(transaction.category.icon) : '#E5E5EA' }"
            >
              {{ transaction.category?.icon }}
            </view>
            <view class="transaction-info">
              <text class="transaction-name">
                {{ transaction.note || transaction.category?.name || '交易' }}
              </text>
              <text class="transaction-meta">
                {{ transaction.account?.name }}
              </text>
            </view>
            <text
              class="transaction-amount"
              :class="{ expense: transaction.type === 'expense', income: transaction.type === 'income' }"
            >
              {{ transaction.type === 'expense' ? '-' : '+' }}¥{{ formatAmount(transaction.amount) }}
            </text>
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
        v-if="transactions.length === 0 && !loading"
      >
        <text class="empty-text body-sm text-outline">暂无交易记录</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/design-system.css';

.page-header {
  margin-bottom: var(--space-xl);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.page-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.summary-card {
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.summary-label {
  font-size: var(--font-size-body-sm);
  color: var(--color-on-surface-variant);
}

.summary-value {
  font-size: 24px;
  font-weight: var(--font-weight-bold);

  &.expense {
    color: var(--color-on-surface);
  }

  &.income {
    color: var(--color-primary);
  }
}

.summary-badge {
  font-size: 12px;
  font-weight: var(--font-weight-semibold);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);

  &.up {
    background: var(--color-error-container);
    color: var(--color-on-error-container);
  }

  &.down {
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
  }
}

/* Search & Filters */
.search-filters {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-container-low);
  border-radius: var(--radius-full);

  .material-icon {
    color: var(--color-outline);
  }

  input {
    flex: 1;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--font-size-body-sm);
    color: var(--color-on-surface);
  }
}

.filter-chips {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding-bottom: var(--space-xs);

  .filter-chip {
    padding: var(--space-xs) var(--space-md);
    background: var(--color-surface-container-low);
    border: none;
    border-radius: var(--radius-full);
    font-family: inherit;
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-on-surface-variant);
    cursor: pointer;
    white-space: nowrap;
    transition: all var(--transition-fast);

    &:active {
      background: var(--color-surface-container-high);
    }

    &.active {
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
  }
}

/* Transaction Section */
.transaction-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.date-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .date-title {
    font-size: var(--font-size-body-sm);
    font-weight: var(--font-weight-bold);
    color: var(--color-on-surface);

    .date-detail {
      font-weight: var(--font-weight-regular);
      color: var(--color-outline);
      margin-left: var(--space-xs);
    }
  }

  .day-total {
    font-size: var(--font-size-body-sm);
    color: var(--color-outline);
  }
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface-container-lowest);
  border: 1px solid transparent;
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);

  &:active {
    border-color: var(--color-outline-variant);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
}

.transaction-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.transaction-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.transaction-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-meta {
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transaction-amount {
  font-size: var(--font-size-body-lg);
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;

  &.expense {
    color: var(--color-on-surface);
  }

  &.income {
    color: var(--color-primary);
  }
}

/* Load More */
.load-more {
  display: flex;
  justify-content: center;
  padding: var(--space-xl) 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-xxl) 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: var(--space-md);
  }

  .summary-cards {
    grid-template-columns: 1fr;
  }

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .date-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-xs);
  }
}

@media (max-width: 480px) {
  .summary-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .summary-value {
    font-size: clamp(20px, 7vw, 24px);
  }
}

@media (max-width: 375px) {
  .transaction-item {
    gap: var(--space-sm);
    padding: var(--space-sm);
  }

  .transaction-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .transaction-amount {
    font-size: var(--font-size-body-md);
  }
}
</style>
