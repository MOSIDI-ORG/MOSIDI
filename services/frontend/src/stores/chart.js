import { defineStore } from 'pinia'

export const useChartStore = defineStore ({
    id: 'chart',
    state: () => ({
        selectedFeature: null
    })
})