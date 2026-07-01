<script setup lang="ts">
import { ref } from 'vue';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '@/store';

const store = useStore() as Store<State>;

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const termsAgreed = ref(false);
const loading = ref(false);
const usernameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const shaking = ref(false);

function clearErrors() {
  usernameError.value = '';
  passwordError.value = '';
  confirmPasswordError.value = '';
}

function onUsernameInput(e: any) {
  username.value = e.detail.value;
  clearErrors();
}

function onPasswordInput(e: any) {
  password.value = e.detail.value;
  clearErrors();
}

function onConfirmPasswordInput(e: any) {
  confirmPassword.value = e.detail.value;
  clearErrors();
}

function showFieldError(field: 'username' | 'password' | 'confirm-password', message: string) {
  if (field === 'username') {
    usernameError.value = message;
  } else if (field === 'password') {
    passwordError.value = message;
  } else {
    confirmPasswordError.value = message;
  }
}

function togglePassword(field: 'password' | 'confirm-password') {
  if (field === 'password') {
    showPassword.value = !showPassword.value;
  } else {
    showConfirmPassword.value = !showConfirmPassword.value;
  }
}

async function handleRegister() {
  clearErrors();

  // 前端校验
  let hasError = false;
  const usernameRegex = /^[a-zA-Z0-9]{6,20}$/;

  if (!username.value.trim()) {
    showFieldError('username', '用户名不能为空');
    hasError = true;
  } else if (!usernameRegex.test(username.value.trim())) {
    showFieldError('username', '用户名需6-20位字母或数字');
    hasError = true;
  }

  if (!password.value) {
    showFieldError('password', '密码不能为空');
    hasError = true;
  } else if (password.value.length < 6 || password.value.length > 20) {
    showFieldError('password', '密码需6-20位');
    hasError = true;
  }

  if (password.value !== confirmPassword.value) {
    showFieldError('confirm-password', '两次输入的密码不一致');
    hasError = true;
  }

  if (!termsAgreed.value) {
    uni.showToast({
      title: '请先阅读并同意服务协议和隐私政策',
      icon: 'none',
      duration: 2000,
    });
    hasError = true;
  }

  if (hasError) {
    shaking.value = true;
    setTimeout(() => {
      shaking.value = false;
    }, 300);
    return;
  }

  loading.value = true;

  try {
    await store.dispatch('register', {
      username: username.value.trim(),
      password: password.value,
    });

    uni.showToast({
      title: '注册成功，正在跳转...',
      icon: 'success',
      duration: 1500,
    });

    setTimeout(() => {
      uni.switchTab({
        url: '/pages/index/index',
      });
    }, 800);
  } catch (err: any) {
    const msg = err.message || '注册失败，请重试';

    if (err.code === 409) {
      showFieldError('username', msg);
      uni.showToast({
        title: msg,
        icon: 'none',
        duration: 3000,
      });
    } else {
      uni.showToast({
        title: msg,
        icon: 'none',
        duration: 3000,
      });
    }
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  uni.navigateBack();
}
</script>

<template>
  <view class="register-page" :class="{ shake: shaking }">
    <view class="register-card">
      <!-- Header -->
      <view class="register-header">
        <view class="register-logo">
          <text>💰</text>
        </view>
        <text class="register-title h1">财务管家</text>
        <text class="register-subtitle body-sm">开启智能理财之旅</text>
      </view>

      <!-- Register Form -->
      <view class="form">
        <view class="form-row">
          <view class="input-group">
            <text class="input-label">用户名</text>
            <view class="input-wrapper">
              <text class="input-icon">👤</text>
              <input
                :value="username"
                type="text"
                placeholder="6-20位字母或数字"
                maxlength="20"
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
            <text class="input-label">设置密码</text>
            <view class="input-wrapper">
              <text class="input-icon">🔒</text>
              <input
                :value="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="6-16位密码"
                maxlength="16"
                class="input input-with-icon input-with-action"
                :class="{ 'input-error': passwordError }"
                @input="onPasswordInput"
              />
              <view class="password-toggle" @click="togglePassword('password')">
                <text>{{ showPassword ? '🙈' : '👁️' }}</text>
              </view>
            </view>
            <view v-if="passwordError" class="input-error-hint text-error">
              {{ passwordError }}
            </view>
          </view>
        </view>

        <view class="form-row">
          <view class="input-group">
            <text class="input-label">确认密码</text>
            <view class="input-wrapper">
              <text class="input-icon">🔐</text>
              <input
                :value="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="再次输入密码"
                maxlength="16"
                class="input input-with-icon input-with-action"
                :class="{ 'input-error': confirmPasswordError }"
                @input="onConfirmPasswordInput"
              />
              <view class="password-toggle" @click="togglePassword('confirm-password')">
                <text>{{ showConfirmPassword ? '🙈' : '👁️' }}</text>
              </view>
            </view>
            <view v-if="confirmPasswordError" class="input-error-hint text-error">
              {{ confirmPasswordError }}
            </view>
          </view>
        </view>

        <view class="terms-row">
          <checkbox :checked="termsAgreed" @change="termsAgreed = $event.detail.checked" />
          <text class="terms-text body-sm">
            我已阅读并同意
            <text class="terms-link text-primary">服务协议</text>
            与
            <text class="terms-link text-primary">隐私政策</text>
          </text>
        </view>

        <button
          class="btn btn-primary register-btn btn-full"
          :disabled="loading"
          @click="handleRegister"
        >
          <text>{{ loading ? '注册中...' : '立即注册' }}</text>
        </button>
      </view>

      <!-- Footer -->
      <view class="register-footer">
        <text class="body-sm text-outline">
          已有账号？
          <text class="login-link text-primary" @click="goToLogin">返回登录</text>
        </text>
      </view>

      <!-- Features -->
      <view class="features-row">
        <view class="feature-item">
          <view class="feature-icon">
            <text>🔒</text>
          </view>
          <text class="feature-text">银行级加密</text>
        </view>
        <view class="feature-item">
          <view class="feature-icon">
            <text>✅</text>
          </view>
          <text class="feature-text">合规存管</text>
        </view>
        <view class="feature-item">
          <view class="feature-icon">
            <text>☁️</text>
          </view>
          <text class="feature-text">实时同步</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss">
@import '@/styles/design-system.css';

.register-page {
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--space-md);
  background: var(--color-surface);
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;

  &.shake {
    animation: shake 0.3s ease;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface-container-lowest);
  border-radius: var(--radius-xxl);
  box-shadow: var(--shadow-card);
  padding: var(--space-xl);
  animation: fadeIn 0.4s ease-out;
}

