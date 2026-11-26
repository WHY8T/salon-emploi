# Salon de l’Emploi: site de l’événement

Static site: HTML, CSS, vanilla JS. GSAP and ScrollTrigger load from cdnjs. No build step.

## Run
- Double-click `index.html`, or in VS Code use the "Live Server" extension (right click `index.html`, Open with Live Server).
- Fonts (Google Fonts) and GSAP need an internet connection.

## Edit (everything is in `js/config.js`)
- **Event date**: `event.start`, `event.end`, `event.label`. ISO format with `+01:00` for Algeria.
- **Countdown texts** (before / started / ended): `text`.
- **Letter**: `letter.greeting`, `letter.paragraphs`, `letter.signature`, `letter.role`.
- **The 10 hints**: `hints[]`. Set `unlocked: true`, or give an `unlockAt` date to unlock automatically. `icon` options are listed in the file.

## Other things to change
- **Link preview**: in `index.html` replace `YOUR-DOMAIN` in `og:image` with your real domain. The preview image is `assets/images/og.jpg` (1200x630).
- **Colors / fonts**: CSS variables at the top of `css/base.css`.
- **Speaker photo**: save the photo from salon.eicclub.org as `assets/images/speaker.webp` (right click it on the site, Save image as). Until then the page loads the site’s copy online.
- **Images**: `crow.webp` (used by the page, 130 KB) is generated from `crow.png` (original, 2.8 MB). Re-export the WebP if you replace the crow. `logo-eic-light.png` is the white logo used in the intro.
- **Icons**: inline sprite at the top of `index.html` (copy in `assets/icons/sprite.svg`).

## Files
- `css/base.css` tokens and reset, `layout.css` structure, `components.css` countdown, letter, drawer, `animations.css` initial states and intro.
- `js/countdown.js` rolling digits, `hints.js` hint list and drawer, `animations.js` intro and idle motion, `main.js` boot.

If GSAP fails to load, or after 7 seconds without a start, the page shows in its static state. With `prefers-reduced-motion`, the intro and idle motion are replaced by simple fades.

## Languages (FR / AR / EN)
All texts are in `js/config.js` under `i18n`. Wrap a word in *stars* to show it in red italic. Arabic switches the page to right-to-left. A link can force a language: `https://why8t.github.io/salon-emploi/?lang=en`. The choice is remembered on the visitor's device.

## Font
Fonts are set by `--font-display` and `--font-ui` in `css/base.css`, and loaded by the Google Fonts link in `index.html`. To change them, edit those two variables and the link (Arabic uses Cairo and Noto Naskh Arabic).

## Hints
Each hint is an envelope. Click an unlocked one: it flies to the centre, the wax seal cracks, the flap opens, the folded letter slides out, comes forward and unfolds. Sealed ones shake. The animation is in `js/hints.js` (`openReader`), the look of the letter and envelope is in `css/components.css`.
