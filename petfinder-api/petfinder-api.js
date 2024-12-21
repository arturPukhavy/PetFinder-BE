const express = require('express')
const app = express()
const axios = require('axios')
const port = 3000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const mock1111 = require('./mock-data/111111111111111.json');

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/v1/barcode/:id', async (req, res) => {
  const barcodeId = req.params.id;
  console.log(`Barcode id: ` + barcodeId)
  if (barcodeId === '111111111111111') {
    return res.json(mock1111)
  }
  if (barcodeId === '222222222222222') {
    return res.json(mock1111)
  }

  try {
    const response = await axios.get(`https://ndg.nl/frm/fsearch.php?barcode=${barcodeId}`);
    console.log(`Response ` + response.data)
    res.status(200).send('done');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching data');
  }


})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