.register-header {
  text-align: center;
  margin-bottom: var(--space-xl);

  .register-logo {
    width: 64px;
    height: 64px;
    background: var(--color-pale-pink-white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto var(--space-md);
    box-shadow: 0 8px 32px rgba(201, 184, 232, 0.15);

    text {
      font-size: 32px;
    }
  }

  .register-title {
    background: linear-gradient(135deg, var(--color-primary-container), var(--color-secondary-container));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }

  .register-subtitle {
    color: var(--color-on-surface-variant);
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
  }

  .password-toggle {
    position: absolute;
    right: var(--space-md);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--color-outline);
    padding: 4px;
    display: flex;
    align-items: center;
    z-index: 1;
  }

  .password-toggle:active {
    color: var(--color-on-surface-variant);
  }
}

.input-with-icon {
  padding-left: 48px;
}

.input-with-action {
  padding-right: 48px;
}

.input-error-hint {
  font-size: 12px;
  color: var(--color-error);
  margin-top: var(--space-xs);
  min-height: 18px;
}

.terms-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);

  .terms-text {
    color: var(--color-on-surface-variant);
    line-height: 1.5;
  }

  .terms-link {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: var(--font-weight-semibold);
  }
}

.register-btn {
  width: 100%;
  height: 56px;
  font-size: var(--font-size-h3);
  border-radius: var(--radius-full);
}

.register-footer {
  text-align: center;
  margin-top: var(--space-xl);

  p {
    font-size: var(--font-size-body-sm);
    color: var(--color-outline);
  }
}

.login-link {
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  margin-left: var(--space-xs);
}

.features-row {
  display: flex;
  justify-content: center;
  gap: var(--space-xl);
  margin-top: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--color-outline-variant);

  .feature-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    color: var(--color-outline);
  }

  .feature-icon {
    width: 40px;
    height: 40px;
    background: var(--color-surface-container-high);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .feature-text {
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
  }
}

@media (min-width: 769px) and (min-height: 760px) {
  .register-page {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .register-card {
    padding: var(--space-lg);
    border-radius: var(--radius-xl);
  }

  .register-header {
    margin-bottom: var(--space-lg);
  }

  .form-row {
    margin-bottom: var(--space-md);
  }

  .features-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-md);
  }
}

@media (max-width: 375px) {
  .register-card {
    padding: var(--space-md);
  }

  .feature-icon {
    width: 36px;
    height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .register-card,
  .shake {
    animation: none;
  }
}
</style>
