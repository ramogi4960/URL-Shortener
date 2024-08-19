require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const dns = require('dns');
const urlParser = require('url');
const { error } = require('console');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

process.env.MONGO_URI="mongodb+srv://kevobizzi:ramogi4960@cluster0.uvbbx.mongodb.net/ShortUrl?retryWrites=true&w=majority&appName=Cluster0";
process.env.PORT=3000;

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db("URL");
const urls = db.collection("urlshortener");



// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// how to process a post request
app.post('/api/shorturl', (req, res) => {
  const the_url = req.body.url;
  const dns_lookup = dns.lookup(urlParser.parse(the_url).hostname, async (err, address) => {
    if (!address) {
      res.json({
        error: "invalid url"
      });
    }
    else {
      const count = await urls.countDocuments({});
      const document = urls.insertOne({
        original: the_url,
        short: count,
      });
      console.log(document);
      res.json({
        original_url: the_url,
        short_url: count,
      });
    }
  });
});

// Your first API endpoint
app.get('/api/shorturl/:shorturl', async function(req, res) {
  const document = await urls.findOne({ short: +req.params.shorturl });
  console.log(document.original);
  res.redirect(document.original);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}\n..\nBrought to you by UrbanChaos.inc`);
});
