const Pool = require('pg').Pool
const APPID = "356c02b904d145c0d48ab39f8f73c056"
const configs = require('./configs')

const pool = new Pool({
    user: configs.user,
    host: configs.host,
    database: configs.database,
    password: configs.password,
    port: configs.dbport
})

// /evento/:evento
const getEvent = (request, response) => {
    const id = request.params.evento
    columns = "id,registration_date,entidad,lat,lng,mg,z,fecha,estado,localizacion,evaluacion"
    pool.query('SELECT ' + columns + ' FROM event_log where id = $1', [id],  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

//
const getAllEvents = (request, response) => {
    const entidad = request.params.entidad
    pool.query('SELECT * FROM event_log where entidad = $1', [entidad],  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

// /temperatura?lat=xxx&lon=xxx
const getTemp = (request, response) => {
    lat = parseFloat(request.query.lat);
    lon = parseFloat(request.query.lon);
    console.log("lat" + lat)
    console.log("lon" + lon)
    if (!lat || !lon){
        response.status(500).json({error: "Necesita especificar parametros lon y lat. Y deben ser valores numéricos"})
        return
    }else{
        pool.query("SELECT * FROM temperature WHERE lon = $1 AND lat = $2", [lon,lat])
            .then((res) => {
                if (res.rows.length > 0){ //Existe en db
                    row = res.rows[0]
                    console.log(row)
                    weather_main = row.weather_main.split(",")
                    weather_desc = row.weather_desc.split(",")
                    tmp = {
                        weather: weather_main.map((val, i) => { return {main: val, description: weather_desc[i]}}),
                        main: {
                            temp: parseFloat(row.temp),
                            pressure: parseFloat(row.pressure),
                            humidity: parseFloat(row.humidity),
                            temp_min: parseFloat(row.temp_min),
                            temp_max: parseFloat(row.temp_max)
                        },
                        visibility: parseFloat(row.visibility),
                        wind: {speed: parseFloat(row.wind_speed)},
                        clouds: { all: parseFloat(row.clouds)},
                        rain: { "rain.1h": parseFloat(row.rain)},
                        name: row.name, lat: lat, lon: lon
                    }
                    console.log(tmp)
                    response.status(200).json(tmp)
                }else{ //No existe
                    console.log("No existe en db")
                    response.status(200).json({
                        weather: [{main: "Clouds", description: "overcast clouds"}],
                        main: { temp: 28, pressure: 1017.0, humidity: 98, temp_min: 27, temp_max: 28},
                        visibility: 10000,
                        wind: { speed: 5.65 },
                        clouds: { all: 90},
                        rain: { "rain.1h": 0},
                        name: "", lat: lat, lon: lon
                    })
                }
            }).catch((err) => {
                console.log(err)
                response.status(500).json({error: "error"})
            })
    }
}

// /evento
const allEvents = (request, response) => {
    pool.query('SELECT DISTINCT id from event_log', (error, result)=> {
        if (error){
            throw error
        }
        response.status(200).json(result.rows)

    })

}

const allData = (request, response) => {
    columns = "id,registration_date,entidad,lat,lng,mg,z,fecha,estado,localizacion,evaluacion"
    query = {text:'SELECT '+columns+' from event_log', rowMode: 'array'}
    pool.query(query)
        .then((res) => {
            response.status(200).json(res.rows)
        })
        .catch((err) => {
            console.log(err)
            response.status(500).json({error: err})
        })
}


module.exports = {
    getEvent,
    allEvents,
    getTemp,
    allData
}
