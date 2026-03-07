// import puppeteer from "puppeteer";
// import { writeFileSync, mkdirSync } from "fs";
// import { join, dirname } from "path";
// import { fileURLToPath } from "url";
// import { exec } from "child_process";
// import { partsData } from "../src/assets/PartsData.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const distDir = join(__dirname, "../dist");

// // Generate part routes dynamically from partsData
// const partRoutes = Object.keys(partsData).map(partSlug => ({
//   path: `/used/${partSlug}`,
//   output: `used/${partSlug}/index.html`
// }));

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
//   { path: '/product-details', output: 'product-details/index.html' },
  
//   // Brand pages
//   { path: '/used/acura/parts', output: 'used/acura/parts/index.html' },
//   { path: '/used/bmw/parts', output: 'used/bmw/parts/index.html' },
//   { path: '/used/buick/parts', output: 'used/buick/parts/index.html' },
//   { path: '/used/cadillac/parts', output: 'used/cadillac/parts/index.html' },
//   { path: '/used/chevrolet/parts', output: 'used/chevrolet/parts/index.html' },
//   { path: '/used/chrysler/parts', output: 'used/chrysler/parts/index.html' },
//   { path: '/used/daewoo/parts', output: 'used/daewoo/parts/index.html' },
//   { path: '/used/daihatsu/parts', output: 'used/daihatsu/parts/index.html' },
//   { path: '/used/dodge/parts', output: 'used/dodge/parts/index.html' },
//   { path: '/used/eagle/parts', output: 'used/eagle/parts/index.html' },
//   { path: '/used/ford/parts', output: 'used/ford/parts/index.html' },
//   { path: '/used/gmc/parts', output: 'used/gmc/parts/index.html' },
//   { path: '/used/honda/parts', output: 'used/honda/parts/index.html' },
//   { path: '/used/hyundai/parts', output: 'used/hyundai/parts/index.html' },
//   { path: '/used/infiniti/parts', output: 'used/infiniti/parts/index.html' },
//   { path: '/used/isuzu/parts', output: 'used/isuzu/parts/index.html' },
//   { path: '/used/jaguar/parts', output: 'used/jaguar/parts/index.html' },
//   { path: '/used/jeep/parts', output: 'used/jeep/parts/index.html' },
//   { path: '/used/kia/parts', output: 'used/kia/parts/index.html' },
//   { path: '/used/land-rover/parts', output: 'used/land-rover/parts/index.html' },
//   { path: '/used/lexus/parts', output: 'used/lexus/parts/index.html' },
//   { path: '/used/lincoln/parts', output: 'used/lincoln/parts/index.html' },
//   { path: '/used/mazda/parts', output: 'used/mazda/parts/index.html' },
//   { path: '/used/benz/parts', output: 'used/benz/parts/index.html' },
//   { path: '/used/mercury/parts', output: 'used/mercury/parts/index.html' },
//   { path: '/used/mini-cooper/parts', output: 'used/mini-cooper/parts/index.html' },
//   { path: '/used/mitsubishi/parts', output: 'used/mitsubishi/parts/index.html' },
//   { path: '/used/nissan/parts', output: 'used/nissan/parts/index.html' },
//   { path: '/used/oldsmobile/parts', output: 'used/oldsmobile/parts/index.html' },
//   { path: '/used/plymouth/parts', output: 'used/plymouth/parts/index.html' },
//   { path: '/used/pontiac/parts', output: 'used/pontiac/parts/index.html' },
//   { path: '/used/porsche/parts', output: 'used/porsche/parts/index.html' },
//   { path: '/used/saab/parts', output: 'used/saab/parts/index.html' },
//   { path: '/used/saturn/parts', output: 'used/saturn/parts/index.html' },
//   { path: '/used/scion/parts', output: 'used/scion/parts/index.html' },
//   { path: '/used/subaru/parts', output: 'used/subaru/parts/index.html' },
//   { path: '/used/suzuki/parts', output: 'used/suzuki/parts/index.html' },
//   { path: '/used/toyota/parts', output: 'used/toyota/parts/index.html' },
//   { path: '/used/volkswagen/parts', output: 'used/volkswagen/parts/index.html' },
//   { path: '/used/volvo/parts', output: 'used/volvo/parts/index.html' },

//   // ADD ALL PART DETAIL PAGES HERE
//   ...partRoutes,
// ];

// const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// async function waitForServer(url, max = 40) {
//   for (let i = 0; i < max; i++) {
//     try {
//       const r = await fetch(url);
//       if (r.ok) return;
//     } catch {}
//     await wait(500);
//   }
//   throw new Error("Server did not start in time");
// }

// async function renderRoute(browser, route, index, totalRoutes) {
//   const page = await browser.newPage();

//   try {
//     await page.setRequestInterception(true);
//     page.on("request", (req) => {
//       const t = req.resourceType();
//       if (["document", "script", "xhr", "fetch", "stylesheet", "font"].includes(t)) {
//         req.continue();
//       } else {
//         req.abort();
//       }
//     });

//     await page.setViewport({ width: 1200, height: 800 });

//     await page.evaluateOnNewDocument(() => {
//       window.__PRERENDERING__ = true;
//     });

