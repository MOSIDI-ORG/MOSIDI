import axios from 'axios';

const FROST_BASE_URL = process.env.VUE_APP_FROST_BASE_URL;

/**
 * Get All Things including Location and Datastream as GeoJSON
 * @param {*} observedPropertyId Include Things that have a Datastream that is linked to ObservedProperty with this Id
 * @returns Things with their Locations and Datastreams as GeoJSON format
 */
export async function getThings(observedPropertyId) {
    try {
        const response = await axios.get(
            FROST_BASE_URL + "/Things" +
            "?$expand=" +
                "Locations(" +
                    "$select=location)," +
                "Datastreams(" +
                    "$select=name;" +
                    "$expand=Observations($select=phenomenonTime,result))" + 
            "&$filter=Datastreams/ObservedProperty/id eq " + observedPropertyId + 
            "&$resultFormat=GeoJSON",
            getHeader()
        );
        return response.data;
    } catch(error) {
        console.error("Error fetching Things from FROST");
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
            "http://localhost:8080/FROST-Server/v1.1/ObservedProperties",
            getHeader()
        );
        return response;
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