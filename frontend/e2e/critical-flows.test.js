import { test, expect } from '@playwright/test';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://bitsy-tools.preview.emergentagent.com';

test.describe('Critical User Flows', () => {
  test('Landing page loads and displays CTAs', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.locator('text=Your Hotel. Your Wallets')).toBeVisible();
    
    // Check CTA using specific test ID (avoid multiple matches)
    await expect(page.locator('[data-testid="landing-get-started-button"]')).toBeVisible();
  });

  test('Chat page loads with AI greeting', async ({ page }) => {
    await page.goto('/chat');
    
    // Wait for chat container
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible({ timeout: 10000 });
    
    // Check first message exists (the AI greeting)
    await expect(page.locator('[data-testid^="message-"]').first()).toBeVisible();
    
    // Check input field
    await expect(page.locator('[data-testid="chat-input"]')).toBeVisible();
    
    // Check send button
    await expect(page.locator('[data-testid="chat-send-button"]')).toBeVisible();
  });

  test('Admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check form elements with correct imports
    await expect(page.locator('[data-testid="admin-login-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-login-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin-login-submit-button"]')).toBeVisible();
    
    // Check no console errors about missing button component
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const importErrors = consoleErrors.filter(e => e.includes('../../components/ui'));
    expect(importErrors).toHaveLength(0);
  });

  test('Admin login flow works with correct credentials', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Fill login form
    await page.fill('[data-testid="admin-login-email-input"]', 'hello@getbitsy.ai');
    await page.fill('[data-testid="admin-login-password-input"]', 'bitsy-admin-2026');
    
    // Submit
    await page.click('[data-testid="admin-login-submit-button"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.locator('[data-testid="admin-dashboard-title"]')).toBeVisible();
  });

  test('Guest dashboard lookup page loads', async ({ page }) => {
    await page.goto('/guest');
    
    // Check lookup form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toBeVisible();
  });

  test('Browse hotels page loads', async ({ page }) => {
    await page.goto('/browse');
    
    // Check search input exists
    await expect(page.locator('[data-testid="hotel-search-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="hotel-search-button"]')).toBeVisible();
  });

  test('Hotel signup page loads', async ({ page }) => {
    await page.goto('/register');
    
    // Check signup form elements using specific test IDs
    await expect(page.locator('[data-testid="register-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-hotel-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="register-submit-button"]')).toBeVisible();
  });
});
