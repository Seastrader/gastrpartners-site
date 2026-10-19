# GasTRPartners — static site (draft)

Plain HTML/CSS/JS, no build step. Upload the folder contents to any static host
(document root = this folder). Intended domain: gastrpartners.com.

- `index.html` — single page (EN default content, SEO-friendly)
- `js/i18n.js` — EN / TR / FR strings; edit copy here
- `js/main.js` — language switcher (localStorage `gp-lang`, `?lang=tr|fr`), menu, animations
- `css/styles.css` — all styling
- `favicon.svg`, `assets/` — icons and Open Graph image
- `previews/` — screenshots (not needed in production)

Local preview: `python3 -m http.server 8080` then open http://localhost:8080
