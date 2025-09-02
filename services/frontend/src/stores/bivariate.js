import { defineStore } from 'pinia'

export const useBivariateStore = defineStore ({
    id: 'bivariate',
    state: () => ({
        bivariateColorpalette: {
             'high_low': '#be64ac', 'high_medium': '#8c62aa', 'high_high':'#3b4994',
             'medium_low': '#dfb0d6', 'medium_medium': '#a5add3', 'medium_high':'#5698b9',
            'low_low': '#e8e8e8', 'low_medium': '#ace4e4', 'low_high':'#5ac8c8'
        },
        bivariateLegend: false,
        firstVariableClasses: null,
        secondVariableClasses: null,
        bivariateActivated: false

    }),
    actions: {
        setFirstVariableClasses(data){
            this.firstVariableClasses=data.classification_result
        },
        setSecondvariableClasses(data){
            this.secondVariableClasses=data.classification_result
        }
    }
})