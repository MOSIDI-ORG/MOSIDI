<template>
  <v-row justify="center">
    <v-dialog
      v-model="importDialog"
      max-width="500"
    >
      <v-card class="dialog-ui">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">Import Data</span>

          <v-spacer />

          <v-btn-toggle
            v-model="importType"
            mandatory
            density="compact"
            variant="outlined"
            color="primary"
          >
            <v-btn value="geojson" size="small">
              <v-icon start size="18">mdi-file-code-outline</v-icon>
              GeoJSON
            </v-btn>

            <v-btn value="wms" size="small">
              <v-icon start size="18">mdi-map-outline</v-icon>
              WMS
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
          <template v-if="importType === 'geojson'">
            <!-- Upload zone -->
            <div
              class="upload-area"
              :class="{
                'drag-over': isDragOver,
                'is-loading': isLoading,
                'is-success': isSuccess
              }"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="onDrop"
              @click="!isLoading && !isSuccess && triggerFileInput()"
            >
              <input
                ref="fileInput"
                type="file"
                accept=".geojson,.json,application/geo+json,application/json"
                class="d-none"
                @change="onFileSelected"
              />

              <!-- Default state -->
              <template v-if="!isLoading && !isSuccess">
                <v-icon size="40" color="primary" class="mb-2">
                  mdi-cloud-upload-outline
                </v-icon>
                <div class="text-body-1 font-weight-medium">
                  Click or drag & drop a GeoJSON file
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Supported formats: .geojson, .json
                </div>
              </template>

              <!-- Loading / Progress -->
              <template v-else-if="isLoading">
                <v-progress-circular
                  :model-value="progress"
                  :size="56"
                  :width="5"
                  color="primary"
                  class="mb-3"
                >
                  <span class="text-caption">{{ progress }}%</span>
                </v-progress-circular>
                <div class="text-body-2">
                  Processing {{ selectedFileName }}...
                </div>
              </template>

              <!-- Success -->
              <template v-else>
                <v-icon size="48" color="success" class="mb-2">
                  mdi-check-circle
                </v-icon>
                <div class="text-body-1 font-weight-medium text-success">
                  Ready to add to map
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Name: {{ selectedFileName }}
                </div>
                <div class="text-caption text-medium-emphasis mt-1">
                  Size: {{ selectedFileSize }}
                </div>
              </template>
            </div>
          </template>
          <template v-else>

            <div class="wms-import">

              <v-text-field
                v-model="wmsUrl"
                label="WMS service URL"
                placeholder="https://example.com/geoserver/wms"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-link-variant"
                hint="Paste the URL of the WMS service"
                persistent-hint
                clearable
                @click:clear="  wmsUrl = '', wmsMetadata = [], selectedWmsLayers.value = [], wmsError = ''"
                :error-messages="wmsError"
                @paste="onWmsPaste"
              />
              <!-- Available WMS layers -->
              <div v-if="wmsMetadata.length" class="mt-4">

                <div class="text-subtitle-2 mb-2">
                  Available layers ({{ wmsMetadata.length }})
                </div>

               <v-card
                  variant="outlined"
                  rounded="lg"
                >
                  <v-list
                    density="comfortable"
                    lines="two"
                    class="py-1"
                  >
                    <v-list-item
                      v-for="layer in wmsMetadata"
                      :key="layer.name"
                      :value="layer.name"
                      :active="selectedWmsLayers.includes(layer.name)"
                      active-color="primary"
                      rounded="lg"
                      class="mx-2 my-1"
                    >
                      <template #prepend>
                        <v-checkbox-btn
                          v-model="selectedWmsLayers"
                          :value="layer.name"
                          color="primary"
                          density="compact"
                          hide-details
                        />
                      </template>

                      <v-list-item-title class="text-body-2 font-weight-medium">
                        {{ layer.title }}
                      </v-list-item-title>

                      <v-list-item-subtitle class="text-caption text-medium-emphasis">
                        {{ layer.name }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card>

                <div class="text-caption text-medium-emphasis mt-2">
                  {{ selectedWmsLayers.length }} layer(s) selected
                </div>

              </div>

              <div class="text-caption text-medium-emphasis mt-3">
                Example:
                <code>https://example.com/geoserver/wms</code>
              </div>

            </div>

          </template>
            <!-- Error -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3"
            closable
            @click:close="errorMessage = ''"
          >
            {{ errorMessage }}
          </v-alert>
          
        </v-card-text>
       

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="outlined"
            :disabled="isLoading"
            @click="closeDialog"
          >
            Close
          </v-btn>

          <!-- Only shown after successful import -->
          <v-btn
            v-if="isSuccess"
            color="primary"
            variant="flat"
            @click="addToMap"
          >
            Add to map
          </v-btn>

          <v-btn
            v-if="importType === 'wms'"
            color="primary"
            variant="flat"
            :disabled="selectedWmsLayers.length === 0"
            @click="addSelectedWmsLayers"
          >
            Add {{ selectedWmsLayers.length || '' }} layer(s) to map
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script setup>
import { ref, defineEmits } from 'vue'
import { useMapImportStore } from '../stores/mapImport'
import { storeToRefs } from 'pinia'
import {validateGeoJSON, formatFileSize} from '../utils/validateGeojson'
import {parseWMSCapabilities} from '../utils/mapUtils'
import { useLayerStyleStore } from '../stores/layerStyle'
import * as turf from '@turf/turf'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { useMapLegendStore } from '@/stores/mapLegend'

const importType = ref('geojson')

const wmsUrl = ref('')
const wmsError = ref('')
const datasetSearchStore = useDatasetSearchStore()
const addedDatasetsStore = useaddedDatasetsStore()

const emit = defineEmits([
  "addGeojsonToMap",
  "addWmsToMap",
  "fitBoundsToBBOX"
])

let { styles } = storeToRefs(useLayerStyleStore())
const selectedWmsLayers = ref([])
const wmsMetadata = ref([])

const mapImportStore = useMapImportStore()
const { importDialog } = storeToRefs(mapImportStore)
const mapLegendStore = useMapLegendStore();

const fileInput = ref(null)
const selectedFile = ref(null)
const selectedFileName = ref('')
let selectedFileSize = ref(null)

const isDragOver = ref(false)
const isLoading = ref(false)
const isSuccess = ref(false)
const progress = ref(0)
const errorMessage = ref('')
let geomtype = ref(null)
let boundingBox = ref(null)
const parsedGeoJSON = ref(null)
let style = ref(null)
let layerType = ref(null)
let layerMetadata = ref(null)

const closeDialog = () => {
  importDialog.value = false
  reset()
}

const reset = () => {
  selectedFile.value = null
  selectedFileName.value = ''
  selectedFileSize.value = null
  parsedGeoJSON.value = null

  isLoading.value = false
  isSuccess.value = false
  progress.value = 0
  errorMessage.value = ''
  isDragOver.value = false

  wmsUrl.value = ''

  importType.value = 'geojson'
  wmsMetadata.value = []
  selectedWmsLayers.value = []
  wmsError.value = ''

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const validateFile = (file) => {
  if (!file) return false

  const name = file.name.toLowerCase()
  if (!name.endsWith('.geojson') && !name.endsWith('.json')) {
    errorMessage.value = 'Please select a valid .geojson or .json file.'
    return false
  }
  return true
}

const startImport = (file) => {
  if (!validateFile(file)) return

  selectedFile.value = file
  selectedFileName.value = file.name.replace(/\.[^/.]+$/, '')
  selectedFileSize.value = formatFileSize(file.size)
  isLoading.value = true
  isSuccess.value = false
  progress.value = 0
  errorMessage.value = ''
  parsedGeoJSON.value = null

  const reader = new FileReader()

  reader.onprogress = (e) => {
    if (e.lengthComputable) {
      progress.value = Math.round((e.loaded / e.total) * 100)
    }
  }

  reader.onload = () => {
    try {
        const geojson = JSON.parse(reader.result)

        const { valid, error } = validateGeoJSON(geojson)
        if (!valid) {
            throw new Error(error)
        }

        turf.geomEach(geojson, (currentGeometry) => {
            if (currentGeometry?.type) {
                //types.add(currentGeometry.type)
                geomtype.value = currentGeometry.type
            }
        })
        parsedGeoJSON.value = geojson
        progress.value = 100

        // small delay so user sees 100%
        setTimeout(() => {
            isLoading.value = false
            isSuccess.value = true
        }, 350)

    } catch (err) {
      errorMessage.value = err.message || 'Failed to parse the file'
      isLoading.value = false
      isSuccess.value = false
    }
  }

  reader.onerror = () => {
    errorMessage.value = 'Failed to read the file'
    isLoading.value = false
  }

  reader.readAsText(file)
}

const onFileSelected = (e) => {
  const file = e.target.files?.[0]
  if (file) startImport(file)
}

const onDrop = (e) => {
  isDragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) startImport(file)
}

// Called when user clicks "Add to map"
const addToMap = () => {
  if (!parsedGeoJSON.value) return



  boundingBox.value = turf.bbox(parsedGeoJSON.value)
        if (geomtype.value == "MultiPolygon" || geomtype.value == "Polygon"){
            layerType.value="fill"
            style.value = styles.value.polygon
        }
        else if (geomtype.value == "MultiLineString" || geomtype.value == "LineString" || geomtype.value == "Line"){
            layerType.value="line"
            style.value = styles.value.line
        }
        else if (geomtype.value == "Point"){
            layerType.value="circle"
            style.value = styles.value.point
        }
   
        let layerSpecification = {
            id: selectedFileName.value,
            style: style,
            layerType: layerType,
            geoGjsonData:parsedGeoJSON.value,
            sourceType: "geojson"
        }
        emit("addGeojsonToMap", layerSpecification);
        layerMetadata.value = {
                _layerKey: selectedFileName.value,
                dct_title: selectedFileName.value,
                name: selectedFileName.value,
                dct_type: 'geojson',          // or 'external'
                geometry_type: geomtype.value,     // from turf
                dct_bbox: boundingBox.value,  // from turf.bbox()
                checked: true,
                source: 'Local upload',
        }
        addedDatasetsStore.addExternalLayer({layerName:selectedFileName.value, metadata:layerMetadata.value})
        datasetSearchStore.activateDatasetSearch({
            searchInitiated: true,
        })
        emit("fitBoundsToBBOX", boundingBox.value)


  closeDialog()
}
const onWmsPaste = async (event) => {
  const pastedText = event.clipboardData?.getData('text')?.trim()

  if (!pastedText) return
  console.log(pastedText, "pastedText")
  wmsUrl.value = pastedText

  await extractWMSInfo()
}
const extractWMSInfo = async () => {
  wmsError.value = ''

  if (!wmsUrl.value?.trim()) {
    wmsError.value = 'Please enter a WMS service URL.'
    return
  }

  try {
    const url = new URL(wmsUrl.value.trim())

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid protocol')
    }

    // Keep only the WMS service URL.
    // Remove request-specific parameters.
    url.searchParams.delete('SERVICE')
    url.searchParams.delete('REQUEST')
    url.searchParams.delete('VERSION')

    const serviceUrl = url.toString()

    // Build GetCapabilities request from a copy
    const capabilitiesUrl = new URL(serviceUrl)

    capabilitiesUrl.searchParams.set('SERVICE', 'WMS')
    capabilitiesUrl.searchParams.set('REQUEST', 'GetCapabilities')

    console.log('Service URL:', serviceUrl)
    console.log('Capabilities URL:', capabilitiesUrl.toString())

    const response = await fetch(capabilitiesUrl.toString())

    if (!response.ok) {
      throw new Error(
        `WMS service returned ${response.status}`
      )
    }

    const xmlText = await response.text()

    const WMSMetadata = parseWMSCapabilities(xmlText)

    if (!WMSMetadata.length) {
      throw new Error('No WMS layers were found.')
    }

    // Store ONLY the clean service URL
    wmsUrl.value = serviceUrl

    wmsMetadata.value = WMSMetadata
    selectedWmsLayers.value = []

  } catch (err) {
    console.error('WMS import error:', err)

    wmsError.value =
      err.message || 'Failed to read WMS service.'
  }
}
const addSelectedWmsLayers = () => {
  wmsError.value = ''

  if (!selectedWmsLayers.value.length) {
    wmsError.value = 'Please select at least one WMS layer.'
    return
  }

  const layers = wmsMetadata.value
    .filter(layer =>
     
      selectedWmsLayers.value.includes(layer.name)
      
    )
    .map(layer => ({
      dct_title: layer.title,
      dct_type: 'raster',
      url: wmsUrl.value.trim(),
      layer: layer.name,
      legend_url:layer.styles?.[0]?.legendUrl || null,
      // Keep the discovered metadata as well
      abstract: layer.abstract,
      crs:'EPSG:3857',
      styles: layer.styles,
      dct_bbox: layer.bbox,
      geometry_type: 'raster',
    }))
    console.log('Adding WMS layers to map:', layers)
    layers.forEach(item => {
      console.log(item, "item")
        emit('addWmsToMap', item)
        addedDatasetsStore.addExternalLayer({layerName:item.dct_title, metadata:item})
        mapLegendStore.setActivatedWMSLegendItem({
            legend_url: item.legend_url,
            legend_title: item.dct_title
      })
       emit("fitBoundsToBBOX", item.dct_bbox)
    })
    datasetSearchStore.activateDatasetSearch({
            searchInitiated: true,
    })
    
     

  //closeDialog()
}
</script>

<style scoped>
.v-dialog > .v-overlay__content > .v-card {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 8px;
}

.upload-area {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(255, 255, 255, 0.4);
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-area:hover:not(.is-loading):not(.is-success) {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.upload-area.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.upload-area.is-loading {
  cursor: default;
  border-style: solid;
  border-color: rgb(var(--v-theme-primary));
}

.upload-area.is-success {
  cursor: default;
  border-style: solid;
  border-color: rgb(var(--v-theme-success));
  background-color: rgba(var(--v-theme-success), 0.08);
}
</style>