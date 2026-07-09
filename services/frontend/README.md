# frontend

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Site configuration (runtime)
The app's map center/zoom/extent, page title, favicon, header logo, fonts,
and accent colors are not baked into the build. Instead they are loaded at
runtime from a JSON file in [`public/configs/`](public/configs/), e.g.
`public/configs/default.json`:
```
{
  "title": "InNoWest - MOSIDI",
  "favicon": "innowest-favicon.ico",
  "logo": "icons/innowest.svg",
  "fonts": {
    "family": "Helvetica, Arial, sans-serif",
    "url": ""
  },
  "colors": {
    "background": "rgba(0, 0, 0, 1)",
    "button": "#000000",
    "button-hover": "#444444"
  },
  "map-center": [18.39217, 81.11024],
  "map-extent": [
    [5.8662503507227770, 47.2701236046689104],
    [15.0418156563620684, 55.0587777156283096]
  ],
  "map-zoom": 5.4
}
```
`favicon` and `logo` are paths relative to `public/` (e.g. an SVG placed under
`public/icons/`). `logo` is shown in the app header ([`AppHeader.vue`](src/components/AppHeader.vue));
it falls back to `icons/innowest.svg` if omitted.

`fonts.family` is a CSS `font-family` value applied to the whole app via the
`--app-font-family` CSS custom property. `fonts.url`, if set, is optional and
points to a stylesheet to load at runtime (e.g. a Google Fonts `@import`
link) so a webfont referenced by `family` is actually available; omit or
leave it empty to use a font that's already installed/bundled.

`colors.background`, `colors.button`, and `colors.button-hover` are applied
as the CSS custom properties `--color-background`, `--color-button`, and
`--color-button-hover` (see [`src/services/config.js`](src/services/config.js)).
Any component can opt in with plain CSS, e.g. `background-color:
var(--color-background)`. Two components currently do:
- The zoom-in "+" icon ([`LegendUI.vue`](src/components/LegendUI.vue)) uses
  `--color-button`/`--color-button-hover` for its circle background, on hover.
- The dataset filter/bivariate/trivariate panel headers (the `.header` class
  in [`DatasetFilterUI.vue`](src/components/DatasetFilterUI.vue),
  [`AddedDatasetsUI.vue`](src/components/AddedDatasetsUI.vue),
  [`BivariateUI.vue`](src/components/BivariateUI.vue), and
  [`TrivariateUI.vue`](src/components/TrivariateUI.vue)) use
  `--color-background` instead of a hardcoded black.

Which config file is loaded is controlled by the `site` URL query parameter,
using the file name without the `.json` extension, e.g.:
```
https://example.com/app/?site=bbsr
```
loads `public/configs/bbsr.json`. If the `site` parameter is missing, or the
requested config fails to load, `public/configs/default.json` is loaded
instead.

To add a new site variant, add a new JSON file to `public/configs/` — no
rebuild is required, since these files are read directly at runtime (see
[`src/services/config.js`](src/services/config.js)).

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
