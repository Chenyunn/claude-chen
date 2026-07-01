<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '@/store';
import type { Category, Account } from '@/types';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/category';
import { getAccounts } from '@/api/account';

const store = useStore() as Store<State>;

// 常用emoji列表
const COMMON_EMOJIS = [
  '🍜','🚗','🛒','🎮','🏠','📱','💊','📦','💰','✨','🧋','☕','🍰','🍔',
  '🍕','🥗','🍖','🍹','🍺','🥐','🎪','🎬','🎤','🎨','✈️','🚆','🚇',
  '🛴','⛽','🏥','💎','🧧','💝','🎁','🎈','🐶','🐱','🌿','🌺','🎵',
  '🏀','⚽','🎾','🏋️','🧘','🛁','🧹','🔑','🔒','📌','📎','🗂️',
  '📊','📈','🧮','💳','🏦','💱','🏷️','🛍️','🧾','♻️','⭐','❤️','🔥','💡'
];

// 状态
const currentUser = computed(() => store.state.user);
const catType = ref<'expense' | 'income'>('expense');
const categories = ref<Category[]>([]);
const accounts = ref<Account[]>([]);
const showModal = ref(false);
const isEdit = ref(false);
const editingCategory = ref<Category | null>(null);
const categoryName = ref('');
const categoryCode = ref('');
const selectedIcon = ref('📦');

// 设置开关
const fingerprintEnabled = ref(false);
const notificationsEnabled = ref(true);
const darkModeEnabled = ref(false);

// 表单数据
const nickname = ref('');
const bio = ref('');

// 加载分类
async function loadCategories() {
  try {
    const res = await getCategories(catType.value);
    categories.value = res.data || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
    uni.showToast({
      title: '加载分类失败',
      icon: 'none',
    });
  }
}

// 加载账户
async function loadAccounts() {
  try {
    const res = await getAccounts();
    accounts.value = res.data || [];
  } catch (err) {
    console.error('Failed to load accounts:', err);
  }
}

// 切换分类类型
function switchCatType(type: 'expense' | 'income') {
  catType.value = type;
  loadCategories();
}

// 打开添加分类弹窗
function openAddModal() {
  isEdit.value = false;
  editingCategory.value = null;
  categoryName.value = '';
  categoryCode.value = '';
  selectedIcon.value = '📦';
  showModal.value = true;
}

// 打开编辑分类弹窗
function openEditModal(cat: Category) {
  isEdit.value = true;
  editingCategory.value = cat;
  categoryName.value = cat.name;
  selectedIcon.value = cat.icon;
  categoryCode.value = '';
  showModal.value = true;
}

// 选择emoji
function selectEmoji(emoji: string) {
  selectedIcon.value = emoji;
}

// 关闭弹窗
function closeModal() {
  showModal.value = false;
}

