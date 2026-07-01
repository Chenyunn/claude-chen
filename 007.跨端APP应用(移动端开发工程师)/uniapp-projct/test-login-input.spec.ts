import { test, expect } from '@playwright/test';

test('登录页用户名和密码可以输入', async ({ page }) => {
  await page.goto('http://localhost:3001/pages/login/login');
  await page.waitForTimeout(2000);

  // 找到用户名输入框并输入
  const usernameInput = page.locator('input[type="text"]').first();
  await usernameInput.fill('testuser123');
  await expect(usernameInput).toHaveValue('testuser123');

  // 找到密码输入框并输入
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('testpass123');
  await expect(passwordInput).toHaveValue('testpass123');
});
