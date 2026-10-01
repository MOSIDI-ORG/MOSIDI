import { defineStore } from 'pinia'

export const useMapImportStore = defineStore ({
    id: 'mapImport',
    state: () => ({
        importDialog: false,
    })
})