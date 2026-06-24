/**
 * 每日记账 - Toast 消息提示
 * 轻量级 toast 组件，无需任何依赖
 *
 * 使用方式：
 *   Toast.success('操作成功');
 *   Toast.error('操作失败');
 *   Toast.info('提示信息');
 *   Toast.warning('警告信息');
 *   Toast.loading('加载中...');   // 返回 { dismiss() } 用于手动关闭
 */

(function (global) {
  'use strict';

  // ============================================================
  // 配置
  // ============================================================

  const DURATION = 3000;          // 默认显示时长
  const MAX_VISIBLE = 3;          // 最多同时显示数量
  const GAP = 12;                 // toast 之间的间距

  // ============================================================
  // 状态
  // ============================================================

  let container = null;
  let visibleToasts = [];

  // ============================================================
  // 样式注入（仅一次）
  // ============================================================

  let stylesInjected = false;

  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;

    const style = document.createElement('style');
    style.textContent = `
      .toast-container {
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: ${GAP}px;
        pointer-events: none;
      }

      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        background: var(--color-surface-container-lowest, #ffffff);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
        font-family: var(--font-family, 'Plus Jakarta Sans', 'Noto Sans SC', sans-serif);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        max-width: 360px;
        pointer-events: auto;
        animation: toastSlideIn 0.3s ease-out;
        transition: all 0.3s ease;
      }

      .toast.toast-exit {
        opacity: 0;
        transform: translateY(-12px) scale(0.95);
      }

      @keyframes toastSlideIn {
        from {
          opacity: 0;
          transform: translateY(-16px) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .toast-icon {
        font-size: 20px;
        flex-shrink: 0;
        line-height: 1;
      }

      .toast-message {
        flex: 1;
        color: var(--color-on-surface, #1b1c1c);
        min-width: 0;
      }

      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-outline, #837375);
        padding: 2px;
        font-size: 16px;
        line-height: 1;
        flex-shrink: 0;
        border-radius: 4px;
        transition: color 0.15s;
      }

      .toast-close:hover {
        color: var(--color-on-surface, #1b1c1c);
      }

      /* 变体 */
      .toast-success .toast-icon { color: #2E7D32; }
      .toast-success { border-left: 3px solid #2E7D32; }

      .toast-error .toast-icon { color: #BA1A1A; }
      .toast-error { border-left: 3px solid #BA1A1A; }

      .toast-warning .toast-icon { color: #E65100; }
      .toast-warning { border-left: 3px solid #E65100; }

      .toast-info .toast-icon { color: #1565C0; }
      .toast-info { border-left: 3px solid #1565C0; }

      .toast-loading .toast-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid var(--color-outline-variant, #d6c2c4);
        border-top-color: var(--color-primary, #864e5a);
        border-radius: 50%;
        animation: toastSpin 0.6s linear infinite;
      }

      @keyframes toastSpin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 480px) {
        .toast-container {
          top: 12px;
          left: 12px;
          right: 12px;
          transform: none;
        }
        .toast {
          max-width: 100%;
          width: 100%;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .toast { animation: none; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 容器管理
  // ============================================================

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-label', '通知');
      document.body.appendChild(container);
    }
    return container;
  }

  // ============================================================
  // Toast 创建
  // ============================================================

  const ICONS = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    loading: '',
  };

  /**
   * 显示 Toast
   * @param {object} options
   * @param {string} options.message   - 消息文本
   * @param {string} options.type      - 类型: success|error|warning|info|loading
   * @param {number} [options.duration] - 显示时长（ms），loading 默认为无限
   * @param {boolean} [options.closable] - 是否显示关闭按钮
   * @returns {{ dismiss: Function }} 用于手动关闭
   */
  function show({ message, type = 'info', duration, closable = true }) {
    injectStyles();

    const containerEl = getContainer();

    // 限制最大显示数量
    while (visibleToasts.length >= MAX_VISIBLE) {
      const oldest = visibleToasts.shift();
      if (oldest) dismiss(oldest.el, true);
    }

    // 创建元素
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'alert');

    // 图标
    const iconEl = document.createElement('span');
    if (type === 'loading') {
      iconEl.className = 'toast-spinner';
    } else {
      iconEl.className = 'toast-icon';
      iconEl.textContent = ICONS[type] || ICONS.info;
    }
    el.appendChild(iconEl);

    // 消息
    const msgEl = document.createElement('span');
    msgEl.className = 'toast-message';
    msgEl.textContent = message;
    el.appendChild(msgEl);

    // 关闭按钮
    if (closable && type !== 'loading') {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', '关闭');
      closeBtn.addEventListener('click', () => dismiss(el));
      el.appendChild(closeBtn);
    }

    containerEl.appendChild(el);

    // 定时关闭
    let timer = null;
    const isAutoClose = type !== 'loading';

    if (isAutoClose) {
      timer = setTimeout(() => dismiss(el), duration || DURATION);
    }

    const toastEntry = { el, timer };
    visibleToasts.push(toastEntry);

    // 返回控制对象
    return {
      dismiss: () => dismiss(el),
    };
  }

  /**
   * 关闭 Toast
   */
  function dismiss(el, immediate = false) {
    if (!el || !el.parentNode) return;

    // 清除定时器
    const entry = visibleToasts.find((t) => t.el === el);
    if (entry && entry.timer) {
      clearTimeout(entry.timer);
    }
    visibleToasts = visibleToasts.filter((t) => t.el !== el);

    if (immediate) {
      el.remove();
      return;
    }

    // 动画退出
    el.classList.add('toast-exit');
    el.addEventListener('transitionend', () => {
      if (el.parentNode) el.remove();
    }, { once: true });

    // 兜底：300ms 后强制移除
    setTimeout(() => {
      if (el.parentNode) el.remove();
    }, 350);
  }

  // ============================================================
  // 快捷方法
  // ============================================================

  function success(message, duration) {
    return show({ message, type: 'success', duration });
  }

  function error(message, duration) {
    // 错误消息显示更久
    return show({ message, type: 'error', duration: duration || 5000 });
  }

  function warning(message, duration) {
    return show({ message, type: 'warning', duration });
  }

  function info(message, duration) {
    return show({ message, type: 'info', duration });
  }

  function loading(message) {
    return show({ message, type: 'loading', closable: false });
  }

  // ============================================================
  // 导出
  // ============================================================

  const Toast = { show, success, error, warning, info, loading, dismiss };

  global.Toast = Toast;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Toast;
  }
})(typeof window !== 'undefined' ? window : this);
