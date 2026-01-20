import { defineStore } from 'pinia'

export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: [10.39217,51.11024],
        zoom: 5.4,
        pitch: 0,
        //style: 'https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO'
        style: 'https://sgx.geodatenzentrum.de/gdz_basemapworld_vektor/styles/bm_web_wld_col.json',
        extent: [
            [5.8662503507227770, 47.2701236046689104], 
            [15.0418156563620684, 55.0587777156283096]
        ],
    })
})