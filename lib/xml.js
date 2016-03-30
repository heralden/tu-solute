var request = require('request');
var xml2js = require('xml2js');

module.exports = fetchXml;

function fetchXml(xmlUrl, cb) {
  // Use request to download XML file and pass it for parsing.
  request({uri: xmlUrl}, (err, res, body) => {
    if (err) cb(err);
    else if (res.statusCode != 200)
      cb('Merkelig sted utenfor Norge.');
    else
      parseXml(body, cb);
  });
}

function parseXml(xml, cb) {
  // Parse to object literal with xml2js.
  var parser = new xml2js.Parser();

  parser.parseString(xml, (err, result) => {
    if (err) cb(err);
    else
      cb(null, result);
  });
}

