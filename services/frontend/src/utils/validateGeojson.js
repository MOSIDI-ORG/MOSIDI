/**
 * Validate that a parsed object is valid GeoJSON
 * @param {any} data - Result of JSON.parse
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGeoJSON(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File is not a valid JSON object' }
  }

  const allowedTypes = [
    'FeatureCollection',
    'Feature',
    'GeometryCollection',
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon'
  ]

  if (!data.type || !allowedTypes.includes(data.type)) {
    return {
      valid: false,
      error: `Invalid GeoJSON type. Expected one of: ${allowedTypes.join(', ')}`
    }
  }

  // FeatureCollection must have a features array
  if (data.type === 'FeatureCollection') {
    if (!Array.isArray(data.features)) {
      return { valid: false, error: 'FeatureCollection must contain a "features" array' }
    }
  }

  // Feature must have a geometry
  if (data.type === 'Feature') {
    if (!data.geometry || typeof data.geometry !== 'object') {
      return { valid: false, error: 'Feature must contain a "geometry" object' }
    }
  }

  // Geometry types must have coordinates
  const geometryTypes = [
    'Point', 'MultiPoint', 'LineString', 'MultiLineString',
    'Polygon', 'MultiPolygon'
  ]
  if (geometryTypes.includes(data.type)) {
    if (!Array.isArray(data.coordinates)) {
      return { valid: false, error: `${data.type} must contain a "coordinates" array` }
    }
  }

  return { valid: true }
}

export function formatFileSize (bytes) {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}