import { defineStore } from 'pinia'

export const useLineStyleStore = defineStore ({
    id: 'lineStyle',
    state: () => ({
        lineLayerSpecification: {},
        addedLineLayersStyles: {
        },
        lineStyleParams:{
            'line-color': '#0000ff',
            "line-opacity": 0.8,
            "line-width":   1,
            'line-join': 'round',
            'line-cap': 'round',
            'line-blur': 0,
            "color-palette": ['#fef0d9', '#fdcc8a','#fc8d59', '#e34a33', '#b30000'],
        },
        lineStyles: [{'name': 'Simple'}, {'name': 'Graduated'}],
        colorRecommendation: [
            ["#9e0142","#d53e4f","#f46d43"],
            [ "#fdae61","#fee08b", "#ffffbf"],
            ["#e6f598", "#abdda4", "#66c2a5"],
            ["#3288bd",  "#5e4fa2", '#005555'],
            ['#0000FF', '#0000AA', '#000055'],
        ],
        lineCapOptions: ['butt', 'round', 'square'],
        lineJoinOptions: ['round', 'bevel', 'miter'],

            
    }),
    actions: {
        addLayerStyle(name) {
            if(this.addedLineLayersStyles[name]==null){
                this.addedLineLayersStyles[name] = JSON.parse(JSON.stringify(this.lineStyleParams));
                this.addedLineLayersStyles[name]['selectedLineStyle'] = 'Simple';
                if(this.addedLineLayersStyles[name]['selectedCategoryColumn']==null){
                    this.addedLineLayersStyles[name]['selectedCategoryColumn'] = ''
                }
                this.addedLineLayersStyles[name]['classifiedStyle']=JSON.parse(JSON.stringify(this.lineStyleParams))
            }
            
        },
        addLayerColumnNames(layerName, columns){
            let columnNames = []
            for (let i=0; i< columns.length; i++){
                columnNames.push(columns[i]['column_name'])
            }
            this.addedLineLayersStyles[layerName]['columnNames'] = columnNames;
        },
        addClassifiedStyle(layerName, style){
            this.addedLineLayersStyles[layerName]['classifiedStyle']['line-color'] = style;
        },
        addClassInformation(layerName, classInformation){
            this.addedLineLayersStyles[layerName]['classInformation'] = classInformation.intervals_5_classes
            ;
        }
    }
})