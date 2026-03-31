import 'bootstrap/dist/css/bootstrap.css';
import "@mdi/font/css/materialdesignicons.min.css";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { createApp } from 'vue';
import axios from 'axios';
import { createPinia } from "pinia";
import '../node_modules/maplibre-gl/dist/maplibre-gl.css';
import App from './App.vue';
import router from './router';
import { createI18n } from 'vue-i18n';
import messages from './i18n';
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

library.add(fas, far, fab);
const app = createApp(App);

// i18n part
// Detect the user's browser language
const userLocale = navigator.language || navigator.userLanguage;
// If the detected locale is German, use it. Otherwise, fall back to English.
const locale = userLocale.startsWith('de') ? 'de' : 'en';

const i18n = createI18n({
  legacy: false,
  locale: locale,  // Automatically detected
  fallbackLocale: 'en',
  messages,
});


axios.defaults.withCredentials = true;

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
          mdi,
        },
    },
})

app.use(router);
app.use(createPinia());
app.use(vuetify);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(i18n);
app.mount("#app");