<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useStore } from 'vuex';
import type { Store } from 'vuex';
import type { State } from '@/store';

const store = useStore() as Store<State>;

onLaunch(() => {
  console.log('App Launch');
  // 检查登录状态
  store.dispatch('checkAuth');
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>

<template>
  <router-view />
</template>

<style lang="scss">
@import '@/styles/design-system.css';

page {
  background-color: var(--color-surface);
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-text-primary);
}
</style>
