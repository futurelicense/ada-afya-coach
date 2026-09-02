/**
 * Figma export — capture every WeFit screen as a self-contained HTML file
 * (rendered post-login, all CSS + images inlined) plus a PNG reference.
 *
 * Import the resulting folder with the html.to.design Figma plugin
 * (URL mode against `npx serve figma-export`, or its HTML paste mode).
 *
 * Usage:
 *   npx playwright install chromium         # once
 *   node scripts/figma-export.mjs                       # against the deployed site
 *   EXPORT_BASE=http://localhost:8080 node scripts/figma-export.mjs   # against local dev
 */

import { chromium } from "playwright";
import { writeFile, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.EXPORT_BASE ?? "https://wecoach.vercel.app").replace(/\/$/, "");
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "https://njwbvbbsbowtfevsocnn.supabase.co";
const ANON = process.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qd2J2YmJzYm93dGZldnNvY25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDM0MDEsImV4cCI6MjEwMjg3OTQwMX0.im7hpiCmBkyEpE2nNBnEzrU81qDFm5oYQROWacorJD0";
const PASSWORD = "OneFitness";
const OUT = path.resolve("figma-export");

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

// auth: null = public; otherwise the seed email whose session to inject.
const SCREENS = [
  { group: "public", name: "landing",         path: "/",                auth: null },
  { group: "public", name: "pricing",         path: "/pricing",         auth: null },
  { group: "public", name: "about",           path: "/about",           auth: null },
  { group: "public", name: "auth-signin",     path: "/auth",            auth: null },
  { group: "public", name: "auth-signup",     path: "/auth?mode=signup", auth: null },
  { group: "public", name: "privacy",         path: "/privacy",         auth: null },
  { group: "public", name: "terms",           path: "/terms",           auth: null },
  { group: "public", name: "security",        path: "/security",        auth: null },
  { group: "public", name: "not-found",       path: "/no-such-page",    auth: null },

  { group: "onboarding", name: "onboarding",     path: "/onboarding",     auth: "user@wefit.ng" },
  { group: "onboarding", name: "role-selection", path: "/role-selection", auth: "user@wefit.ng" },

  { group: "member", name: "dashboard", path: "/dashboard", auth: "user@wefit.ng" },
  { group: "member", name: "workouts",  path: "/workouts",  auth: "user@wefit.ng" },
  { group: "member", name: "nutrition", path: "/nutrition", auth: "user@wefit.ng" },
  { group: "member", name: "analytics", path: "/analytics", auth: "user@wefit.ng" },
  { group: "member", name: "explore",   path: "/explore",   auth: "user@wefit.ng" },
  { group: "member", name: "community", path: "/community", auth: "user@wefit.ng" },
  { group: "member", name: "profile",   path: "/profile",   auth: "user@wefit.ng" },

  { group: "vendor", name: "dashboard", path: "/vendor",          auth: "vendor@wefit.ng" },
  { group: "vendor", name: "menu",      path: "/vendor/menu",     auth: "vendor@wefit.ng" },
  { group: "vendor", name: "orders",    path: "/vendor/orders",   auth: "vendor@wefit.ng" },
  { group: "vendor", name: "listing",   path: "/vendor/listing",  auth: "vendor@wefit.ng" },
  { group: "vendor", name: "requests",  path: "/vendor/requests", auth: "vendor@wefit.ng" },

  { group: "trainer", name: "dashboard",    path: "/trainer",             auth: "trainer@wefit.ng" },
  { group: "trainer", name: "bookings",     path: "/trainer/bookings",    auth: "trainer@wefit.ng" },
  { group: "trainer", name: "clients",      path: "/trainer/clients",     auth: "trainer@wefit.ng" },
  { group: "trainer", name: "availability", path: "/trainer/availability", auth: "trainer@wefit.ng" },
  { group: "trainer", name: "live",         path: "/trainer/live",        auth: "trainer@wefit.ng" },
  { group: "trainer", name: "listing",      path: "/trainer/listing",     auth: "trainer@wefit.ng" },
  { group: "trainer", name: "requests",     path: "/trainer/requests",    auth: "trainer@wefit.ng" },

  { group: "gym", name: "dashboard", path: "/gym",          auth: "gymowner@wefit.ng" },
  { group: "gym", name: "members",   path: "/gym/members",  auth: "gymowner@wefit.ng" },
  { group: "gym", name: "plans",     path: "/gym/plans",    auth: "gymowner@wefit.ng" },
  { group: "gym", name: "listing",   path: "/gym/listing",  auth: "gymowner@wefit.ng" },
  { group: "gym", name: "requests",  path: "/gym/requests", auth: "gymowner@wefit.ng" },

  { group: "influencer", name: "dashboard",    path: "/influencer",              auth: "influencer@wefit.ng" },
  { group: "influencer", name: "content",      path: "/influencer/content",      auth: "influencer@wefit.ng" },
  { group: "influencer", name: "followers",    path: "/influencer/followers",    auth: "influencer@wefit.ng" },
  { group: "influencer", name: "partnerships", path: "/influencer/partnerships", auth: "influencer@wefit.ng" },
  { group: "influencer", name: "listing",      path: "/influencer/listing",      auth: "influencer@wefit.ng" },
  { group: "influencer", name: "requests",     path: "/influencer/requests",     auth: "influencer@wefit.ng" },

  { group: "admin", name: "dashboard", path: "/admin", auth: "admin@wefit.ng" },
];

