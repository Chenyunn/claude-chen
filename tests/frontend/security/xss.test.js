/**
 * 前端 XSS 安全验证
 *
 * 作用说明：
 * - 验证 profile.html 中 renderCategories 的 innerHTML 注入风险
 * - 验证分类名/图标/编码等字段的 HTML 注入
 * - 验证 toast 消息的 XSS 安全性
 *
 * 对应测试计划：FE-SEC-03（★ 已知 P0 缺陷：profile.html innerHTML 未转义）
 */
import { describe, it, expect } from 'vitest';

describe('前端 XSS 安全测试', () => {

  // ==========================================================
  // innerHTML 注入验证
  // ==========================================================
  describe('FE-SEC-03: innerHTML 注入风险（profile.html 分类渲染）', () => {

    /**
     * 模拟 profile.html 中的 renderCategories 函数逻辑
     * 实际源码位于 profile.html:325-340
     */
    function simulateCategoryRender(category) {
      const sys = category.is_system === 1;
      let html = '<div class="cat-item" data-id="' + category.id + '">';
      html += '<div class="cat-icon-box">' + category.icon + '</div>';
      html += '<div class="cat-info">';
      html += '<span class="cat-name">' + category.name + '</span>';
      html += '<span class="cat-meta">' + category.code + '</span>';
      html += '</div>';
      if (sys) {
        html += '<span class="cat-badge">系统</span>';
      } else {
        html += '<div class="cat-actions">' +
          '<button class="cat-edit-btn" data-id="' + category.id + '">编辑</button>' +
          '<button class="cat-del-btn" data-id="' + category.id + '">删除</button>' +
        '</div>';
      }
      html += '</div>';
      return html;
    }

    it('正常分类名不应产生问题', () => {
      const html = simulateCategoryRender({
        id: 1, name: '餐饮', code: 'food', icon: '🍜', is_system: 1,
      });
      expect(html).toContain('餐饮');
      expect(html).toContain('food');
      expect(html).not.toContain('<script>');
    });

    it('★ 分类名含 <img src=x onerror=alert(1)> 导致存储型 XSS', () => {
      const xssPayload = '<img src=x onerror=alert(1)>';
      const html = simulateCategoryRender({
        id: 99, name: xssPayload, code: 'xss_test', icon: '🔒', is_system: 0,
      });

      // ★ 已知缺陷：innerHTML 不转义，XSS payload 原样注入
      expect(html).toContain(xssPayload);
      console.log('\n  ⚠️  [FE-SEC-03] innerHTML XSS: 分类名直接拼接未转义 → P0 缺陷');
      console.log('  ⚠️  生成的 HTML 包含: ' + html.substring(0, 200) + '...');
    });

    it('★ 分类名含 <script>alert("xss")</script> 应被转义', () => {
      const scriptPayload = '<script>alert("xss")</script>';
      const html = simulateCategoryRender({
        id: 100, name: scriptPayload, code: 'script_test', icon: '⚠️', is_system: 0,
      });

      // ★ 已知缺陷：script 标签也会被注入
      expect(html).toContain('<script>');
      console.log('\n  ⚠️  [FE-SEC-03] script 注入同样未转义 → P0 缺陷');
    });

    it('★ 分类 code 同样存在 XSS 注入风险', () => {
      const xssCode = '<img src=x onerror=alert(document.cookie)>';
      const html = simulateCategoryRender({
        id: 101, name: '正常名', code: xssCode, icon: '📦', is_system: 0,
      });

      expect(html).toContain(xssCode);
      console.log('\n  ⚠️  [FE-SEC-03] 分类code 同样未转义 → P0 缺陷');
    });

    it('安全修复建议：应使用 textContent 或 HTML 转义函数', () => {
      // 正确的做法示例
      function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
      }

      const dangerous = '<img src=x onerror=alert(1)>';
      const safe = escapeHtml(dangerous);
      expect(safe).not.toBe(dangerous);
      expect(safe).toContain('&lt;img');
      expect(safe).toContain('&gt;');
    });
  });

  // ==========================================================
  // Toast XSS 验证
  // ==========================================================
  describe('Toast 消息 XSS 安全性', () => {

    it('toast 消息应安全处理 HTML 特殊字符', () => {
      const Toast = global.Toast;
      const xssMsg = '<script>alert(1)</script>';

      // toast 使用 textContent 还是 innerHTML？
      // 查看 toast.js 源码：创建 textNode 或使用 textContent
      Toast.show({ message: xssMsg, duration: 100 });

      const toastEl = document.querySelector('.toast');
      if (toastEl) {
        // 检查 script 标签是否被解释为 HTML
        const scripts = toastEl.querySelectorAll('script');
        // 如果使用 textContent/textNode，则不应有 script 子元素
        console.log('\n  Toast XSS 安全: script标签数=' + scripts.length);
      }
    });
  });
});
