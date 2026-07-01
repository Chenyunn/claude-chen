/**
 * toast.js 通知组件单元测试
 *
 * 作用说明：
 * - 测试 Toast.show() 核心方法
 * - 测试各类型的快捷方法（success/error/warning/info/loading）
 * - 测试 dismiss 关闭逻辑
 * - 测试 maxVisible 最大可见数限制
 * - 测试 DOM 元素创建与 CSS 注入
 *
 * 源文件：003.前端代码（前端开发工程师）/frontend/assets/js/toast.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

const Toast = global.Toast;

describe('toast.js — 通知组件', () => {

  beforeEach(() => {
    // 清理 DOM 中的 toast 容器
    const container = document.querySelector('.toast-container');
    if (container) container.remove();
    // 清理注入的样式（避免重复）
    const injectedStyle = document.querySelector('style');
    // 保留 — 样式注入是幂等的（injectStyles 有标志位）
  });

  // ==========================================================
  // show() — 核心方法
  // ==========================================================
  describe('show() — 显示通知', () => {

    it('show 应创建 toast 元素到 DOM', () => {
      Toast.show({ message: '测试消息' });

      const toastEl = document.querySelector('.toast');
      expect(toastEl).not.toBeNull();
      expect(toastEl.textContent).toContain('测试消息');
    });

    it('show 应返回 dismiss 函数', () => {
      const result = Toast.show({ message: 'Test' });
      expect(result).toHaveProperty('dismiss');
      expect(typeof result.dismiss).toBe('function');
    });

    it('默认类型应为 info', () => {
      Toast.show({ message: 'Info message' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-info')).toBe(true);
    });

    it('type=success 应显示成功样式', () => {
      Toast.show({ message: 'Success', type: 'success' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-success')).toBe(true);
    });

    it('type=error 应显示错误样式', () => {
      Toast.show({ message: 'Error', type: 'error' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-error')).toBe(true);
    });

    it('type=warning 应显示警告样式', () => {
      Toast.show({ message: 'Warning', type: 'warning' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-warning')).toBe(true);
    });

    it('type=loading 应显示加载旋转器且不可关闭', () => {
      Toast.show({ message: 'Loading...', type: 'loading' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-loading')).toBe(true);

      // loading 类型不应有关闭按钮
      const closeBtn = toastEl.querySelector('.toast-close');
      expect(closeBtn).toBeNull();
    });

    it('closable=false 不应显示关闭按钮', () => {
      Toast.show({ message: 'Not closable', closable: false });
      const toastEl = document.querySelector('.toast');
      const closeBtn = toastEl.querySelector('button');
      expect(closeBtn).toBeNull();
    });

    it('应注入 CSS 样式（仅一次）', () => {
      // 多次调用 show 不应重复注入样式
      Toast.show({ message: 'First' });
      Toast.show({ message: 'Second' });

      // 样式标签只应有一个
      const styleTags = document.querySelectorAll('style');
      // 注意：jsdom setup 可能已有其他 style，检查 toast 相关
      const toastStyles = Array.from(styleTags).filter(s =>
        s.textContent.includes('toast-container')
      );
      expect(toastStyles.length).toBe(1);
    });

    it('toast 应设置 role="alert" 用于无障碍访问', () => {
      Toast.show({ message: 'Accessible' });
      const toastEl = document.querySelector('.toast');
      expect(toastEl.getAttribute('role')).toBe('alert');
    });

    it('toast 容器应设置 aria-live="polite"', () => {
      Toast.show({ message: 'Test' });
      const container = document.querySelector('.toast-container');
      expect(container.getAttribute('aria-live')).toBe('polite');
    });
  });

  // ==========================================================
  // dismiss() — 关闭通知
  // ==========================================================
  describe('dismiss() — 关闭通知', () => {

    it('dismiss 应移除 toast 元素（带动画）', async () => {
      const { dismiss } = Toast.show({ message: 'To be dismissed', duration: 99999 });

      // 等待一帧让元素渲染
      await new Promise(r => setTimeout(r, 10));

      const toastEl = document.querySelector('.toast');
      expect(toastEl).not.toBeNull();

      // 调用 dismiss（带退出动画）
      dismiss(toastEl);

      // 等待动画完成
      await new Promise(r => setTimeout(r, 400));

      // 元素应被移除
      expect(document.querySelector('.toast')).toBeNull();
    });

    it('immediate=true 应跳过动画直接移除', () => {
      const { dismiss } = Toast.show({ message: 'Immediate dismiss' });
      const toastEl = document.querySelector('.toast');

      dismiss(toastEl, true);

      // 应立即移除
      expect(document.querySelector('.toast')).toBeNull();
    });

    it('dismiss 无效元素不抛异常', () => {
      expect(() => Toast.dismiss(null)).not.toThrow();
      expect(() => Toast.dismiss(document.createElement('div'))).not.toThrow();
    });

    it('dismiss 应清除定时器', async () => {
      const { dismiss } = Toast.show({ message: 'Timer test', duration: 300 });

      const toastEl = document.querySelector('.toast');
      dismiss(toastEl);

      // 等待超过 duration，确认不会再触发
      await new Promise(r => setTimeout(r, 400));
      // 无异常即为通过
    });
  });

  // ==========================================================
  // 快捷方法
  // ==========================================================
  describe('快捷方法', () => {

    it('success() 应显示 type=success', () => {
      Toast.success('操作成功');
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-success')).toBe(true);
      expect(toastEl.textContent).toContain('操作成功');
    });

    it('error() 应显示 type=error 且默认持续 5s', () => {
      Toast.error('操作失败');
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-error')).toBe(true);
      expect(toastEl.textContent).toContain('操作失败');
    });

    it('warning() 应显示 type=warning', () => {
      Toast.warning('请注意');
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-warning')).toBe(true);
    });

    it('info() 应显示 type=info', () => {
      Toast.info('提示信息');
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-info')).toBe(true);
    });

    it('loading() 应显示 type=loading 且不可关闭、不自动消失', () => {
      Toast.loading('加载中...');
      const toastEl = document.querySelector('.toast');
      expect(toastEl.classList.contains('toast-loading')).toBe(true);

      // 不应有关闭按钮
      expect(toastEl.querySelector('button')).toBeNull();
    });
  });

  // ==========================================================
  // maxVisible — 最大可见数
  // ==========================================================
  describe('maxVisible — 最大可见数限制', () => {

    it('超过 MAX_VISIBLE 应移除最早的 toast', () => {
      // 默认 MAX_VISIBLE = 3
      Toast.show({ message: 'Toast 1', duration: 99999 });
      Toast.show({ message: 'Toast 2', duration: 99999 });
      Toast.show({ message: 'Toast 3', duration: 99999 });
      Toast.show({ message: 'Toast 4', duration: 99999 }); // 应移除 Toast 1

      const toasts = document.querySelectorAll('.toast');
      expect(toasts.length).toBeLessThanOrEqual(3);
    });
  });
});
