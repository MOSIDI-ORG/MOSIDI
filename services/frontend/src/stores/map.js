import { defineStore } from 'pinia'
import config from '../config.json'
export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: config['map-center'],
        zoom: config['map-zoom'],
        pitch: 0,
        //style: 'https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO'
        style: 'https://sgx.geodatenzentrum.de/gdz_basemapworld_vektor/styles/bm_web_wld_col.json',
        extent: config['map-extent']
    })
})