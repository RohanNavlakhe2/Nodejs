const provideLatLng = require('./utils/geocode')
const provideWeatherData = require('./utils/weather')
const log = console.log
const getWeatherForcastOf = process.argv[2]

if(!getWeatherForcastOf)
    return log("plz provide valid location")

//{lat,lng} = {} providing default value as {} because if some error happpen then we're passing undefined as second argument
//and as we can't destrucrure undefined so we're using {} empty object as default value.
provideLatLng(encodeURIComponent(getWeatherForcastOf),(err,{lat,lng} = {})=>{
    if(err)
        return log(err)
    provideWeatherData(lat,lng,(err,data)=>{
        if(err)
            return log(err)
        log("Weather data : ",data)
    })
})
