const express = require('express')
const app = express()
const axios = require('axios')
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
//const { HttpsProxyAgent } = require('https-proxy-agent');

const port = 3000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const mock1111 = require('./mock-data/111111111111111.json');

app.get('/', (req, res) => {
  res.send('This is a PetFinder API')
})

app.get('/api/v1/barcode/:id', async (req, res) => {
  const barcodeId = req.params.id;
  console.log(`Provided Barcode id: ` + barcodeId)
  // Validate barcodeId
  const barcodeRegex = /^\d{15}$/;
  if (!barcodeRegex.test(barcodeId)) {
    return res.status(400).json({ message: 'Invalid barcode ID. It should be exactly 15 digits with no spaces.' });
  }
  
  if (barcodeId === '111111111111111') {
    return res.json(mock1111)
  }
  if (barcodeId === '222222222222222') {
    setTimeout(() => {
      const html = readMockHtml('mock-222222222222222.html');
      const data = htmlToJson(html);
      return res.json(data);
    }, 5000); // 5 seconds delay
    return;
  }
  if (barcodeId === '333333333333333') {
    const html = readMockHtml(`mock-333333333333333.html`);
    const $ = cheerio.load(html);
    const message = $('h1').text().trim();
    return res.status(403).json({ message });
  }

  try {
    const response = await axios.get(`https://ndg.nl/frm/fsearch.php?barcode=${barcodeId}`);
    const html = response.data;
    //console.log(`Response ` + html)

    //Check for error message
    const containsString = html.includes("Toegang geweigerd");
    if(containsString){
      console.log(`Toegang geweigerd!`)
      return res.status(403).json({ message: 'Toegang geweigerd!' });
    }
    
    //Convert html to json
    const data = htmlToJson(html);
    return res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).send({message: 'Error fetching data'});
  }

})

//------------------------------------------------
const htmlToJson = (html) => {
  const $ = cheerio.load(html);

  //Extract data
  const data = {
    source: "NDG",
    description: "De Stichting Nederlandse Databank Gezelschapsdieren",
    zoekresultaat: {
      Identificatienummer: $('td.frmLabel:contains("Identificatienummer")').next('td.frmField').text(),
      Diernaam: $('td.frmLabel:contains("Diernaam")').next('td.frmField').text(),
      Diersoort: $('td.frmLabel:contains("Diersoort")').next('td.frmField').text(),
      Paspoort_geregistreerd: $('td.frmLabel:contains("Paspoort geregistreerd?")').next('td.frmField').text(),
      Woonplaats_houder: $('td.frmLabel:contains("Woonplaats houder")').next('td.frmField').text(),
      Land_houder: $('td.frmLabel:contains("Land houder")').next('td.frmField').text(),
      Telefoon_Nederland: $('td.frmLabel:contains("Telefoon (vanuit Nederland)")').next('td.frmField').text(),
      Telefoon_buitenland: $('td.frmLabel:contains("Telefoon (vanuit buitenland)")').next('td.frmField').text(),
      Vermist: $('td.frmLabel:contains("Vermist?")').next('td.frmField').text(),
      Overleden: $('td.frmLabel:contains("Overleden?")').next('td.frmField').text()
    }
  };  
  return data;
};

//------------------------------------------------

// Function to read mock.html
const readMockHtml = (file) => {
  const filePath = path.join('./mock-data/', file);
  return fs.readFileSync(filePath, 'utf8');
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})