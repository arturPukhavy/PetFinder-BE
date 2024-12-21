const express = require('express')
const app = express()
const port = 3000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const mock1111 = require('./mock-data/111111111111111.json');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/v1/barcode/:id', (req, res) => {
  console.log(`Barcode id: ` + req.params.id)
  res.json(mock1111) 
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

