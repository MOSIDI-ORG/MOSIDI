import { HTTP } from '../utils/http-call';

export async function getTableNames() {
  try {
      const response = await HTTP.get("/api/table_names");
      const transformedData = response.data.map(item => {
          const [name, type, metadata] = item;
          return {
              name,
              type,
              metadata
          };
      });
      return transformedData;
  } catch (error) {
      console.error("Error fetching table names:", error);
      throw error;
  }
}

export async function getIndicatorNames() {
  const response = await HTTP.get("/api/indicators_list")
  return response.data;
}

export async function getIndicatorData(indicator, granularity) {
    const response = await HTTP.post(
        "/api/get_indicator_data",
        {
            "indicator": indicator,
            "granularity": granularity
        }
    );
    return response.data;
}

export async function getGeoserverCoverageSources() {
  //const coveragesList = process.env.VUE_APP_GEOSERVER_URL + "/rest/workspaces/brandenburg/coveragestores/raster_sources/coverages";
  const coveragesList = process.env.VUE_APP_GEOSERVER_URL + "/rest/workspaces/brandenburg/coveragestores.json";
  const authHeader = 'Basic ' + btoa(process.env.VUE_APP_GEOSERVER_USERNAME + ':' + process.env.VUE_APP_GEOSERVER_PASSWORD);

  try {
      const response = await fetch(coveragesList, {
          headers: {
              'Accept': 'application/json',
              'Authorization': authHeader,
          },
      });

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const geoServerInfo = await response.json();
      return geoServerInfo;
  } catch (error) {
      console.error('Error fetching GeoServer Info:', error);
      // Propagate the error
      throw error;
  }
}

export async function classification(dataArray, selectedClassificationMethod) {
    const response = await HTTP.post(
        "/api/classify",
        {
            "dataArray": dataArray,
            "selectedClassificationMethod": selectedClassificationMethod
        }
    );
    return response.data;
}

export async function getGeojsonDataFromDB (tablename) {
    const response = await HTTP.post(
        "/api/get_geojson",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}
export async function getLayerExtent (tablename) {
    const response = await HTTP.post(
        "/api/get_layer_extent",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}

export async function getLayerColumnNames (tablename) {
    const response = await HTTP.post(
        "/api/get_layer_column_names",
        {
            "tablename": tablename,
        }
    );
    return response.data;
}

export async function createhexagonFunction (tablename) {
    const response = await HTTP.post(
        "/api/create_hexagon_function",
        {
            "tablename": tablename,
        }
    );
    return response;
}

export async function getDistinctValuesPerColumnNameFromDB (payload) {
    const response = await HTTP.post(
        "/api/get_distinct_values_per_column_name",
        {
            "columnName": payload.columnName,
            "tableName": payload.tableName,
        }
    );
    return response.data;
}
export async function classifyData(columnName, tableName, selectedClassificationMethod) {
    const response = await HTTP.post(
        "/api/classify_data",
        {
            "columnName": columnName,
            "tableName": tableName,
            "selectedClassificationMethod": selectedClassificationMethod
        }
    );
    return response.data;
}

export async function getNumericalColumnNamesForClassification (payload) {
    const response = await HTTP.post(
        "/api/get_numerical_column_names_for_classification",
        {
            "tablename": payload
        }
    );
    return response.data;
}

export async function getTableMetadata () {
    const response = await HTTP.get("/api/get_table_metadata");
    return response.data;
}
export async function externalLayerFromDB () {
    const response = await HTTP.get("/api/get_external_wms_layers");
    return response.data;
}

export async function getFeatureInstanceFromDB (payload) {
    const response = await HTTP.post("/api/get_feature_instance", 
        {
            "tablename": payload.tablename,
            "featureId": payload.featureId
        });
    return response.data;
}

export async function getternaryDataFromDB (payload) {
    const response = await HTTP.post("/api/get_ternary_data", 
       {
        ind1: payload[0].indicatorname,
        zeit1: payload[0].selectedYear,
        ind2: payload[1].indicatorname,
        zeit2: payload[1].selectedYear,
        ind3: payload[2].indicatorname,
        zeit3: payload[2].selectedYear,
        gran: payload[0].granularity
    });
    return response.data;
}












