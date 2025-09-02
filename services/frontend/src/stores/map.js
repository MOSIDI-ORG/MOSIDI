import { defineStore } from 'pinia'

export const useMapStore = defineStore ({
    id: 'map',
    state: () => ({
        center: [10.39217,51.11024],
        zoom: 5.4,
        pitch: 0,
        style: 'https://api.maptiler.com/maps/a2eb63ba-7d0e-4b25-9cfc-9ef74d786ec4/style.json?key=XgdreUwN4V3uEHHZHsWO'
    })
})