import { defineStore } from 'pinia'

export const usePointStyleStore = defineStore ({
    id: 'pintStyle',
    state: () => ({
        layerSpecification: {},
        circleStyleParams:{
            'circle-radius': 3,
            'circle-color':'#00FF00',
            'circle-opacity': 1,
            'circle-stroke-color': '#000000',
            'circle-stroke-width': 1,
            'circle-blur':0
        },
        labelStyleParams: {
            'text-color': '#202',
            'text-halo-color': '#fff',
            'text-halo-width': 2,
            'text-field': ['get', ''],  // Get the 'label' property for the text
            'text-size': 11,                 // Set text size
            'text-anchor': 'top',            // Position text above the point
            'text-offset': [0, 1.5],          // Optional: Adjust the offset of the text
            'text-letter-spacing': 0.05,
            'text-font': [
                'Open Sans Bold',
                'Arial Unicode MS Bold'
            ],
            
        },
        heatmapStyleParam:{
        
           'color-palette': ["#2166ac", "#67a9cf","#d1e5f0", "#fddbc7", "#ef8a62", "#b2182b"]
            
        },
        
       
        pointStyles: [{'name': 'Circle'}, {'name': 'Heatmap'}/*, {'name': 'Hexagon'}*/],
        addedLayersStyles: {
        },
        colorRecommendation: [
            ["#9e0142","#d53e4f","#f46d43"],
            [ "#fdae61","#fee08b", "#ffffbf"],
            ["#e6f598", "#abdda4", "#66c2a5"],
            ["#3288bd",  "#5e4fa2", '#005555'],
            ['#0000FF', '#0000AA', '#000055'],
        ],
        
        hexagonStyleParams: {
            'color-palette': ['#f7fcf0', '#ccebc5','#a8ddb5', '#43a2ca', '#0868ac'],
            'fill-opacity': 1,
            'fill-outline-color': '#808080'
        },
        
        
            
    }),
    actions: {
        addLayerStyle(name) {
            if(this.addedLayersStyles[name]==null){
                this.addedLayersStyles[name] = JSON.parse(JSON.stringify(this.circleStyleParams));
                this.addedLayersStyles[name]['labelStyleParams'] = JSON.parse(JSON.stringify(this.labelStyleParams));
                if(this.addedLayersStyles[name]['selectedLabelColumn']==null)
                {
                    this.addedLayersStyles[name]['selectedLabelColumn'] = ''
                }
                this.addedLayersStyles[name]['heatmapStyleParam'] = JSON.parse(JSON.stringify(this.heatmapStyleParam));
                this.addedLayersStyles[name]['selectedPointStyle'] = 'Circle'
                this.addedLayersStyles[name]['hexagonStyleParams'] = JSON.parse(JSON.stringify(this.hexagonStyleParams));
            }
            
        
        },
        addLayerColumnNames(layerName, columnNames){
            this.addedLayersStyles[layerName]['columnNames'] = columnNames;
        },
        toggleLabelSection(layerName){
            this.addedLayersStyles[layerName]['labelSectionToggle'] =! this.addedLayersStyles[layerName]['labelSectionToggle'];
        },
        /*addLabelStyle(name){
            this.addedLayersStyles[name]['labelStyleParams'] = JSON.parse(JSON.stringify(this.labelStyleParams));
            if(this.addedLayersStyles[name]['selectedLabelColumn']==null)
            {
                this.addedLayersStyles[name]['selectedLabelColumn'] = ''
            }
            
        }*/
       
    }
})