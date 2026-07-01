<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '@/store';
import type { Transaction, Category } from '@/types';
import { createTransaction } from '@/api/transaction';
import { getCategories } from '@/api/category';
import { getAccounts } from '@/api/account';
import { getRecentTransactions } from '@/api/transaction';

declare const uni: any;

const store = useStore() as Store<State>;

// 状态
const type = ref<'expense' | 'income'>('expense');
const amount = ref('');
const selectedCategoryId = ref<number>(0);
const selectedAccountId = ref<number>(1);
const date = ref('');
const note = ref('');
const loading = ref(false);

// 列表数据
const categories = ref<Category[]>([]);
const accounts = ref<any[]>([]);
const recentTransactions = ref<Transaction[]>([]);

// 用户信息
const user = computed(() => store.state.user);

// 默认选中的分类图标背景色
const categoryBgColors: Record<string, string> = {
  food: '#FFB6C1',
  shopping: '#FFF0F5',
  transport: '#B5EAD7',
  living: '#FFF8DC',
  entertainment: '#E2D1F9',
  medical: '#FFB7A5',
  communication: '#A8D8EA',
  other: '#E5E5EA',
};

function getCategoryBg(icon: string): string {
  // 从emoji判断分类
  if (icon.includes('🍜')) return '#FFB6C1';
  if (icon.includes('🛒')) return '#FFF0F5';
  if (icon.includes('🚗')) return '#B5EAD7';
  if (icon.includes('🏠')) return '#FFF8DC';
  if (icon.includes('🎮')) return '#E2D1F9';
  if (icon.includes('💊')) return '#FFB7A5';
  if (icon.includes('📱')) return '#A8D8EA';
  if (icon.includes('📦')) return '#E5E5EA';
  return '#F0F0F0';
}

// 获取今日日期
function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 初始化
async function loadData() {
  try {
    // 加载分类
    const catRes = await getCategories(type.value);
    categories.value = catRes.data || [];
    // 默认选中第一个
    if (categories.value.length > 0 && !selectedCategoryId.value) {
      selectedCategoryId.value = categories.value[0].id;
    }

    // 加载账户
    const accRes = await getAccounts();
    accounts.value = accRes.data || [];
    // 默认选中第一个
    if (accounts.value.length > 0 && !selectedAccountId.value) {
      selectedAccountId.value = accounts.value[0].id;
    }

    // 加载最近交易
    const transRes = await getRecentTransactions(3);
    recentTransactions.value = transRes.data || [];
  } catch (err) {
    console.error('Failed to load data:', err);
    uni.showToast({
      title: '加载数据失败',
      icon: 'none',
    });
  }
}

onMounted(() => {
  // 设置默认日期为今天
  date.value = getTodayDate();

  // 如果未登录跳登录页
  if (store.state.isAuthenticated) {
    loadData();
  } else {
      uni.reLaunch({
        url: '/pages/login/login',
      });
  }
});

// 切换类型
function toggleType(newType: 'expense' | 'income') {
  type.value = newType;
  // 重新加载对应分类
  getCategories(newType).then(res => {
    categories.value = res.data || [];
    if (categories.value.length > 0) {
      selectedCategoryId.value = categories.value[0].id;
    }
  });
}

// 选择分类
function selectCategory(category: Category) {
  // 如果已经选中了当前分类且是餐饮，跳转到餐饮详情页（和原网站行为一致
  if (category.id === selectedCategoryId.value && category.name === '餐饮') {
    uni.switchTab({
      url: '/pages/food/food',
    });
    return;
  }
  selectedCategoryId.value = category.id;
}

// 保存账目
async function saveTransaction() {
  if (!amount.value || parseFloat(amount.value) <= 0) {
    uni.showToast({
      title: '请输入有效金额',
      icon: 'none',
    });
    return;
  }

  if (!selectedCategoryId.value) {
    uni.showToast({
      title: '请选择分类',
      icon: 'none',
    });
    return;
  }

loading.value = true;

try {
  await createTransaction({
    amount: parseFloat(amount.value),
    type: type.value,
    categoryId: selectedCategoryId.value,
    accountId: selectedAccountId.value,
    date: date.value,
    note: note.value.trim() || undefined,
  });

  uni.showToast({
    title: '保存成功',
    icon: 'success',
  });

  // 清空输入框
  amount.value = '';
  note.value = '';

  // 重新加载最近交易
  const transRes = await getRecentTransactions(3);
  recentTransactions.value = transRes.data || [];
} catch (err: any) {
  uni.showToast({
    title: err.message || '保存失败',
    icon: 'none',
  });
} finally {
  loading.value = false;
}
}

