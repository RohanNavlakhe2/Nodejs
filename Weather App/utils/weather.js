const request = require('request')

const provideWeatherData = (lat,lng,callback) => {
    const weatherStackApiUrl = `http://api.weatherstack.com/current?access_key=079725e68c77e99d5b6c550a50a3965a&query=${lat},${lng}`

    request(
        {url: weatherStackApiUrl, json: true},
        (err, response, body) => {
            if (err) {
                callback("Failed to load weather data",undefined)
            } else if (body.error) {
                callback(body.error.info,undefined)
            }else{
                const currentWeatherData = response.body.current
                callback(undefined,{
                    temprature:currentWeatherData.temperature,
                    feelsLike:currentWeatherData.feelslike,
                })
            }
        }
    )
}

module.exports = provideWeatherData