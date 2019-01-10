const express = require('express')
const bodyParser = require('body-parser')
const configs = require('./configs')
const app = express()
const port = configs.serverport
const host_url = configs.host_url
const db = require('./queries')

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.get('/', (request, response) => {
    response.json({ info: 'API de la Secretaría de Gestión de riesgos' })
})

app.get('/evento/:evento', db.getEvent)

app.get('/evento', db.allEvents)

app.get('/temperatura', db.getTemp)

app.get('/all', db.allData)

app.listen(port, host_url, () => {
    console.log(`App running on port ${port}.`)
})
