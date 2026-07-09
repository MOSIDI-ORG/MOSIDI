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
The app's map center/zoom/extent, page title, favicon, and header logo are not
baked into the build. Instead they are loaded at runtime from a JSON file in
[`public/configs/`](public/configs/), e.g. `public/configs/default.json`:
```
{
  "title": "InNoWest - MOSIDI",
  "favicon": "innowest-favicon.ico",
  "logo": "icons/innowest.svg",
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