//     await page.goto(`http://localhost:5000${route.path}`, {
//       waitUntil: "networkidle2",
//       timeout: 45000,
//     });

//     // Wait for H1
//     try {
//       await page.waitForSelector("h1", { timeout: 15000 });
//     } catch {
//       console.warn(`⚠️ H1 not detected on ${route.path}`);
//     }

//     // For part detail pages ONLY (not brand pages), wait for ALL H2 tags to render
//     if (route.path.startsWith('/used/') && !route.path.includes('/parts')) {
//       try {
//         // Wait for the SEO models container
//         await page.waitForSelector(".abs-pump-seo-models-container", { timeout: 15000 });
        
//         // Wait for all H2 tags to be rendered
//         await page.waitForFunction(
//           () => {
//             const h2Elements = document.querySelectorAll('.abs-pump-seo-model-h2');
//             return h2Elements.length >= 750;
//           },
//           { timeout: 20000 }
//         );
        
//         // Extra wait to ensure everything is fully rendered
//         await wait(2000);
//       } catch (error) {
//         console.warn(`⚠️ Timeout waiting for all H2 tags on ${route.path}`);
//       }
//     } else {
//       await wait(1000);
//     }

//     const html = await page.content();
//     const hasH1 = html.includes("<h1");
//     const h2Count = (html.match(/<h2[^>]*class="abs-pump-seo-model-h2"/g) || []).length;

//     const outputPath = join(distDir, route.output);
//     mkdirSync(dirname(outputPath), { recursive: true });
//     writeFileSync(outputPath, html, "utf-8");

//     const h2Info = (route.path.startsWith('/used/') && !route.path.includes('/parts')) ? ` (${h2Count} H2 tags)` : '';
//     console.log(`${hasH1 ? "✅" : "⚠️"} [${index + 1}/${totalRoutes}] ${route.path}${h2Info}`);

//     return { success: true, hasH1 };
//   } catch (e) {
//     console.error(`❌ ${route.path}`, e.message);
//     return { success: false, hasH1: false };
//   } finally {
//     await page.close();
//   }
// }

// async function prerender() {
//   const totalRoutes = routes.length;
//   console.log(`🚀 Starting prerender for ${totalRoutes} pages`);

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-dev-shm-usage",
//       "--disable-gpu",
//     ],
//   });

//   const server = exec("npx serve -s dist -l 5000");

//   try {
//     console.log("⏳ Waiting for server to start...");
//     await waitForServer("http://localhost:5000");
//     console.log("✅ Server ready");
//   } catch (err) {
//     console.error("❌ Server failed to start");
//     server.kill();
//     await browser.close();
//     throw err;
//   }

//   for (let i = 0; i < totalRoutes; i++) {
//     await renderRoute(browser, routes[i], i, totalRoutes);
//   }

//   server.kill();
//   await browser.close();

//   console.log("🎉 Prerender complete!");
// }

// prerender().catch((e) => {
//   console.error("❌ Prerender failed:", e);
//   process.exit(1);
// });


import puppeteer from "puppeteer";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { partsData } from "../src/assets/PartsData.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");

// Generate part routes dynamically from partsData
const partRoutes = Object.keys(partsData).map(partSlug => ({
  path: `/used/${partSlug}`,
  output: `used/${partSlug}/index.html`
}));

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
  { path: '/product-details', output: 'product-details/index.html' },
  
  // Brand pages
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

  // Part detail pages
  ...partRoutes,
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
  throw new Error("Server did not start in time");
}

async function renderRoute(browser, route, index, totalRoutes) {
  const page = await browser.newPage();

  try {
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const t = req.resourceType();
      if (["document", "script", "xhr", "fetch", "stylesheet", "font"].includes(t)) {
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

    // Wait for H1
    try {
      await page.waitForSelector("h1", { timeout: 15000 });
    } catch {
      console.warn(`⚠️ H1 not detected on ${route.path}`);
    }

    // Simple wait for all pages
    await wait(1000);

    const html = await page.content();
    const hasH1 = html.includes("<h1");

    const outputPath = join(distDir, route.output);
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, html, "utf-8");

    console.log(`${hasH1 ? "✅" : "⚠️"} [${index + 1}/${totalRoutes}] ${route.path}`);

    return { success: true, hasH1 };
  } catch (e) {
    console.error(`❌ ${route.path}`, e.message);
    return { success: false, hasH1: false };
  } finally {
    await page.close();
  }
}

async function prerender() {
  const totalRoutes = routes.length;
  console.log(`🚀 Starting prerender for ${totalRoutes} pages`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  const server = exec("npx serve -s dist -l 5000");

  try {
    console.log("⏳ Waiting for server to start...");
    await waitForServer("http://localhost:5000");
    console.log("✅ Server ready");
  } catch (err) {
    console.error("❌ Server failed to start");
    server.kill();
    await browser.close();
    throw err;
  }

  for (let i = 0; i < totalRoutes; i++) {
    await renderRoute(browser, routes[i], i, totalRoutes);
  }

  server.kill();
  await browser.close();

  console.log("🎉 Prerender complete!");
}

prerender().catch((e) => {
  console.error("❌ Prerender failed:", e);
  process.exit(1);
});