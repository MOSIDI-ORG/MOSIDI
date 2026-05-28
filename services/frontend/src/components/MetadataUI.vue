<template>
  <v-card style="background-color: transparent;" flat>
    
    <v-card-text v-if="hasMetadata">
        
        <div v-for="(item, index) in filteredMetadata" :key="`present-${index}`" class="mb-2">
            <span v-if="isValidURL(item)">
                <b>{{ $t(`metadata-labels.${index}`, index) }}</b>: 
                <a :href="item" target="_blank" rel="noopener">{{ item }}</a> 
            </span>
            <span v-else>
                <b>{{ $t(`metadata-labels.${index}`, index) }}</b>: {{ item }}
            </span>
        </div>

        <template v-if="missingMetadataKeys.length > 0">
            <v-divider class="my-4"></v-divider>
            
            <div class="text-caption text-grey mb-1">
                <b>Missing Information:</b>
            </div>
            
            <span v-for="key in missingMetadataKeys" :key="`missing-${key}`" class="text-caption text-grey mr-2">
                • {{ $t(`metadata-labels.${key}`, key) }}
            </span>
        </template>

    </v-card-text>
    
    <v-card-text v-else>
        {{ $t('dataset-filter.metadata.empty-msg') }} {{ layerName }}
    </v-card-text>

  </v-card>
</template>

<script setup>
import { computed, defineProps } from 'vue';

// Define Props (Macro - no import required)
const props = defineProps({
  metadata: {
    type: Object,
    default: () => null
  },
  layerName: {
    type: String,
    default: ''
  }
});

// Helper function to check for valid values
const hasValue = (value) => value !== null && value !== undefined && value !== '';

// Helper function for URL validation
const isValidURL = (str) => {
  if (typeof str !== 'string') return false;
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;  
  }
};

// Computed Properties
const hasMetadata = computed(() => {
  return props.metadata && Object.keys(props.metadata).length > 0;
});

const filteredMetadata = computed(() => {
  if (!hasMetadata.value) return {};
  return Object.fromEntries(
    Object.entries(props.metadata).filter((entry) => {
      const [key, value] = entry;
      // Must have a value AND must NOT be named 'details'
      return key !== 'details' && hasValue(value);
    })
  );
});

const missingMetadataKeys = computed(() => {
  if (!hasMetadata.value) return [];
  return Object.entries(props.metadata)
    .filter((entry) => {
      const [key, value] = entry;
      // Must NOT be named 'details' AND must be missing a value
      return key !== 'details' && !hasValue(value);
    })
    .map((entry) => entry[0]);
});
</script>