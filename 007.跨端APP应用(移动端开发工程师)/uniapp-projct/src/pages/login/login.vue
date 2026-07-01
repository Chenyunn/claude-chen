<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '@/store';

const store = useStore() as Store<State>;

const username = ref('');
const password = ref('');
const rememberMe = ref(true);
const loading = ref(false);
const usernameError = ref('');
const passwordError = ref('');
const shaking = ref(false);

onMounted(() => {
  // 如果已登录，直接跳转首页
  if (store.state.token) {
    store.dispatch('checkAuth').then((ok) => {
      if (ok) {
        uni.switchTab({
          url: '/pages/index/index',
        });
      }
    });
  }
});

function clearErrors() {
  usernameError.value = '';
  passwordError.value = '';
}

function onUsernameInput(e: any) {
  username.value = e.detail.value;
  clearErrors();
}

function onPasswordInput(e: any) {
  password.value = e.detail.value;
  clearErrors();
}

function showFieldError(field: 'username' | 'password', message: string) {
  if (field === 'username') {
    usernameError.value = message;
  } else {
    passwordError.value = message;
  }
  shaking.value = true;
  setTimeout(() => {
    shaking.value = false;
  }, 300);
}

async function handleLogin() {
  clearErrors();

  // 前端校验
  let hasError = false;
  if (!username.value.trim()) {
    showFieldError('username', '请输入用户名');
    hasError = true;
  }
  if (!password.value) {
    showFieldError('password', '请输入密码');
    hasError = true;
  }
  if (hasError) return;

  loading.value = true;

  try {
    await store.dispatch('login', {
      username: username.value.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    });

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1500,
    });

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
      });
    }, 800);
  } catch (err: any) {
    const msg = err.message || '登录失败，请重试';

    uni.showToast({
      title: msg,
      icon: 'none',
      duration: 3000,
    });
  } finally {
    loading.value = false;
  }
}

function goToRegister() {
  uni.navigateTo({
    url: '/pages/register/register',
  });
}
</script>

<template>
  <view class="login-page" :class="{ shake: shaking }">
    <view class="login-card">
      <!-- Header -->
      <view class="login-header">
        <view class="login-logo">💰</view>
        <text class="login-title h1">每日记账</text>
        <text class="login-subtitle body-sm">一秒记账，清楚花钱</text>
      </view>

      <!-- Login Form -->
      <view class="form">
        <view class="form-row">
          <view class="input-group">
            <text class="input-label">用户名</text>
            <view class="input-wrapper">
              <text class="input-icon">👤</text>
              <input
                :value="username"
                type="text"
                placeholder="请输入用户名"
                class="input input-with-icon"
                :class="{ 'input-error': usernameError }"
                @input="onUsernameInput"
              />
            </view>
            <view v-if="usernameError" class="input-error-hint text-error">
              {{ usernameError }}
            </view>
          </view>
        </view>

        <view class="form-row">
          <view class="input-group">
            <text class="input-label">密码</text>
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input
                :value="password"
                type="password"
                placeholder="请输入密码"
                class="input input-with-icon"
                :class="{ 'input-error': passwordError }"
                @input="onPasswordInput"
              />
            </view>
            <view v-if="passwordError" class="input-error-hint text-error">
              {{ passwordError }}
            </view>
          </view>
        </view>

        <view class="remember-row">
          <label class="checkbox-label">
            <checkbox :checked="rememberMe" @change="rememberMe = $event.detail.checked" />
            <text>7天内免登录</text>
          </label>
        </view>

        <button
          class="btn btn-primary login-btn btn-full"
          :disabled="loading"
          @click="handleLogin"
        >
          <text>{{ loading ? '登录中...' : '立即登录' }}</text>
        </button>
      </view>

      <!-- Footer -->
      <view class="login-footer">
        <text class="body-sm text-outline">
          还没有账号？
          <text class="register-link text-primary" @click="goToRegister">
            立即注册
          </text>
        </text>
      </view>

      <!-- Security Badge -->
      <view class="security-badge">
        <text class="security-icon">✅</text>
        <text class="label-md text-outline">银行级数据加密保护</text>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/design-system.css';

.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  background: linear-gradient(180deg, var(--color-pale-pink-white) 0%, var(--color-surface) 100%);
  position: relative;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.3;
  }

  &::before {
    top: -20%;
    left: -20%;
    width: 60%;
    height: 60%;
    background: var(--color-primary-container);
  }

  &::after {
    bottom: -20%;
    right: -20%;
    width: 60%;
    height: 60%;
    background: var(--color-secondary-container);
  }

  &.shake {
    animation: shake 0.3s ease;
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xxl);
  box-shadow: var(--shadow-soft-glow);
  padding: var(--space-xl);
  position: relative;
  z-index: 1;
  animation: fadeIn 0.4s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-xl);

  .login-logo {
    font-size: 48px;
    margin-bottom: var(--space-md);
  }

  .login-title {
    color: var(--color-primary);
    display: block;
  }

  .login-subtitle {
    color: var(--color-outline);
    margin-top: var(--space-xs);
    display: block;
  }
}

.form {
  .form-row {
    margin-bottom: var(--space-lg);
  }
}

.input-wrapper {
  position: relative;

  .input-icon {
    position: absolute;
    left: var(--space-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-outline);
    font-size: 20px;
    pointer-events: none;
    z-index: 1;
    line-height: 1;
  }
}

.input-with-icon {
  padding-left: 48px;
}

.input-error-hint {
  font-size: 12px;
  color: var(--color-error);
  margin-top: var(--space-xs);
  min-height: 18px;
}

.remember-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-size: var(--font-size-body-sm);
    color: var(--color-on-surface-variant);
  }
}

.forgot-link {
  font-size: var(--font-size-body-sm);
  color: var(--color-primary);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);

  &:hover {
    text-decoration: underline;
  }
}

.login-btn {
  height: 56px;
  font-size: var(--font-size-h3);
  border-radius: var(--radius-full);
}

.login-footer {
  text-align: center;
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-outline-variant);
}

.register-link {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  margin-left: var(--space-xs);
}

.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
  color: var(--color-outline);
  font-size: var(--font-size-label-md);
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
  }

  .login-logo {
    font-size: 40px;
  }

  .login-header {
    margin-bottom: var(--space-lg);
  }

  .remember-row {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }
}

@media (max-height: 700px) {
  .login-page {
    align-items: flex-start;
  }

  .login-card {
    margin-block: var(--space-md);
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-card,
  .shake {
    animation: none;
  }
}
</style>
输入框的