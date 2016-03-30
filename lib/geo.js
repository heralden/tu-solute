var fs = require('fs');
var url = require('url');
var geocoder = require('node-geocoder')('google', 'http');

var weatherData = require('./weather');
var postnummer = require('./db/postnummer.json');

module.exports = geolocate;

var util = require('util');

function geolocate(pos, cb) {
  if (pos.lat !== undefined && pos.lon !== undefined) {
    geocoder.reverse({ lat: pos.lat, lon: pos.lon }, (err, res) => {
      if (err) { 
        cb(err);
      } else if (res[0].country == "Norway") {
        // Use zipcode database for higher accuracy.
        var land = res[0].country, fylke = res[0].administrativeLevels.level1long, kommune, sted;
        postnummer.post.filter((entry) => {
          if (entry.zip == res[0].zipcode) {
            kommune = entry.municipality;
            sted = entry.place;
          }
        });
        if (kommune === undefined || sted === undefined) {
          // If not in database, use administrativeLevels. (not determining "sted")
          kommune = res[0].administrativeLevels.level2long;
          sted = res[0].administrativeLevels.level2long;
        }
        var path = '/sted/' + land + '/' + fylke + '/' + kommune + '/' + sted + '/varsel.xml';
        path = path.replace(/ /g, '_');
        var urlObj = {
          protocol: 'http',
          host: "yr.no",
          pathname: path
        }
        queryWeather(url.format(urlObj), cb);
      } else { 
        // Countries other than Norway are only 3 place names deep, as opposed to 4.
        var country = res[0].country,
          region = res[0].administrativeLevels.level1long,
          municipality = res[0].administrativeLevels.level2long;
        if (municipality === undefined || region === undefined) { 
          // Some coords don't give adminLevel for both levels.
          region = res[0].city;
          municipality = res[0].city;
        }
        var path = '/sted/' + country + '/' + region + '/' + municipality + '/varsel.xml';
        path = path.replace(/ /g, '_');
        var urlObj = {
          protocol: 'http',
          host: "yr.no",
          pathname: path
        }
        queryWeather(url.format(urlObj), cb);
      }
    });
  } else { // Coordinates are undefined.
    cb(new Error('Coordinates are undefined'));
  }
}

function queryWeather(uri, cb) {
  weatherData(uri, (err, obj) => {
    if (err) cb(err);
    else
      cb(null, obj);
  });
}
