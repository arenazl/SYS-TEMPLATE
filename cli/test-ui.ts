#!/usr/bin/env npx tsx
/**
 * Script para probar la UI con Puppeteer
 * Toma screenshots de las páginas principales
 */

import puppeteer from 'puppeteer';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

const FRONTEND_URL = 'http://localhost:5173';
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise(r => setTimeout(r, 1000));
    process.stdout.write('.');
  }
  return false;
}

async function takeScreenshots() {
  let devServer: ChildProcess | null = null;

  try {
    // Start dev server
    console.log('🚀 Iniciando servidor de desarrollo...');
    devServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..', 'frontend'),
      shell: true,
      stdio: 'pipe'
    });

    // Wait for server to be ready
    console.log('⏳ Esperando que el servidor esté listo...');
    const serverReady = await waitForServer(FRONTEND_URL);

    if (!serverReady) {
      throw new Error('El servidor no respondió a tiempo');
    }
    console.log('\n✅ Servidor listo!');

    // Launch browser
    console.log('🌐 Abriendo navegador...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Capturar errores de consola
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`    🔴 Console: ${msg.text().substring(0, 200)}`);
      }
    });
    page.on('pageerror', err => {
      errors.push(err.message);
      console.log(`    🔴 Error: ${err.message.substring(0, 200)}`);
    });

    // Pages to screenshot
    const pages = [
      { name: 'login', url: '/login', waitFor: 2000 },
      { name: 'dashboard', url: '/gestion', waitFor: 2000 },
      { name: 'auditoria', url: '/gestion/auditoria', waitFor: 2000 },
    ];

    console.log('\n📸 Tomando screenshots...\n');

    for (const p of pages) {
      try {
        console.log(`  → ${p.name}...`);
        await page.goto(`${FRONTEND_URL}${p.url}`, {
          waitUntil: 'networkidle0',
          timeout: 10000
        });
        await new Promise(r => setTimeout(r, p.waitFor));

        const screenshotPath = path.join(SCREENSHOTS_DIR, `${p.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`    ✅ ${screenshotPath}`);
      } catch (err) {
        console.log(`    ❌ Error: ${err}`);
      }
    }

    await browser.close();
    console.log('\n✅ Screenshots completados!');
    console.log(`📁 Ver en: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Kill dev server
    if (devServer) {
      devServer.kill();
    }
  }
}

takeScreenshots();
