// import puppeteer from 'puppeteer';
// import { writeFileSync, mkdirSync } from 'fs';
// import { join, dirname } from 'path';
// import { fileURLToPath } from 'url';
// import { exec } from 'child_process';

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const distDir = join(__dirname, '../dist');

// const routes = [
//   { path: '/', output: 'index.html' },
//   { path: '/about', output: 'about/index.html' },
//   { path: '/contact', output: 'contact/index.html' },
//   { path: '/privacy-policy', output: 'privacy-policy/index.html' },
//   { path: '/warranty', output: 'warranty/index.html' },
//   { path: '/terms-and-condition', output: 'terms-and-condition/index.html' },
//   { path: '/landing', output: 'landing/index.html' },
//   { path: '/request-part', output: 'request-part/index.html' },
//   { path: '/order-a-part', output: 'order-a-part/index.html' },
// ];

// // Helper to wait
// const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Function to check if server is ready
// async function waitForServer(url, maxAttempts = 30) {
//   for (let i = 0; i < maxAttempts; i++) {
//     try {
//       const response = await fetch(url);
//       if (response.ok) {
//         console.log('✅ Server is ready!');
//         return true;
//       }
//     } catch (e) {
//       // Server not ready yet
//     }
//     console.log(`   Waiting for server... (${i + 1}/${maxAttempts})`);
//     await wait(1000);
//   }
//   throw new Error('Server failed to start');
// }

// async function prerender() {
//   console.log('🚀 Starting prerendering...');
  
//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       '--no-sandbox', 
//       '--disable-setuid-sandbox',
//       '--disable-web-security',
//       '--disable-features=IsolateOrigins,site-per-process'
//     ]
//   });

//   // Start server in background
//   console.log('⏳ Starting local server...');
//   const serverProcess = exec('npx serve -s dist -l 5000', (error) => {
//     if (error && !error.killed) {
//       console.error('Server error:', error);
//     }
//   });

//   // Wait for server to be ready
//   try {
//     await waitForServer('http://localhost:5000');
//   } catch (error) {
//     console.error('❌ Server failed to start:', error.message);
//     serverProcess.kill();
//     await browser.close();
//     process.exit(1);
//   }

//   for (const route of routes) {
//     try {
//       console.log(`\n📄 Rendering ${route.path}...`);
      
//       const page = await browser.newPage();
      
//       // Block unnecessary resources
//       await page.setRequestInterception(true);
//       page.on('request', (req) => {
//         const resourceType = req.resourceType();
//         if (['document', 'script', 'xhr', 'fetch', 'stylesheet', 'font'].includes(resourceType)) {
//           req.continue();
//         } else {
//           req.abort();
//         }
//       });

//       // Set prerendering flag
//       await page.evaluateOnNewDocument(() => {
//         window.__PRERENDERING__ = true;
//       });
      
//       await page.goto(`http://localhost:5000${route.path}`, {
//         waitUntil: 'networkidle0',
//         timeout: 45000
//       });

//       console.log('   ⏳ Waiting for content to render...');
//       await wait(4000); // Fixed: Use wait() instead of page.waitForTimeout()

//       // Check for h1
//       try {
//         await page.waitForSelector('h1', { timeout: 5000 });
//         console.log('   ✅ H1 tag found!');
//       } catch (e) {
//         console.log('   ⚠️  No H1 found, but continuing...');
//       }

//       const html = await page.content();

//       if (html.includes('<h1')) {
//         console.log('   ✅ H1 tag confirmed in HTML');
//       } else {
//         console.log('   ❌ WARNING: No H1 tag in rendered HTML');
//       }

//       const outputPath = join(distDir, route.output);
//       mkdirSync(dirname(outputPath), { recursive: true });

//       writeFileSync(outputPath, html, 'utf-8');
//       console.log(`   ✅ Saved to ${route.output}`);

//       await page.close();
//     } catch (error) {
//       console.error(`   ❌ Error rendering ${route.path}:`, error.message);
//     }
//   }

//   console.log('\n🛑 Stopping server...');
//   serverProcess.kill();
//   await browser.close();
//   console.log('🎉 Prerendering complete!\n');
// }

// prerender().catch(console.error);

if (process.env.PRERENDER !== "true") {
  console.log("⏩ Prerender skipped (PRERENDER flag not set)");
  process.exit(0);
}

