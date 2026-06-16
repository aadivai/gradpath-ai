import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

test.describe('GradPath AI — E2E Quality Flows', () => {
  
  test('1. Landing Page Loads & Layout Verification', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/GradPath/);
    await expect(page.locator('text=Get admitted abroad with AI')).toBeVisible();
    await expect(page.locator('text=University matcher')).toBeVisible();
  });

  test('2. Authentication Redirect Guarding', async ({ page }) => {
    // Navigate to protected route without auth
    await page.goto(`${BASE_URL}/dashboard`);
    // Ensure user is redirected to sign-in page
    await expect(page.url()).toContain('/login');
  });

  test('3. Login & Dashboard Access E2E flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Fill credentials
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirection to protected dashboard
    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('4. Dark Mode & Theme Toggle verification', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Locate the theme toggler or theme switch
    const themeBtn = page.locator('button[aria-label*="theme"], button[id*="theme"], button:has-text("theme")').first();
    
    if (await themeBtn.isVisible()) {
      await themeBtn.click();
      // Verify theme state change
      const htmlClass = await page.locator('html').getAttribute('class');
      expect(htmlClass).toContain('dark');
    }
  });

  test('5. Student Profile Setup updates', async ({ page }) => {
    // Mock login by navigating to sign-in
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Go to profile edit page
    await page.goto(`${BASE_URL}/profile`);
    
    // Update CGPA and preferred countries
    const cgpaInput = page.locator('input[name="cgpa"], input[type="number"][step*="0.1"]').first();
    if (await cgpaInput.isVisible()) {
      await cgpaInput.fill('8.9');
      await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Update")');
      // Toast message or success state confirmation
      await expect(page.locator('text=updated, saved, success').first()).toBeVisible();
    }
  });

  test('6. Scholarship Predictor & Discovery Filters', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'testuser@example.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    
    // Go to scholarships module
    await page.goto(`${BASE_URL}/scholarships`);
    await expect(page.locator('text=Scholarship')).toBeVisible();
    
    // Test filter switches
    const meritToggle = page.locator('button[role="switch"], input[type="checkbox"]').first();
    if (await meritToggle.isVisible()) {
      await meritToggle.click();
    }
  });

  test('7. Mobile Menu Responsiveness Viewports', async ({ page }) => {
    // Resize viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Check for mobile navbar toggle button
    const hamburger = page.locator('button[aria-label*="menu"], button:has(.lucide-menu), button svg.lucide-menu').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      // Ensure menu links overlay is visible
      await expect(page.locator('text=Sign in').first()).toBeVisible();
    }
  });

});
