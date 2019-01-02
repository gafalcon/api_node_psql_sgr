const Pool = require('pg').Pool
const axios = require('axios');
const APPID = "356c02b904d145c0d48ab39f8f73c056"
const pool = new Pool({
    user: 'gabo',
    host: 'localhost',
    database: 'testDb',
    // password: 'password',
    port: 5432,
})

const getEvent = (request, response) => {
    const id = request.params.evento
    pool.query('SELECT * FROM event_log where id = $1', [id],  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getAllEvents = (request, response) => {
    const entidad = request.params.entidad
    pool.query('SELECT * FROM event_log where entidad = $1', [entidad],  (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}
const rowToTemp = (row) => {
    tmp = {
        lon: row[0],
        lat: row[1],
        weather_main: row[2],
        weather_desc: row[3],
        temp: row[4],
        pressure: row[5],
        humidity: row[6],
        temp_min: row[7],
        temp_max: row[8],
        visibility: row[9],
        wind_speed: row[10],
        clouds: row[11],
        rain: row[12],
        name: row[13],
    }
    return tmp

}
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

const allEvents = (request, response) => {
    pool.query('SELECT DISTINCT id from event_log', (error, result)=> {
        if (error){
            throw error
        }
        response.status(200).json(result.rows)

    })

}


module.exports = {
    getEvent,
    allEvents,
    getTemp,
}
