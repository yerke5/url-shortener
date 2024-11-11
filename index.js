require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { doesNotMatch } = require('assert');
const app = express();

urlList = []
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const urlLib = require("url");
const dns = require("dns");

const isUrlFormatValid = (s) => {
  if ((s.slice(0, 7) != "http://") && (s.slice(0, 8) != "https://")) {
    return false;
  }
  try {
    new urlLib.URL(s);
    return true;
  } catch (err) {
    return false;
  }
};

const stringIsAValidUrl = (url) => {
  if(!isUrlFormatValid(url)) {
    console.log(url + " format is invalid")
    return false;
  }
  return true;
}

app.post("/api/shorturl", function(req, res) {
  const url = req.body.url;
  if(!stringIsAValidUrl(url)) {
    console.log("invalid format");
    res.json({ error: 'invalid url' });
    return;
  }
  const host = urlLib.parse(url).hostname;
  dns.lookup(host, null, function(err, addresses) {
    if (err != null) {
      console.log("DNS problem for host " + host);
      console.log(err);
      res.json({ error: 'invalid url' });
      return;
    }
    urlList.push(url);
    const result = {
      original_url: url,
      short_url: urlList.length - 1
    };
    res.json(result);
  });
});

app.get("/api/shorturl/:id", function(req, res) {
  const url_id = parseInt(req.params.id);
  console.log("URL ID: " + url_id);
  console.log("URL: " + urlList[url_id]);
  res.redirect(urlList[url_id]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
