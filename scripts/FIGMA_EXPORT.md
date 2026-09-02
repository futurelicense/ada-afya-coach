# Getting WeFit screens into Figma

There's no native React → Figma export. This produces a **self-contained HTML
file per screen** (rendered post-login, CSS + images inlined, scripts removed)
that the **html.to.design** Figma plugin turns into editable frames.

## 1. Capture the screens

**Locally:**
```bash
npm install --no-save playwright@1.47.2
npx playwright install chromium
node scripts/figma-export.mjs                      # captures the deployed site
# or: EXPORT_BASE=http://localhost:8080 node scripts/figma-export.mjs
```

**Or in CI** (no local browser needed): Actions tab → "Figma export" →
Run workflow → download the `wefit-figma-export` artifact.

Output lands in `figma-export/`:
```
figma-export/
  index.html                 ← gallery of every capture
  desktop/<group>/<screen>.html   + .png
  mobile/<group>/<screen>.html    + .png
```
~45 screens × 2 viewports: public, onboarding, member, vendor, trainer, gym,
influencer, admin.

## 2. Import into Figma

1. Install the **html.to.design** plugin (Figma Community).
2. Serve the folder so the plugin can read each page:
   ```bash
   npx serve figma-export
   ```
3. In Figma: run html.to.design → **Import via URL** → paste e.g.
   `http://localhost:3000/desktop/vendor/menu.html` → Import.
   Each becomes a frame with real text layers, auto-layout, and styles.
4. Repeat per screen (open `index.html` for the full list), or use the
   plugin's bulk/URL-list mode.

Prefer the plugin's **HTML paste** mode? Open a `.html` file, copy all,
paste into the plugin.

## Notes

- Screens render with the seed accounts' demo data (menus, orders,
  availability, posts) so nothing is empty. Password `OneFitness`.
- Fonts load from Google Fonts at import time — keep an internet connection.
- `/trainer/live` captures the pre-broadcast studio UI (no camera).