// 确认删除
function confirmDelete(cat: Category) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除分类 ${cat.icon} ${cat.name} 吗？此操作不可恢复。`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await deleteCategory(cat.id);
          uni.showToast({
            title: '删除成功',
            icon: 'success',
          });
          await loadCategories();
        } catch (err: any) {
          uni.showToast({
            title: err.message || '删除失败',
            icon: 'none',
          });
        }
      }
    },
  });
}

// 保存分类
async function saveCategory() {
  if (!categoryName.value.trim()) {
    uni.showToast({
      title: '请输入分类名称',
      icon: 'none',
    });
    return;
  }

  if (!isEdit.value && !categoryCode.value.trim()) {
    uni.showToast({
      title: '请输入分类编码',
      icon: 'none',
    });
    return;
  }

  if (!isEdit.value && !/^[a-zA-Z0-9_]+$/.test(categoryCode.value)) {
    uni.showToast({
      title: '编码仅支持字母、数字和下划线',
      icon: 'none',
    });
    return;
  }

  try {
    if (isEdit.value && editingCategory.value) {
      await updateCategory(editingCategory.value.id, {
        name: categoryName.value.trim(),
        icon: selectedIcon.value,
      });
      uni.showToast({
        title: '修改成功',
        icon: 'success',
      });
    } else {
      await createCategory({
        name: categoryName.value.trim(),
        icon: selectedIcon.value,
        code: categoryCode.value.trim(),
        type: catType.value,
        isSystem: false,
      });
      uni.showToast({
        title: '添加成功',
        icon: 'success',
      });
    }
    closeModal();
    await loadCategories();
  } catch (err: any) {
    uni.showToast({
      title: err.message || '操作失败',
      icon: 'none',
    });
  }
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await store.dispatch('logout');
        } catch (e) {
          // 即使失败也要清除本地状态跳转
          console.error('Logout error:', e);
        }
      }
    },
  });
}

// 更新用户信息
async function updateUserInfo() {
  try {
    await store.dispatch('updateUser', {
      nickname: nickname.value,
      bio: bio.value,
    });
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    });
  } catch (err: any) {
    uni.showToast({
      title: err.message || '保存失败',
      icon: 'none',
    });
  }
}

onMounted(() => {
  // 初始化用户信息
  if (currentUser.value) {
    nickname.value = currentUser.value.nickname || '';
    bio.value = currentUser.value.bio || '';
  }

  loadCategories();
  loadAccounts();
});
</script>

<template>
  <view class="page-container">
    <!-- Page Header -->
    <view class="page-header">
      <text class="page-title h2">设置</text>
    </view>

    <!-- Profile Section -->
    <view class="profile-section">
      <view class="profile-card">
        <view class="profile-avatar-section">
          <view class="avatar-wrapper">
            <image
              v-if="currentUser?.avatar"
              :src="currentUser.avatar"
              class="avatar-img"
              mode="aspectFill"
            />
            <view v-else class="avatar-img default-avatar">
              <text>👤</text>
            </view>
          </view>
        </view>

        <view class="profile-info-card">
          <view class="info-row">
            <text class="info-label label-md">昵称</text>
            <input
              v-model="nickname"
              type="text"
              class="info-input"
              placeholder="请输入昵称"
            />
          </view>
          <view class="info-row">
            <text class="info-label label-md">用户名</text>
            <input
              :value="currentUser?.username"
              type="text"
              class="info-input"
              disabled
            />
          </view>
          <view class="info-row">
            <text class="info-label label-md">个性签名</text>
            <textarea
              v-model="bio"
              class="info-textarea"
              placeholder="说说你自己..."
              rows="2"
            />
          </view>
          <button class="btn btn-primary btn-full mt-md" @click="updateUserInfo">
            保存信息
          </button>
        </view>
      </view>
    </view>

    <!-- Payment Accounts Section -->
    <view class="accounts-section">
      <text class="section-title h3">
        <text class="material-icon">account_balance</text>
        支付账户管理
      </text>
      <view class="accounts-grid">
        <view
          v-for="account in accounts"
          :key="account.id"
          class="account-card"
        >
          <view class="account-icon wechat">
            <text class="material-icon">payments</text>
          </view>
          <view class="account-info">
            <text class="account-name">{{ account.name }}</text>
            <text class="account-status">{{ account.isDefault ? '默认' : '已绑定' }}</text>
          </view>
        </view>
        <view class="account-card add-card" @click="openAddModal">
          <text class="material-icon">add_circle</text>
          <text>添加账户</text>
        </view>
      </view>
    </view>

    <!-- Category Management Section -->
    <view class="cat-section">
      <view class="cat-header">
        <text class="section-title h3">
          <text class="material-icon">category</text>
          分类管理
        </text>
        <button class="btn-add-cat" @click="openAddModal">
          <text class="material-icon" style="font-size:16px;">add</text>添加分类
        </button>
      </view>
      <view class="cat-type-tabs">
        <button
          class="cat-type-tab"
          :class="{ active: catType === 'expense' }"
          @click="switchCatType('expense')"
        >
          支出分类
        </button>
        <button
          class="cat-type-tab"
          :class="{ active: catType === 'income' }"
          @click="switchCatType('income')"
        >
          收入分类
        </button>
      </view>
      <view class="cat-list">
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="cat-item"
        >
          <view class="cat-icon-box">
            {{ cat.icon }}
          </view>
          <view class="cat-info">
            <text class="cat-name">{{ cat.name }}</text>
            <text class="cat-meta">{{ cat.code }}</text>
          </view>
          <text v-if="cat.isSystem" class="cat-badge">系统</text>
          <view v-if="!cat.isSystem" class="cat-actions">
            <button
              class="cat-action-btn"
              @click="openEditModal(cat)"
            >
              <text class="material-icon">edit</text>
            </button>
            <button
              class="cat-action-btn delete"
              @click="confirmDelete(cat)"
            >
              <text class="material-icon">delete</text>
            </button>
          </view>
        </view>

        <view
          v-if="categories.length === 0"
          class="cat-empty text-outline"
        >
          暂无分类，点击上方按钮添加
        </view>
      </view>
    </view>

    <!-- Settings Lists -->
    <view class="settings-section">
      <!-- Security Settings -->
      <view class="settings-card">
        <text class="settings-title h3">
          <text class="material-icon">security</text>
          安全设置
        </text>
        <view class="settings-list">
          <view class="settings-item toggle-item">
            <view class="flex items-center gap-md">
              <text class="material-icon">fingerprint</text>
              <text class="settings-text">指纹/面容解锁</text>
            </view>
            <label class="toggle">
              <input
                v-model="fingerprintEnabled"
                type="checkbox"
              />
              <span class="toggle-slider"></span>
            </label>
          </view>
        </view>
      </view>

      <!-- Preferences -->
      <view class="settings-card">
        <text class="settings-title h3">
          <text class="material-icon">tune</text>
          个性化偏好
        </text>
        <view class="settings-list">
          <view class="settings-item toggle-item">
            <view class="flex items-center gap-md">
              <text class="material-icon">notifications_active</text>
              <text class="settings-text">消息提醒</text>
            </view>
            <label class="toggle">
              <input
                v-model="notificationsEnabled"
                type="checkbox"
              />
              <span class="toggle-slider"></span>
            </label>
          </view>
          <view class="settings-item toggle-item">
            <view class="flex items-center gap-md">
              <text class="material-icon">dark_mode</text>
              <text class="settings-text">深色模式</text>
            </view>
            <label class="toggle">
              <input
                v-model="darkModeEnabled"
                type="checkbox"
              />
              <span class="toggle-slider"></span>
            </label>
          </view>
        </view>
      </view>
    </view>

    <!-- About Section -->
    <view class="about-section">
      <view class="about-card">
        <text class="about-title h3">关于每日记账</text>
        <text class="about-version body-sm">版本 1.0.0</text>
        <text class="about-desc body-md">一款轻量、快捷、无负担的个人日常记账工具</text>
        <text class="about-slogan body-lg font-semibold text-primary">一秒记账，清楚花钱 💕</text>
      </view>
    </view>

    <!-- Logout Button -->
    <view class="logout-section">
      <button class="btn btn-outline-full" @click="handleLogout">
        <text class="material-icon">logout</text>
        退出登录
      </button>
    </view>

    <!-- Add/Edit Category Modal -->
    <view v-if="showModal" class="modal-overlay" @click="closeModal">
      <view class="modal-card" @click.stop>
        <text class="modal-title h3">{{ isEdit ? '编辑分类' : '添加分类' }}</text>

        <view class="modal-field">
          <text class="label-md">分类名称</text>
          <input
            v-model="categoryName"
            type="text"
            maxlength="20"
            placeholder="如：奶茶"
          />
        </view>

        <view v-if="!isEdit" class="modal-field">
          <text class="label-md">分类编码</text>
          <input
            v-model="categoryCode"
            type="text"
            maxlength="20"
            placeholder="如：milk_tea"
          />
        </view>

        <view class="modal-field">
          <text class="label-md">选择图标</text>
          <view class="emoji-preview">
            {{ selectedIcon }}
          </view>
          <view class="emoji-picker">
            <button
              v-for="emoji in COMMON_EMOJIS"
              :key="emoji"
              class="emoji-option"
              :class="{ selected: selectedIcon === emoji }"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </view>
        </view>

        <view class="modal-btns">
          <button class="modal-cancel btn-secondary" @click="closeModal">
            取消
          </button>
          <button class="modal-confirm btn-primary" @click="saveCategory">
            {{ isEdit ? '保存' : '添加' }}
          </button>
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

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: 28px;
  font-weight: var(--font-weight-bold);
  color: var(--color-on-surface);
}

/* Profile Section */
.profile-section {
  margin-bottom: var(--space-xl);
}

.profile-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-xl);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-card);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-md);
}

.avatar-wrapper {
  position: relative;
}

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--color-surface-container-lowest);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &.default-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface-container-lowest);
    font-size: 32px;
  }
}

.profile-info-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.info-label {
  font-size: var(--font-size-label-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface-variant);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-input,
.info-textarea {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  font-family: inherit;
  font-size: var(--font-size-body-md);
  color: var(--color-on-surface);
  transition: all var(--transition-fast);
}

.info-input:focus,
.info-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(134, 78, 90, 0.15);
}

.info-input:disabled {
  background: var(--color-surface-container-low);
  color: var(--color-outline);
  cursor: not-allowed;
}

.info-textarea {
  resize: none;
  min-height: 60px;
}

/* Accounts Section */
.accounts-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-h3);
  margin-bottom: var(--space-lg);

  .material-icon {
    color: var(--color-primary);
  }
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.account-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}

.account-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &.wechat {
    background: #E8F5E9;
    .material-icon {
      color: #4CAF50;
    }
  }

  &.alipay {
    background: #E3F2FD;
    .material-icon {
      color: #2196F3;
    }
  }

  &.bank {
    background: var(--color-primary-container);
    .material-icon {
      color: var(--color-primary);
    }
  }
}

.account-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.account-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface);
  font-size: var(--font-size-body-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.account-status {
  font-size: var(--font-size-body-sm);
  color: var(--color-outline);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.add-card {
  flex-direction: column;
  justify-content: center;
  gap: var(--space-xs);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

/* Category Management */
.cat-section {
  margin-bottom: var(--space-xl);
}

.cat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.btn-add-cat {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);
  border: none;
  font-family: inherit;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);

  &:active {
    filter: brightness(1.05);
  }
}

.cat-type-tabs {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.cat-type-tab {
  padding: 6px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-outline-variant);
  background: var(--color-surface-container-lowest);
  cursor: pointer;
  font-size: var(--font-size-body-sm);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);

  &.active {
    background: var(--color-primary-container);
    color: var(--color-on-primary-container);
    border-color: transparent;
  }
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.cat-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.cat-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-pale-pink-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.cat-info {
  flex: 1;
  min-width: 0;
}

.cat-name {
  font-weight: var(--font-weight-semibold);
}

.cat-meta {
  font-size: var(--font-size-label-md);
  color: var(--color-on-surface-variant);
}

.cat-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--color-surface-container-high);
  color: var(--color-on-surface-variant);
}

.cat-actions {
  display: flex;
  gap: var(--space-xs);
}

.cat-action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  color: var(--color-on-surface-variant);

  &:active {
    background: var(--color-surface-container-high);
  }

  &.delete:active {
    background: rgba(186, 26, 26, 0.1);
    color: var(--color-error);
  }

  .material-icon {
    font-size: 18px;
  }
}

.cat-empty {
  text-align: center;
  padding: var(--space-xl);
  color: var(--color-on-surface-variant);
}

/* Settings Section */
.settings-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.settings-card {
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.settings-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-h3);
  padding: var(--space-lg);
  border-bottom: 1px solid rgba(255, 183, 197, 0.2);

  .material-icon {
    color: var(--color-primary);
  }
}

.settings-list {
  display: flex;
  flex-direction: column;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  color: var(--color-on-surface);
  border-bottom: 1px solid rgba(255, 183, 197, 0.1);
  transition: all var(--transition-fast);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: rgba(255, 255, 255, 0.5);
  }

  .material-icon {
    color: var(--color-on-surface-variant);
    font-size: 20px;
  }

  .settings-text {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
    font-size: var(--font-size-body-md);
  }

  .arrow {
    color: var(--color-outline);
  }
}

.toggle-item {
  justify-content: space-between;
}

.toggle {
  position: relative;
  flex-shrink: 0;
  width: 48px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-surface-container-high);
    border-radius: 24px;
    transition: all var(--transition-fast);

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      left: 2px;
      bottom: 2px;
      background: white;
      border-radius: 50%;
      transition: all var(--transition-fast);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
  }

  input:checked + .toggle-slider {
    background: var(--color-primary);
  }

  input:checked + .toggle-slider::before {
    transform: translateX(24px);
  }
}

/* About Section */
.about-section {
  margin-bottom: var(--space-xl);
}

.about-card {
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  text-align: center;
  box-shadow: var(--shadow-card);
}

.about-title {
  font-size: var(--font-size-h3);
  margin-bottom: var(--space-sm);
}

.about-version {
  color: var(--color-outline);
  margin-bottom: var(--space-md);
}

.about-desc {
  color: var(--color-on-surface);
  margin-bottom: var(--space-sm);
}

.about-slogan {
  font-size: var(--font-size-body-lg);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

/* Logout Section */
.logout-section {
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-outline-variant);
}

.btn-outline-full {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-xl);
  background: transparent;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-full);
  font-family: inherit;
  font-size: var(--font-size-body-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:active {
    background: rgba(134, 78, 90, 0.1);
    transform: scale(0.98);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  width: 90%;
  max-width: 420px;
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xxl);
  padding: var(--space-xl);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--space-lg);
}

.modal-field {
  margin-bottom: var(--space-md);

  label {
    display: block;
    font-size: var(--font-size-label-md);
    font-weight: var(--font-weight-semibold);
    color: var(--color-on-surface-variant);
    margin-bottom: var(--space-xs);
  }

  input {
    width: 100%;
    padding: 10px var(--space-md);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-lg);
    font-family: inherit;
    font-size: var(--font-size-body-md);

    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(134, 78, 90, 0.15);
    }
  }
}

.emoji-preview {
  font-size: 32px;
  text-align: center;
  padding: var(--space-sm);
  background: var(--color-pale-pink-white);
  border-radius: var(--radius-lg);
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-sm);
}

.emoji-picker {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  padding: var(--space-sm);
  background: var(--color-surface-container-low);
}

.emoji-option {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  background: transparent;
  transition: all var(--transition-fast);

  &:active,
  &.selected {
    background: var(--color-primary-container);
    border-color: var(--color-primary);
  }
}

.modal-btns {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);

  button {
    flex: 1;
    padding: 12px;
    border-radius: var(--radius-full);
    border: none;
    font-family: inherit;
    font-size: var(--font-size-body-md);
    font-weight: var(--font-weight-semibold);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
}

.modal-cancel {
  background: var(--color-surface-container-high);
  color: var(--color-on-surface);
}

.modal-confirm {
  background: var(--color-primary-container);
  color: var(--color-on-primary-container);

  &:active {
    filter: brightness(1.05);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .accounts-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .settings-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-card {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .profile-card {
    padding: var(--space-lg);
  }
}

@media (max-width: 480px) {
  .profile-card,
  .about-card {
    padding: var(--space-md);
  }

  .avatar-img {
    width: 80px;
    height: 80px;
  }

  .account-card {
    gap: var(--space-sm);
  }

  .settings-item {
    padding: var(--space-md);
  }
}
</style>
