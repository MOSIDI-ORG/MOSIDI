import axios from 'axios';

const FROST_BASE_URL = process.env.VUE_APP_FROST_BASE_URL;

/**
 * Get All Things including Location, Datastream and latest Observation as GeoJSON
 * @param {*} observedPropertyId Include Things that have a Datastream that is linked to ObservedProperty with this Id
 * @returns Things with their Locations, Datastreams and latest Observation as GeoJSON format
 */
export async function getThings(observedPropertyId) {
    try {
        const response = await axios.get(
            FROST_BASE_URL + "/Things" +
            "?$expand=" +
                "Locations(" +
                    "$select=location)," +
                "Datastreams(" +
                    "$select=id,name,unitOfMeasurement;" +
                    "$expand=Observations($select=phenomenonTime,result;$orderby=phenomenonTime desc;$top=1))" + 
            "&$filter=Datastreams/ObservedProperty/id eq " + observedPropertyId + 
            "&$resultFormat=GeoJSON" + 
            "&$top=1000",
            getHeader()
        );
        return response.data;
    } catch(error) {
        console.error("Error fetching Things from FROST");
        throw error;
    }
}

/**
 * Get all Observations from a specified Datastream
 * @param {*} datastreamId Id of a Datastream to retrieve Observations from
 * @param {*} from starting date interval to filter for; default last 10 days
 * @param {*} to ending date interval to filter for; default today/ now
 * @param {number} [top=1000] max number of observations to retrieve
 * @returns list of Observations with result (value) and phenomenonTime orderby phenomenonTime
 */
export async function getObservations(datastreamId, from = null, to = "now()", top = 1000) {
    // If not specified use last 7 days
    if (from == null) {
        let date = new Date();
        date.setDate(date.getDate() - 7);
        from = date.toISOString();
    }

    try {
        const response = await axios.get(
            FROST_BASE_URL + "/Datastreams(" + datastreamId + ")/Observations" +
            "?$select=phenomenonTime,result" +
            "&$orderby=phenomenonTime desc" +
            "&$filter=phenomenonTime ge " + from + "and phenomenonTime le " + to +
            "&$top=" + top,
            getHeader()
        );
        return response.data;
    } catch(error) {
        console.error("Error fetching ObservedProperties from FROST");
        throw error;
    }
}

/**
 * Get all ObservedProperties
 * @returns all ObservedProperties
 */
export async function getObservedProperties() {
    try {
        const response = await axios.get(
            FROST_BASE_URL + "/ObservedProperties" +
            "?$select=id,name,description" +
            "&$top=1000",
            getHeader()
        );
        return response.data.value;
    } catch(error) {
        console.error("Error fetching ObservedProperties from FROST");
        throw error;
    }
}

/**
 * Build Header (including Authorization) for FROST API
 * @returns header object to use with axios
 */
function getHeader() {
    const authHeader = 'Basic ' + btoa(process.env.VUE_APP_FROST_USER + ':' + process.env.VUE_APP_FROST_PASSWORD);
    
    return {
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'Authorization': authHeader,
        }
    };
}