import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");
  // ✅ ALL routes including 43 brand pages
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
    { path: '/product-details', output: '/product-details/index.html' },
    
    // Brand pages - ONLY brands that have images
    { path: '/used/acura/parts', output: 'used/acura/parts/index.html' },
    { path: '/used/bmw/parts', output: 'used/bmw/parts/index.html' },
    { path: '/used/buick/parts', output: 'used/buick/parts/index.html' },
    { path: '/used/cadillac/parts', output: 'used/cadillac/parts/index.html' },
    { path: '/used/chevrolet/parts', output: 'used/chevrolet/parts/index.html' },
    { path: '/used/chrysler/parts', output: 'used/chrysler/parts/index.html' },
    { path: '/used/daewoo/parts', output: 'used/daewoo/parts/index.html' },
    { path: '/used/daihatsu/parts', output: 'used/daihatsu/parts/index.html' },
    { path: '/used/dodge/parts', output: 'used/dodge/parts/index.html' },
    { path: '/used/eagle/parts', output: 'used/eagle/parts/index.html' },
    { path: '/used/ford/parts', output: 'used/ford/parts/index.html' },
    { path: '/used/gmc/parts', output: 'used/gmc/parts/index.html' },
    { path: '/used/honda/parts', output: 'used/honda/parts/index.html' },
    { path: '/used/hyundai/parts', output: 'used/hyundai/parts/index.html' },
    { path: '/used/infiniti/parts', output: 'used/infiniti/parts/index.html' },
    { path: '/used/isuzu/parts', output: 'used/isuzu/parts/index.html' },
    { path: '/used/jaguar/parts', output: 'used/jaguar/parts/index.html' },
    { path: '/used/jeep/parts', output: 'used/jeep/parts/index.html' },
    { path: '/used/kia/parts', output: 'used/kia/parts/index.html' },
    { path: '/used/land-rover/parts', output: 'used/land-rover/parts/index.html' },
    { path: '/used/lexus/parts', output: 'used/lexus/parts/index.html' },
    { path: '/used/lincoln/parts', output: 'used/lincoln/parts/index.html' },
    { path: '/used/mazda/parts', output: 'used/mazda/parts/index.html' },
    { path: '/used/benz/parts', output: 'used/benz/parts/index.html' },
    { path: '/used/mercury/parts', output: 'used/mercury/parts/index.html' },
    { path: '/used/mini-cooper/parts', output: 'used/mini-cooper/parts/index.html' },
    { path: '/used/mitsubishi/parts', output: 'used/mitsubishi/parts/index.html' },
    { path: '/used/nissan/parts', output: 'used/nissan/parts/index.html' },
    { path: '/used/oldsmobile/parts', output: 'used/oldsmobile/parts/index.html' },
    { path: '/used/plymouth/parts', output: 'used/plymouth/parts/index.html' },
    { path: '/used/pontiac/parts', output: 'used/pontiac/parts/index.html' },
    { path: '/used/porsche/parts', output: 'used/porsche/parts/index.html' },
    { path: '/used/saab/parts', output: 'used/saab/parts/index.html' },
    { path: '/used/saturn/parts', output: 'used/saturn/parts/index.html' },
    { path: '/used/scion/parts', output: 'used/scion/parts/index.html' },
    { path: '/used/subaru/parts', output: 'used/subaru/parts/index.html' },
    { path: '/used/suzuki/parts', output: 'used/suzuki/parts/index.html' },
    { path: '/used/toyota/parts', output: 'used/toyota/parts/index.html' },
    { path: '/used/volkswagen/parts', output: 'used/volkswagen/parts/index.html' },
    { path: '/used/volvo/parts', output: 'used/volvo/parts/index.html' },
  ];

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer(url, max = 40) {
  for (let i = 0; i < max; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await wait(500);
  }
  throw new Error("Server did not start");
}

/* ---------------- RENDER ---------------- */
async function renderRoute(browser, route, index) {
  const page = await browser.newPage();

  try {
    /* ✅ DO NOT BLOCK CSS OR FONTS */
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const t = req.resourceType();
      if (
        ["document", "script", "xhr", "fetch", "stylesheet", "font"].includes(t)
      ) {
        req.continue();
      } else {
        req.abort();
      }
    });

    await page.setViewport({ width: 1200, height: 800 });

    await page.evaluateOnNewDocument(() => {
      window.__PRERENDERING__ = true;
    });

    await page.goto(`http://localhost:5000${route.path}`, {
      waitUntil: "networkidle2",
      timeout: 45000,
    });

    /* ✅ WAIT FOR REAL HTML CONTENT */
    try {
      await page.waitForSelector("h1", { timeout: 15000 });
    } catch {
      console.warn(`⚠️ H1 not detected on ${route.path}`);
    }

    /* Extra buffer for React Router v7 */
    await wait(500);

    const html = await page.content();
    const hasH1 = html.includes("<h1");

    const outputPath = join(distDir, route.output);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, "utf-8");

    console.log(
      `${hasH1 ? "✅" : "⚠️"} [${index + 1}/${routes.length}] ${route.path}`
    );

    return { success: true, hasH1 };
  } catch (e) {
    console.error(`❌ ${route.path}`, e.message);
    return { success: false, hasH1: false };
  } finally {
    await page.close();
  }
}

/* ---------------- MAIN ---------------- */
async function prerender() {
  console.log(`🚀 Prerendering ${routes.length} pages`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-renderer-backgrounding",
    ],
  });

  const server = exec("npx serve -s dist -l 5000");

  try {
    await waitForServer("http://localhost:5000");
  } catch {
    server.kill();
    await browser.close();
    throw new Error("Server failed");
  }

  for (let i = 0; i < routes.length; i++) {
    await renderRoute(browser, routes[i], i);
  }

  server.kill();
  await browser.close();

  console.log("🎉 Prerender complete");
}

prerender().catch((e) => {
  console.error(e);
  process.exit(1);
});