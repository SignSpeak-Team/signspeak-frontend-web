import { test, expect } from '@playwright/test';

test.describe('SignSpeak E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1. should display correctly the landing page and brand', async ({ page }) => {
    await expect(page.locator('text=SignSpeak')).toBeVisible();
    await expect(page.locator('.status-badge')).toBeVisible();
  });

  test('2. should switch between recognition modes', async ({ page }) => {
    // Modo estático por defecto
    await expect(page.locator('text=Constructor de Palabras')).toBeVisible();
    
    // Cambiar a Palabras
    await page.click('text=Palabras');
    await expect(page.locator('text=Frase Traducida (BETA)')).toBeVisible();
    await expect(page.locator('text=Constructor de Palabras')).not.toBeVisible();
  });

  test('3. should show camera view container', async ({ page }) => {
    // Verificamos que el contenedor de la cámara esté presente
    const cameraSection = page.locator('.camera-section');
    await expect(cameraSection).toBeVisible();
  });

  test('4. should clear spelled word when clicking clear button', async ({ page }) => {
    // Al no tener cámara real en el test CI, forzamos agregar espacios para probar el botón borrar
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    
    const spellingBox = page.locator('.spelled-box');
    await expect(spellingBox).not.toHaveText('Presiona "Agregar" para formar tu palabra...');
    
    await page.click('text=Borrar Todo');
    await expect(spellingBox).toHaveText('Presiona "Agregar" para formar tu palabra...');
  });

  test('5. should be responsive (mobile view)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // El layout debería ser columna única
    const mainLayout = page.locator('.main-layout');
    await expect(mainLayout).toHaveCSS('display', 'flex'); 
    // En CSS suele pasar de grid 1fr 350px a flex column
  });
});
