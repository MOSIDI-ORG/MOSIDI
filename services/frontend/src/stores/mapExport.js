import { defineStore } from 'pinia'

export const useMapExportStore = defineStore ({
    id: 'mapExport',
    state: () => ({
        exportDialog: false,
        formats: ['png', 'jpeg', 'pdf'],
        report: ''
    })
})