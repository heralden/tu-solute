var fs = require('fs');
var url = require('url');
var path = require('path');

var fetchXml = require('./xml');

module.exports = checkCache;

function checkCache(xmlUrl, cb) {
  // Create filename from URL, replacing slashes with dashes.
  var filename = url.parse(xmlUrl).pathname.substring(1).replace(/\//g, '-');
  var filepath = path.join(__dirname, 'cache', filename);

  // Check if cache exists. If it doesn't, use fetchXml
  // and pass on to filterData and cacheData.
  fs.stat(filepath, (err, stats) => {
    if (err) {
      if (err.code == 'ENOENT') {
        fetchXml(xmlUrl, (error, result) => {
          if (error) {
            cb(error);
          } else {
            var obj = filterData(result);
            cacheData(filepath, obj);
            cb(null, obj);
          }
        });
      } else {
        cb(err);
      }
    } else {
      // Cache exists, call back with object.
      fs.readFile(filepath, (err, data) => {
        if (err) cb(err);
        else {
          var obj = JSON.parse(data);
          cb(null, obj);
        }
      });
    }
  });
}

function filterData(data) {
  var fcast = data.weatherdata.forecast;
  var desc = '';
  // Text is not defined for countries other than Norway.
  if (fcast[0].hasOwnProperty('text')) {
    desc = fcast[0].text[0].location[0].time[0].body[0];
  }
  // Create object literal to be delivered to templating engine.
  var obj = {
    area: data.weatherdata.location[0].name[0],
    comment: {
      text: "Værvarsel fra Yr levert av Meteorologisk institutt og NRK",
      url: data.weatherdata.credit[0].link[0]['$'].url
    },
    weather: {
      // symbol references pathname for public/images/sym/b[pixels]/
      symbol: fcast[0].tabular[0].time[0].symbol[0]['$'].var, // 01-50[d|m]|mf/01n.00-45n.99
      description: desc, // HTML text in Norwegian
      precipitation: fcast[0].tabular[0].time[0].precipitation[0]['$'].value, // millimeter 
      windDirection: fcast[0].tabular[0].time[0].windDirection[0]['$'].code, // combination of N,E,S,W
      windSpeed: fcast[0].tabular[0].time[0].windSpeed[0]['$'].mps, // meters per second
      temperature: fcast[0].tabular[0].time[0].temperature[0]['$'].value // celsius
    }
  };

  return obj;
}

function cacheData(filepath, data) {
  // Write cached data as JSON file and create setTimeout object 
  // to delete file after 10 minutes.
  fs.writeFile(filepath, JSON.stringify(data), (err) => {
    if (err) throw err;
  }); 

  setTimeout(() => {
    fs.unlink(filepath, (err) => {
      if (err) throw err;
    });
  }, 600000);
}