// 查看全部交易
function viewAllRecords() {
  uni.switchTab({
    url: '/pages/records/records',
  });
}

// 格式化金额显示
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

// 格式化日期显示
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
</script>

<template>
  <view class="page-container">
    <!-- Top Header -->
    <view class="top-header">
      <view class="header-left">
        <text class="page-title h2">财务概览</text>
        <text class="page-subtitle body-sm">
          欢迎回来，{{ user?.nickname || user?.username }}。今天的财务状况看起来很健康。
        </text>
      </view>
      <view class="header-right" @click="uni.switchTab({url: '/pages/profile/profile'})">
        <view class="user-avatar">
          <image v-if="user?.avatar" :src="user.avatar" mode="aspectFill" />
          <text v-else>👤</text>
        </view>
      </view>
    </view>

    <!-- Quick Add Section -->
    <view class="quick-add-section">
      <view class="add-card">
        <view class="add-card-header">
          <h3 class="h3">新增账目</h3>
          <view class="type-toggle">
            <button
              class="type-btn"
              :class="{ active: type === 'expense' }"
              @click="toggleType('expense')"
            >
              支出
            </button>
            <button
              class="type-btn"
              :class="{ active: type === 'income' }"
              @click="toggleType('income')"
            >
              收入
            </button>
          </view>
        </view>

        <!-- Amount Input -->
        <view class="amount-section">
          <text class="amount-label label-md">金额</text>
          <view class="amount-input-wrapper">
            <text class="currency-symbol">¥</text>
            <input
              v-model="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              class="amount-input"
            />
          </view>
        </view>

        <!-- Category Grid -->
        <view class="category-section">
          <text class="category-label label-md">选择分类</text>
          <view class="category-grid">
            <view
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ selected: selectedCategoryId === category.id }"
              @click="selectCategory(category)"
            >
              <view
                class="category-icon"
                :style="{ backgroundColor: getCategoryBg(category.icon) }"
              >
                {{ category.icon }}
              </view>
              <span>{{ category.name }}</span>
            </view>
          </view>
        </view>

        <!-- Details -->
        <view class="details-section">
          <view class="detail-row">
            <text class="detail-label label-md">支付账户</text>
            <picker :value="selectedAccountId">
              <view class="account-selector">
                <view
                  v-for="account in accounts"
                  :key="account.id"
                  class="account-item"
                  :class="{ selected: selectedAccountId === account.id }"
                  @click="selectedAccountId = account.id"
                >
                  <text class="material-icon">account_balance_wallet</text>
                  <span>{{ account.name }}</span>
                  <text v-if="selectedAccountId === account.id" class="material-icon check">check_circle</text>
                </view>
              </view>
            </picker>
          </view>

          <view class="detail-row">
            <text class="detail-label label-md">日期</text>
            <input
              v-model="date"
              type="date"
              class="date-input"
            />
          </view>

          <view class="detail-row">
            <text class="detail-label label-md">备注（选填）</text>
            <textarea
              v-model="note"
              class="note-input"
              placeholder="这笔钱花在哪里了？"
            />
          </view>
        </view>

        <!-- Submit Button -->
        <button
          class="btn btn-primary btn-full btn-lg"
          :disabled="loading"
          @click="saveTransaction"
        >
          <text>{{ loading ? '保存中...' : '保存账目' }}</text>
        </button>
      </view>
    </view>

    <!-- Recent Transactions -->
    <view class="recent-section">
      <view class="section-header">
        <h3 class="h3">最近活动</h3>
        <text class="view-all-link" @click="viewAllRecords">查看全部</text>
      </view>

      <view class="transaction-list">
        <view
          v-for="transaction in recentTransactions"
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
            <text class="transaction-name">{{ transaction.note || transaction.category?.name || '交易' }}</text>
            <text class="transaction-meta">
              {{ formatDate(transaction.date) }} · {{ transaction.account?.name }}
            </text>
          </view>
          <text
            class="transaction-amount"
            :class="{ expense: transaction.type === 'expense', income: transaction.type === 'income' }"
          >
            {{ transaction.type === 'expense' ? '-' : '+' }}¥{{ formatAmount(transaction.amount) }}
          </text>
        </view>

        <view v-if="recentTransactions.length === 0" class="empty-state">
          <text class="empty-text body-sm text-outline">暂无交易记录</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/design-system.css';

