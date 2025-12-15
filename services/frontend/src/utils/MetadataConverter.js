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
        observedPropertyId: observedProperty['@iot.id']
    }
    return metadata;
}