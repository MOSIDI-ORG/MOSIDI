import { DatasetTypes } from "./datasetTypes"

/**
 * Converts ObservedProperty to Metadata object
 * @param {*} observedProperty ObservedProperty from SensorThingsAPI to convert to
 * @returns metadata object usable for AddedDatasetsUI
 */
export const convertToMetadata = (observedProperty) => {
    var metadata = {
        dct_title: observedProperty.name,
        dct_type: DatasetTypes.SensorThings,
        dct_description: observedProperty.description,
        geometry_type: 'Point',
        observedPropertyId: observedProperty['@iot.id'], // Specific to SensorThings
        dct_catalog_title: observedProperty.name, 
        dct_catalog_description: observedProperty.description,
        dct_catalog_publisher: null, 
		dct_accessurl: null, 
		dct_license: null,
		dct_identifier: 'sensorthings_'+observedProperty.name, 
		dcatde_contributorid: 'Internal Contributor',
        dct_distribution: null, 
		dct_language: 'de', 
		dct_bbox: null, 
		dct_centroid: null,
		dcatde_politicalGeocodingLevelURI: null,
        dcatde_politicalGeocodingURI: null, 
		dcatde_geocodingText: null, 
		dct_modified: null, 
		dct_issued: null,
        dct_accrualperiodicity: 'PT4H',
		dct_temporal_startdata: null, 
		dct_temporal_enddate: null, 
		table_name: 'OBSERVEDPROPERTIES',
        details: '', 
		imported: null,
        legend_url: null
    }
    return metadata;
}