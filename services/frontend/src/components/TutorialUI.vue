<script setup>
import { nextTick, watch, defineProps } from 'vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import { storeToRefs } from 'pinia'
import { useTutorialStore } from '../stores/tutorial'
import { useDatasetSearchStore } from '../stores/datasetSearch'
//import { useMenuStore } from '../stores/menu'


const tutorialStore = useTutorialStore()
const { onboardingTutorial } = storeToRefs(tutorialStore)
//let { isMinimized } = storeToRefs(useMenuStore())

const datasetSearchStore = useDatasetSearchStore()
//const { filterInitiated } = storeToRefs(datasetSearchStore)

let driverObj = null
const props = defineProps({
  map: {
    type: Object,
    default: null
  }
});

const startTutorial = () => {
  driverObj = driver({
    showProgress: true,
    disableActiveInteraction: true,
    allowClose: true,
    showButtons: ['next', 'close'],
    overlayClickBehavior: 'none',
    

    
    onDestroyStarted: () => {
        window.dispatchEvent(
            new CustomEvent('tour:remove-layer', {
                detail: {
                    layerName: "(SDG 1) Armut - Altersarmut_Bundesländer",
                    layerType: "indikator",
                }
            })
        )
        window.dispatchEvent(
            new CustomEvent('tour:open-custom-indicator-ui', {
                detail: {
                    mode: false
                }
            })
        )

        // Reset dataset search
        datasetSearchStore.filterInitiated = false

       

        // If the tutorial was completed, persist completion
        const isLastStep =
            driverObj?.getActiveIndex() ===
            driverObj?.getConfig().steps.length - 1

        if (isLastStep) {
            tutorialStore.markOnboardingCompleted()
        }

        driverObj?.destroy()

    },
    onDestroyed: () => {
      tutorialStore.endOnboarding()
    },

    steps: [
     
        {
            element: '#indicator-search-activation',

            popover: {
                title: 'Find an indicator',
                showCloseButton: true,

                description:
                `
                    <div style="line-height: 1.5;">
                        Search and explore indicators such as
                        <strong>Socio-economical</strong>,
                        or <strong>environmental data</strong>.
                        <br><br>
                        <span style="opacity: 0.75;">
                            Click here to open the indicator search panel.
                        </span>
                    </div>
                `,

                onNextClick: async () => {

                    datasetSearchStore.setActivatedDatasetSearch({
                        activatedDatasetSearch: 'indicator'
                    })
                    datasetSearchStore.activateDatasetSearch({
                        searchInitiated: true,
                    })

                    datasetSearchStore.filterInitiated = true

                    await nextTick()


                    driverObj.moveNext()
                }
                
                
            }
            
        },
        {
        
            element: '#dataset-filter-header',
            popover: {
                title: 'Filter and explore',
                description: `
                    <div style="line-height: 1.5;">
                        Narrow down the available indicators using
                        <strong>geographic level</strong>, <strong>time</strong>,
                        <strong>category</strong>, and <strong>source</strong>.
                    </div>
                `
            }
        },
        {
        
            element: '#dataset-filter-body',
            popover: {
                title: 'Add an indicator',
                description: `
                    <div style="line-height: 1.5;">
                        Review the filtered results and choose an indicator
                        to <strong>add it to the map</strong>.
                        <br><br>
                        <span style="opacity: 0.75;">
                            Added datasets appear in the panel on the left.
                        </span>
                    </div>
                `,
                onNextClick: async () => {
                    let title = '(SDG 1) Armut - Altersarmut'
                    let geometryType = 'Polygon'
                    let geocodingLevel = 'Bundesländer'
                    //let layerType = 'indikator'
                    window.dispatchEvent(
                        new CustomEvent('tour:add-layer', {
                            detail: {
                                title: title,
                                geometryType: geometryType,
                                geocodingLevel: geocodingLevel
                            }
                        })
                    )

                   
      
                    await nextTick()

                    driverObj.moveNext()
                   
                }

            },
            
        },
        {
        
            element: '#added-indicator-tour',
           
            popover: {
            title: 'Manage your dataset',
            description: `
                <div style="line-height: 1.5;">
                    <strong>Click a dataset</strong> to explore its data and
                    <strong>drag</strong> it to change its map order.
                    <br><br>

                    <div style="font-size: 13px; opacity: 0.85;">
                        Use <strong>⋮</strong> for additional actions:
                    </div>

                    <ul style="
                        margin: 6px 0 0 18px;
                        padding: 0;
                        line-height: 1.6;
                    ">
                        <li>View metadata</li>
                        <li>Zoom to the dataset</li>
                        <li>Remove the dataset</li>
                        <li>Export the data</li>
                    </ul>
                </div>
            `,
                onNextClick: async () => {
                    let title = '(SDG 1) Armut - Altersarmut'
                    let geometryType = 'Polygon'
                    let geocodingLevel = 'Bundesländer'
                    let layerType = 'indikator'
                    

                    window.dispatchEvent(
                        new CustomEvent('tour:add-data-ui', {
                            detail: {
                                title: title,
                                layerType: layerType,
                                geometryType: geometryType,
                                geocodingLevel: geocodingLevel
                            }
                        })
                    )
                
                    await nextTick()

                    driverObj.moveNext()
                   
                }
            }
        },
        {
        
            element: '#added-dataset-time',
           
            popover: {
                title: 'Explore the timeline',
                description: `
                    <div style="line-height: 1.5;">
                        Select a time in the dropdown menu,
                        or use the animation to explore how the data changes over time.
                        <br><br>
                        <span style="opacity: 0.75;">
                            A map layer is created for the selected time.
                        </span>
                    </div>
                `
            }
        },
        {
        
            element: '#added-dataset-detailed-operations',
           
            popover: {
                title: 'Customize the map',
                description: `
                    <div style="line-height: 1.5;">
                        Explore and customize how your indicator is displayed.
                        
                        <ul style="
                            margin: 10px 0 0 18px;
                            padding: 0;
                            line-height: 1.7;
                        ">
                            <li>Switch between <strong>Polygon</strong> and <strong>Circle</strong> views</li>
                            <li>Explore the <strong>value distribution</strong></li>
                            <li>Change the <strong>classification method</strong></li>
                            <li>Choose a <strong>color palette</strong> and adjust transparency</li>
                        </ul>
                    </div>
                `,
                onNextClick: async () => {
                    //isMinimized.value=true
                    const map = props.map
                    if (!map) return

                    // wait for map to be idle
                    if (!map.isStyleLoaded() || !map.areTilesLoaded()) {
                        await new Promise(r => map.once('idle', r))
                    }

                    const targetLngLat = {
                        lng: 13.702275690198121,
                        lat: 48.69781137808107
                    }
                    const point = map.project(targetLngLat)

                    const layerId = "kommunales_gebiet_dashboard(SDG 1) Armut - Altersarmut_Bundesländer"
                    const features = map.queryRenderedFeatures(point, { layers: [layerId] })

                    if (!features.length) {
                        console.warn('No feature under the coordinate')
                        // still continue so the tour does not get stuck
                    } else {
                        map.fire('click', {
                            lngLat: targetLngLat,
                            point,
                            features,
                            originalEvent: new MouseEvent('click', {
                                clientX: point.x,
                                clientY: point.y,
                                bubbles: true
                            })
                        })
                    }

                    await nextTick()
                    driverObj.moveNext()
                }
            }
        },
        {
            element: '#attribute-popup-div',
            
            popover: {
                title: 'Explore a location: Popup',
                description: 'The popup shows the information about the clicked region including indicator value, time, and additional information.',
                
            }
        },
        {
            element: '#indicatorChart',
            popover: {
                title: 'Explore the distribution',
                description: `
                    <div style="line-height: 1.5;">
                        The changes of the indicator over available time is shown by clicking on a region.
                    </div>
                `,
                onNextClick: async() => {
                   document.querySelector('.maplibregl-popup-close-button')?.click()
                window.dispatchEvent(new CustomEvent('tour:close-d3-chart'))

                // show the ellipsis button
                //isMinimized.value = false
                await nextTick()
               const ellipsisBtn = document.getElementById('added-layer-ellipsis-btn')
                ellipsisBtn?.click()

            // Helper: Wait until Vuetify attaches the menu list to the DOM
            const waitForMenu = (selector, timeout = 3500) => {
                return new Promise((resolve) => {
                    const start = performance.now()
                    const interval = setInterval(() => {
                        const el = document.querySelector(selector)
                        if (el || performance.now() - start > timeout) {
                            clearInterval(interval)
                            resolve(el)
                        }
                    }, 50)
                })
            }

                // Wait until the teleported v-list appears in DOM
                await waitForMenu('#added-layer-ellipsis-list')
                 await nextTick()
                driverObj.moveNext()
                }
                
            },
            
        },
        {
            element: '#added-layer-ellipsis-list',
           
            popover: {
                title: 'Dataset actions',
                description: `
                    <div style="line-height: 1.5;">
                        Use the <strong>⋮</strong> menu to manage the selected dataset.
                        
                        <ul style="
                            margin: 10px 0 0 18px;
                            padding: 0;
                            line-height: 1.7;
                        ">
                            <li>View <strong>metadata</strong></li>
                            <li>Zoom to the dataset <strong>extent</strong></li>
                            <li><strong>Remove</strong> the dataset from the map</li>
                            <li><strong>Export</strong> the underlying data</li>
                        </ul>
                    </div>
                `,
                onNextClick: async () =>{
                    const ellipsisBtn = document.getElementById('added-layer-ellipsis-export-data-btn')
                    ellipsisBtn?.click()
                    const waitForMenu = (selector, timeout = 3500) => {
                            return new Promise((resolve) => {
                                const start = performance.now()
                                const interval = setInterval(() => {
                                    const el = document.querySelector(selector)
                                    if (el || performance.now() - start > timeout) {
                                        clearInterval(interval)
                                        resolve(el)
                                    }
                                }, 50)
                            })
                        }

                    // Wait until the teleported v-list appears in DOM
                    await waitForMenu('#added-layer-ellipsis-export-data-list')
                    await nextTick()
                    driverObj.moveNext()
                    
                }
                
            }
        },
        {
            element: '#added-layer-ellipsis-export-data-list',
           
            popover: {
                title: 'Export your data',
                description: `
                    <div style="line-height: 1.5;">
                        Download the selected dataset locally in
                        <strong>GeoJSON</strong> or <strong>CSV</strong> format.
                    </div>
                `,
                onNextClick:  async () =>{
                    const ellipsisBtn = document.getElementById('added-layer-ellipsis-btn')
                    ellipsisBtn?.click()
                    
                    await nextTick()
                    driverObj.moveNext()
                }
                
            }
        },
        {
            element: '#data-combine-btn',
           
            popover: {
                title: 'Combine indicators',
                description: `
                    <div style="line-height: 1.5;">
                        Combine multiple indicators to explore relationships
                        between different datasets.
                        <br><br>
                        Choose between <strong>Bivariate</strong> and
                        <strong>Trivariate</strong> analysis.
                    </div>
                `,
                onNextClick: async() =>{
                    window.dispatchEvent(
                        new CustomEvent('tour:open-combine-ui', {
                            detail: {
                                mode: 'bivariate'
                            }
                        })
                    )
                    await nextTick()

                    driverObj.moveNext()
                }
                
                
            },
        },
        {
            element: '#bivariate-ui-element',
           
            popover: {
                title: 'Bivariate UI',
                description: `
                    <div style="line-height: 1.5;">
                        Select a <strong>second indicator</strong> to compare
                        with the currently selected indicator.
                        <br><br>
                        <span style="opacity: 0.75;">
                            The map and legend will update to show both indicators together.
                        </span>
                    </div>
                    <div style="
                            margin-top: 10px;
                            padding: 8px 10px;
                            border-radius: 6px;
                            background: rgba(0,0,0,0.05);
                            font-size: 12px;
                        ">
                            <strong>Note:</strong>The selected indicators must use
                            the same geographic level.
                        </div>
                `,
                onNextClick: async () =>{
                    window.dispatchEvent(
                        new CustomEvent('tour:add-second-indicator', {
                            detail: {
                                dct_title: "(SDG 1) Armut - Kinderarmut", 
                                dcatde_politicalgeocodingleveluri: "Bundesländer"
                            }
                        })
                    )
                    datasetSearchStore.toggleDataUI({
                        dataUiInitiated : false,
                    })

                    await nextTick()
                    driverObj.moveNext()
                }                
            },
        },
        {
            element: '#legend-ui-tour',
            popover: {
                title: 'Read the bivariate map',
                description: `
                    <div style="line-height: 1.5;">
                        The <strong>Y-axis</strong> represents the first indicator,
                        while the <strong>X-axis</strong> represents the second.
                        <br><br>
                        The <strong>3 × 3 grid</strong> combines their values,
                        helping you identify areas where both indicators are
                        <strong>low</strong>, <strong>high</strong>, or in between.
                    </div>
                `,
               onNextClick: async() =>{
                    window.dispatchEvent(
                        new CustomEvent('tour:open-combine-ui', {
                            detail: {
                                mode: 'trivariate'
                            }
                        })
                    )
                    await nextTick()
                     window.dispatchEvent(
                        new CustomEvent('tour:add-trivariate-indicators', {
                            detail: {
                                dct_title: "(SDG 1) Armut - Kinderarmut", 
                                dcatde_politicalgeocodingleveluri: "Bundesländer"
                            }
                        })
                    )
                    window.dispatchEvent(
                        new CustomEvent('tour:add-trivariate-indicators', {
                            detail: {
                                dct_title: "(SDG 1) SGB II-/SGB XII-Quote", 
                                dcatde_politicalgeocodingleveluri: "Bundesländer"
                            }
                        })
                    )
                    datasetSearchStore.toggleDataUI({
                        dataUiInitiated : true,
                    })
                    await nextTick()
                    driverObj.moveNext()
                }
            },
        },
        {
            element: '#trivariate-ui-element',
           
            popover: {
                title: 'Trivariate UI',
                description: `
                    <div style="line-height: 1.5;">
                        Select a <strong>third indicator</strong> to extend the
                        comparison to three variables.
                        <br><br>
                        Click <strong>Apply</strong> to update the map and legend.
                    </div>
                    <div style="
                            margin-top: 10px;
                            padding: 8px 10px;
                            border-radius: 6px;
                            background: rgba(0,0,0,0.05);
                            font-size: 12px;
                        ">
                            <strong>Note:</strong>The selected indicators must use
                            the same geographic level.
                        </div>
                `,
                onNextClick: async () =>{
                    window.dispatchEvent(
                        new CustomEvent('tour:add-trivariate-map')
                    )
                    datasetSearchStore.toggleDataUI({
                        dataUiInitiated : false,
                    })
                    await nextTick()
                    driverObj.moveNext()
                }
                
                           
            },
        },
        
        {
            element: '#legend-ui-tour',
           
            popover: {
                title: 'Read the trivariate map',
                description: `
                    <div style="line-height: 1.5;">
                        The triangle legend represents the <strong>three selected indicators</strong>.
                        <br><br>
                        Each point represents a region. Its position in the triangle
                        shows the relative contribution of the three indicators,
                        while the map color reflects the same relationship spatially.
                    </div>
                `,
                onNextClick: async () =>{
                    datasetSearchStore.toggleDataUI({
                        dataUiInitiated : false,
                    })
                   datasetSearchStore.setActivatedDatasetSearch({
                        activatedDatasetSearch: 'indicator'
                    })
                    datasetSearchStore.activateDatasetSearch({
                        searchInitiated: true,
                    })

                    datasetSearchStore.filterInitiated = true

                    window.dispatchEvent(
                        new CustomEvent('tour:remove-layer', {
                            detail: {
                                layerName: "(SDG 1) Armut - Altersarmut_Bundesländer",
                                layerType: "indikator",
                            }
                        })
                    )
                    await nextTick()
                    driverObj.moveNext()
                }          
            },
           
        },
        {
            element: '#custom-indicator-btn',
           
            popover: {
                title: 'Create a custom indicator',
                description: `
                    <div style="line-height: 1.5;">
                        Build a new indicator by combining existing datasets
                        with your own formula.
                        <br><br>
                        <span style="opacity: 0.75;">
                            Click here to open the custom indicator builder.
                        </span>
                    </div>
                `,
                onNextClick: async() =>{
                    window.dispatchEvent(
                        new CustomEvent('tour:open-custom-indicator-ui', {
                            detail: {
                                mode: true
                            }
                        })
                    )
                    await nextTick()

                    driverObj.moveNext()
                }
                           
            },
           
        },
        {
            element: '#custom-indicator-ui-tour',
           
            popover: {
                title: 'Build your formula',
               description: `
                    <div style="line-height: 1.5;">
                        <ol style="
                            margin: 8px 0 0 20px;
                            padding: 0;
                            line-height: 1.7;
                        ">
                            <li>Select the indicators you want to combine.</li>
                            <li>Build your formula using
                                <strong>+, −, ×, ÷, (, ), ^</strong>.
                            </li>
                            <li>Click <strong>Add Layer</strong> to create the new dataset.</li>
                        </ol>

                        <div style="
                            margin-top: 10px;
                            padding: 8px 10px;
                            border-radius: 6px;
                            background: rgba(0,0,0,0.05);
                            font-size: 12px;
                        ">
                            <strong>Note:</strong> All selected indicators must use
                            the same geographic level.
                        </div>
                    </div>
                `,
                onNextClick:  () => {
                    
                    /*window.dispatchEvent(
                        new CustomEvent('tour:remove-layer', {
                            detail: {
                                layerName: "(SDG 1) Armut - Altersarmut_Bundesländer",
                                layerType: "indikator",
                            }
                        })
                    )
                    await nextTick()*/
                    window.dispatchEvent(
                        new CustomEvent('tour:open-custom-indicator-ui', {
                            detail: {
                                mode: false
                            }
                        })
                    )
                    datasetSearchStore.filterInitiated = false

                    driverObj.moveNext()
                   
                }
                
                           
            },
           
        },
        
    ]
  })

  driverObj.drive()
}

watch(
  onboardingTutorial,
  async (enabled) => {
    if (enabled) {
      await nextTick()
      startTutorial()
    }
  }
)
</script>
