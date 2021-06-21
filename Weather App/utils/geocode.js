const request = require('request')


const provideLatLng = (address, callback) => {

    const mapBoxGeocodingApi = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=pk.eyJ1Ijoicm9oYW5uYXZsYWtoZSIsImEiOiJja3BxZjVscWYwaXltMnZzNGdpaGR3Z3F6In0.VmwQExkuhQxvFxQ2OZ_OAw&limit=1`

    //json:true - parses the response body as JSON.
//If we dont use json:true then we manually need to convert body to json object using JSON.parse(response.body)
    request(
        {url: mapBoxGeocodingApi, json: true},
        (err, response, body) => {
            if (err) {
                callback("Failed to convert address to Lat-Lng", undefined)
                return
            }
            const place = body.features[0]
            if (place)
                callback(undefined, {
                    lat: place.center[1],
                    lng: place.center[0],
                    place: place.place_name
                })
            else
                callback("unable to find your location", undefined)


        }
    )
}

module.exports = provideLatLng