import puppeteer from 'puppeteer';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');

const routes = [
  { path: '/', output: 'index.html' },
  { path: '/about', output: 'about/index.html' },
  { path: '/contact', output: 'contact/index.html' },
  { path: '/privacy-policy', output: 'privacy-policy/index.html' },
  { path: '/warranty', output: 'warranty/index.html' },
  { path: '/terms-and-condition', output: 'terms-and-condition/index.html' },
  { path: '/landing', output: 'landing/index.html' },
  { path: '/request-part', output: 'request-part/index.html' },
  { path: '/order-a-part', output: 'order-a-part/index.html' },
];

// Helper to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to check if server is ready
async function waitForServer(url, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Server is ready!');
        return true;
      }
    } catch (e) {
      // Server not ready yet
    }
    console.log(`   Waiting for server... (${i + 1}/${maxAttempts})`);
    await wait(1000);
  }
  throw new Error('Server failed to start');
}

async function prerender() {
  console.log('🚀 Starting prerendering...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  // Start server in background
  console.log('⏳ Starting local server...');
  const serverProcess = exec('npx serve -s dist -l 5000', (error) => {
    if (error && !error.killed) {
      console.error('Server error:', error);
    }
  });

  // Wait for server to be ready
  try {
    await waitForServer('http://localhost:5000');
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    serverProcess.kill();
    await browser.close();
    process.exit(1);
  }

  for (const route of routes) {
    try {
      console.log(`\n📄 Rendering ${route.path}...`);
      
      const page = await browser.newPage();
      
      // Block unnecessary resources
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['document', 'script', 'xhr', 'fetch', 'stylesheet', 'font'].includes(resourceType)) {
          req.continue();
        } else {
          req.abort();
        }
      });

      // Set prerendering flag
      await page.evaluateOnNewDocument(() => {
        window.__PRERENDERING__ = true;
      });
      
      await page.goto(`http://localhost:5000${route.path}`, {
        waitUntil: 'networkidle0',
        timeout: 45000
      });

      console.log('   ⏳ Waiting for content to render...');
      await wait(4000); // Fixed: Use wait() instead of page.waitForTimeout()

      // Check for h1
      try {
        await page.waitForSelector('h1', { timeout: 5000 });
        console.log('   ✅ H1 tag found!');
      } catch (e) {
        console.log('   ⚠️  No H1 found, but continuing...');
      }

      const html = await page.content();

      if (html.includes('<h1')) {
        console.log('   ✅ H1 tag confirmed in HTML');
      } else {
        console.log('   ❌ WARNING: No H1 tag in rendered HTML');
      }

      const outputPath = join(distDir, route.output);
      mkdirSync(dirname(outputPath), { recursive: true });

      writeFileSync(outputPath, html, 'utf-8');
      console.log(`   ✅ Saved to ${route.output}`);

      await page.close();
    } catch (error) {
      console.error(`   ❌ Error rendering ${route.path}:`, error.message);
    }
  }

  console.log('\n🛑 Stopping server...');
  serverProcess.kill();
  await browser.close();
  console.log('🎉 Prerendering complete!\n');
}

prerender().catch(console.error);