async function getSession(email) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`login ${email}: ${res.status} ${await res.text()}`);
  return res.json();
}

// Runs in the page: gather same-origin CSS text + every image/bg as a data URI.
async function collectAssets() {
  const cssParts = [];
  const crossOriginHrefs = [];
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      cssParts.push(Array.from(sheet.cssRules).map((r) => r.cssText).join("\n"));
    } catch {
      if (sheet.href) crossOriginHrefs.push(sheet.href);
    }
  }

  const urls = new Set();
  document.querySelectorAll("img[src]").forEach((el) => urls.add(el.src));
  document.querySelectorAll("*").forEach((el) => {
    const bg = getComputedStyle(el).backgroundImage;
    const m = bg && bg.match(/url\(["']?([^"')]+)["']?\)/);
    if (m && !m[1].startsWith("data:")) urls.add(new URL(m[1], location.href).href);
  });

  const dataUris = {};
  await Promise.all(Array.from(urls).map(async (u) => {
    try {
      const r = await fetch(u);
      const blob = await r.blob();
      if (blob.size > 3_000_000) return; // skip huge
      dataUris[u] = await new Promise((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result);
        fr.readAsDataURL(blob);
      });
    } catch { /* leave as-is */ }
  }));

  return { css: cssParts.join("\n"), crossOriginHrefs, dataUris };
}

function buildHtml(rawHtml, css, dataUris) {
  let html = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, "")
    .replace(/<link[^>]+rel=["']?modulepreload["']?[^>]*>/gi, "");

  for (const [url, data] of Object.entries(dataUris)) {
    html = html.split(url).join(data);
    // also the path-only form
    try { html = html.split(new URL(url).pathname).join(data); } catch { /* noop */ }
  }

  return html.replace(/<\/head>/i, `<style>\n${css}\n</style>\n</head>`);
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  const browser = await chromium.launch();
  const sessions = {};
  const manifest = [];

  for (const vp of VIEWPORTS) {
    for (const s of SCREENS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
      });

      if (s.auth) {
        if (!sessions[s.auth]) sessions[s.auth] = await getSession(s.auth);
        const sess = sessions[s.auth];
        await context.addInitScript(([k, v]) => {
          try { localStorage.setItem(k, v); } catch { /* noop */ }
        }, ["wefit_session", JSON.stringify(sess)]);
      }

      const page = await context.newPage();
      const dir = path.join(OUT, vp.name, s.group);
      await mkdir(dir, { recursive: true });
      const base = path.join(dir, s.name);

      try {
        await page.goto(`${BASE}${s.path}`, { waitUntil: "networkidle", timeout: 45000 });
        await page.waitForTimeout(2500); // lazy chunks + data fetches + animations
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(600);
        await page.evaluate(() => window.scrollTo(0, 0));

        await page.screenshot({ path: `${base}.png`, fullPage: true });

        const assets = await page.evaluate(collectAssets);
        let css = assets.css;
        for (const href of assets.crossOriginHrefs) {
          try { css += "\n" + (await (await fetch(href)).text()); } catch { /* noop */ }
        }
        const rawHtml = await page.content();
        await writeFile(`${base}.html`, buildHtml(rawHtml, css, assets.dataUris));

        manifest.push({ viewport: vp.name, group: s.group, name: s.name, path: s.path });
        console.log(`✓ ${vp.name}/${s.group}/${s.name}`);
      } catch (err) {
        console.warn(`✗ ${vp.name}/${s.group}/${s.name}: ${err.message}`);
      }

      await context.close();
    }
  }

  await browser.close();

  const rows = manifest.map((m) =>
    `<tr><td>${m.viewport}</td><td>${m.group}</td><td><a href="${m.viewport}/${m.group}/${m.name}.html">${m.name}</a></td><td><a href="${m.viewport}/${m.group}/${m.name}.png">png</a></td><td>${m.path}</td></tr>`).join("\n");
  await writeFile(path.join(OUT, "index.html"),
    `<!doctype html><meta charset=utf-8><title>WeFit screens</title>
<style>body{font:14px system-ui;margin:2rem}table{border-collapse:collapse}td{border:1px solid #ddd;padding:4px 10px}</style>
<h1>WeFit — ${manifest.length} captures</h1>
<p>Serve this folder (<code>npx serve figma-export</code>) then point the html.to.design Figma plugin at each URL.</p>
<table><tr><th>vp</th><th>group</th><th>screen</th><th></th><th>route</th></tr>${rows}</table>`);

  console.log(`\nDone — ${manifest.length} captures in ${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
