import { defineStore } from 'pinia'

export const useLayerStyleStore = defineStore ({
    id: 'layerStyle',
    state: () => ({
        styles:{
            polygon: {
                'fill-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    '#0000ff', // default color
                ],
                "fill-opacity": 0.7,
                "fill-outline-color": "black",
            },
            line: {
                'line-width': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    4, // highlight width
                    2, // default width
                ],
                'line-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    "#0000FF", // default color
                ],
                'line-opacity': 1,
            },
            point: {
                'circle-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    '#ffff00', // highlight color
                    '#00FF00', // default color
                ],
                'circle-stroke-color': [
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    "#ffffff", 
                    "#000000", 
                ],
                'circle-stroke-width':[
                    'case',
                    ['boolean',['feature-state', 'clicked'], false],
                    4, // highlight stroke-width
                    1, // default stroke-width
                ],
                'circle-opacity': 1,
                'circle-radius':3
            }
            
        },
        tableNames: []
    })
})