# SEO sitemap process

Keep `sitemap.xml` up to date whenever public pages change.

## What to run

From the repo root, run:

```bash
python scripts/update_sitemap_lastmod.py
```

## When to run it

- After editing any public page included in `sitemap.xml`
- Before deploying/publishing changes

## What it does

- Reads each `<loc>` in `sitemap.xml`
- Maps URL paths to local files (for `/`, it uses `index.html`)
- Sets `<lastmod>` to each file's current modification date (`YYYY-MM-DD`, UTC)
- Prints any sitemap URLs that do not map to an existing local file

## Quick checklist for content updates

1. Edit/add the page.
2. Add/update the page URL entry in `sitemap.xml` (if needed).
3. Run `python scripts/update_sitemap_lastmod.py`.
4. Commit updated page(s) and `sitemap.xml` together.
