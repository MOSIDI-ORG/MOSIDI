import { defineStore } from 'pinia'

export const useMapExportStore = defineStore ({
    id: 'mapExport',
    state: () => ({
        exportDialog: false,
        formats: ['JPEG', 'PNG', 'SVG', 'PDF'],
        pageSize:["LETTER", "A2", "A3", "A4", "A5", "A6", "B2", "B3", "B4", "B5", "B6" ],
        DPI: [72, 96, 200, 300, 400],
        pageOrientation: ['Landscape', 'Portrait'],
        report: ''
    })
})