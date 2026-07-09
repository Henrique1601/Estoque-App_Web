import { test, expect } from '@playwright/test';

const URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const API_URL = process.env.API_URL || 'http://localhost:3001';

test.describe('Fluxo completo de estoque', () => {
  test('login, criar produto, vender, remover', async ({ page }) => {
    // Login como admin
    await page.goto(URL);
    await page.waitForLoadState('networkidle');

    await page.fill('input[name="email"]', 'admin@admin.com');
    await page.fill('input[name="senha"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');

    // Deve estar no dashboard
    await expect(page.locator('text=Total estoque')).toBeVisible();

    // Clicar em "+ novo" e preencher modal
    await page.click('button:has-text("+ novo")');
    await page.waitForSelector('[role="dialog"]');

    await page.fill('input[placeholder*="produto"]', 'Playwright Test Produto');
    await page.selectOption('select:below(:text("moeda"))', 'USD');
    await page.fill('input[type="number"]', '99.99');
    await page.fill('input:below(:text("qtd"))', '10');
    await page.fill('input[placeholder="opcional"]', 'Teste');
    await page.click('button:has-text("adicionar")');

    // Produto deve aparecer na lista
    await expect(page.locator('text=Playwright Test Produto')).toBeVisible({ timeout: 10000 });

    // Vender
    const card = page.locator('text=Playwright Test Produto').locator('..').locator('..');
    await card.fill('input[type="number"]', '2');
    await card.click('button:has-text("Vender")');

    // Esperar estoque atualizar
    await expect(page.locator('text=Playwright Test Produto')).toBeVisible();

    // Remover
    page.once('dialog', (dialog) => dialog.accept());
    await card.click('button:has-text("remover")');

    // Produto deve sumir
    await expect(page.locator('text=Playwright Test Produto')).not.toBeVisible({ timeout: 10000 });
  });

  test('register e forgot-password tem campos e botões', async ({ page }) => {
    await page.goto(`${URL}/register`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Criar conta")')).toBeVisible();
    await expect(page.locator('input[name="nome"]')).toBeVisible();

    await page.goto(`${URL}/esqueci-senha`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('button:has-text("Enviar")')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
