import { defineStore } from 'pinia'

export const usePolygonStyleStore = defineStore ({
    id: 'polygonStyle',
    state: () => ({
        polygonLayerSpecification: {},
        addedPolygonLayersStyles: {
        },
        polygonStyleParams:{
            'fill-color': '#0000ff',
            "fill-opacity": 0.7,
            "fill-outline-color": "#000000",
        },
        polygonStyles: [{'name': 'Simple'}, {'name': 'Categorized'}],
        colorRecommendation: [
            ["#9e0142","#d53e4f","#f46d43"],
            [ "#fdae61","#fee08b", "#ffffbf"],
            ["#e6f598", "#abdda4", "#66c2a5"],
            ["#3288bd",  "#5e4fa2", '#005555'],
            ['#0000FF', '#0000AA', '#000055'],
        ],
        outlineStyleParams:{
            'line-color': '#ffffff',
            "line-opacity": 0.8,
            "line-width":   1,
            'line-join': 'round'
        },
        lineCapOptions: ['butt', 'round', 'square'],
        lineJoinOptions: ['round', 'bevel', 'miter'],

            
    }),
    actions: {
        addLayerStyle(name) {
            if(this.addedPolygonLayersStyles[name]==null){
                this.addedPolygonLayersStyles[name] = JSON.parse(JSON.stringify(this.polygonStyleParams));
                this.addedPolygonLayersStyles[name]['selectedPolygonStyle'] = 'Simple'
                this.addedPolygonLayersStyles[name]['outlineStyleParams'] = JSON.parse(JSON.stringify(this.outlineStyleParams));
                if(this.addedPolygonLayersStyles[name]['selectedCategoryColumn']==null){
                    this.addedPolygonLayersStyles[name]['selectedCategoryColumn'] = ''
                }

                // initiate the categorize style
                this.addedPolygonLayersStyles[name]['categorizedStyle']=JSON.parse(JSON.stringify(this.polygonStyleParams))
            }
            
        },
        togglePolygonOutlineSection(layerName){
            this.addedPolygonLayersStyles[layerName]['polygonOutlineSection'] =! this.addedPolygonLayersStyles[layerName]['polygonOutlineSection'];
        },
        addLayerColumnNames(layerName, columnNames){
            this.addedPolygonLayersStyles[layerName]['columnNames'] = columnNames;
        },
        addCategorizedStyle(layerName, style){
            this.addedPolygonLayersStyles[layerName]['categorizedStyle']['fill-color'] = style;
        }
       
    }
})