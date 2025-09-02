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

export async function getIndicatorData(indicator) {
    const response = await HTTP.post(
        "/api/get_indicator_data",
        {
            "indicator": indicator
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