/* Top Header */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-xl);
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-primary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background: var(--color-pale-pink-white);

  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* ========================================
   Quick Add Section
   ======================================== */
.quick-add-section {
  margin-bottom: var(--space-xl);
}

.add-card {
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: var(--space-xl);
}

.add-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.type-toggle {
  display: flex;
  background: var(--color-surface-container);
  padding: 4px;
  border-radius: var(--radius-full);
}

.type-btn {
  padding: var(--space-xs) var(--space-lg);
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  font-family: inherit;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface-variant);
  transition: all var(--transition-fast);

  &.active {
    background: var(--color-surface-container-lowest);
    color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* Amount Section */
.amount-section {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.amount-label {
  display: block;
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  text-transform: uppercase;
  margin-bottom: var(--space-sm);
}

.amount-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.currency-symbol {
  font-size: clamp(32px, 10vw, 48px);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-container);
}

.amount-input {
  width: clamp(120px, 42vw, 220px);
  font-size: clamp(32px, 10vw, 48px);
  font-weight: var(--font-weight-bold);
  text-align: center;
  border: none;
  background: transparent;
  color: var(--color-primary);
  font-family: inherit;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--color-primary-container);
    opacity: 0.5;
  }
}

/* Category Grid */
.category-section {
  margin-bottom: var(--space-xl);
}

.category-label {
  display: block;
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  text-transform: uppercase;
  margin-bottom: var(--space-md);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm);
  border: none;
  background: transparent;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);

  &.selected .category-icon {
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  span:last-child {
    font-size: 12px;
    font-weight: var(--font-weight-medium);
    color: var(--color-on-surface-variant);
  }
}

.category-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  transition: all var(--transition-fast);
}

/* Details Section */
.details-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.detail-label {
  font-size: var(--font-size-label-md);
  color: var(--color-outline);
  text-transform: uppercase;
}

.account-selector {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.account-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);

  &.selected {
    border: 2px solid var(--color-primary);
  }

  &:active {
    background: var(--color-surface-container);
  }

  .material-icon {
    color: var(--color-outline);
    font-size: 20px;
  }

  &.selected .material-icon {
    color: var(--color-primary);
  }

  span:nth-child(2) {
    flex: 1;
    font-weight: var(--font-weight-medium);
  }

  .check {
    color: var(--color-primary);
  }
}

.date-input {
  padding: var(--space-md);
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
}

.note-input {
  padding: var(--space-md);
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);
  resize: none;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }

  &::placeholder {
    color: var(--color-outline);
  }
}

/* ========================================
   Recent Transactions
   ======================================== */
.recent-section {
  margin-top: var(--space-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.view-all-link {
  color: var(--color-primary);
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);
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
    color: var(--color-error);
  }

  &.income {
    color: #2E7D32;
  }
}

.empty-state {
  text-align: center;
  padding: var(--space-xl) 0;
}

/* Responsive */
@media (max-width: 480px) {
  .add-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }

  .type-toggle {
    width: 100%;
  }

  .type-btn {
    flex: 1;
    padding-inline: var(--space-sm);
  }

  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-sm);
  }

  .category-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .add-card {
    padding: var(--space-lg);
  }

  .transaction-item {
    padding: var(--space-sm);
  }

  .transaction-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .page-container {
    padding: var(--space-md);
    padding-top: var(--space-lg);
  }

  .page-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) and (max-width: 340px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
