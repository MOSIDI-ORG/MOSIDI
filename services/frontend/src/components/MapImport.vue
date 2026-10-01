<template>
  <v-row justify="center">
    <v-dialog
      v-model="importDialog"
      max-width="500"
    >
      <v-card class="dialog-ui">
        <v-card-title>
          <span class="text-h6">Import Data</span>
        </v-card-title>
        <v-divider></v-divider>

        <v-card-text>
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
import { useLayerStyleStore } from '../stores/layerStyle'
import * as turf from '@turf/turf'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useDatasetSearchStore } from '../stores/datasetSearch'

const datasetSearchStore = useDatasetSearchStore()
const addedDatasetsStore = useaddedDatasetsStore()

const emit = defineEmits(["addGeojsonToMap", "fitBoundsToBBOX"]);

let { styles } = storeToRefs(useLayerStyleStore())

const mapImportStore = useMapImportStore()
const { importDialog } = storeToRefs(mapImportStore)

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
  parsedGeoJSON.value = null
  isLoading.value = false
  isSuccess.value = false
  progress.value = 0
  errorMessage.value = ''
  isDragOver.value = false
  if (fileInput.value) fileInput.value.value = ''
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
        console.log(layerSpecification)
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