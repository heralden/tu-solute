var fs = require('fs');

var obj = { post: [] };

fs.readFile('./postnummer.txt', 'utf8', (err, data) => {
  if (err) throw err;
  var array = data.split('\r\n');
  array.forEach((elem, index) => {
    var entry = elem.split('\t');
    obj.post.push({
      zip: entry[0],
      place: entry[1],
      code: entry[2],
      municipality: entry[3],
      postSymbol: entry[4]
    });
  });
  fs.writeFile('./postnummer.json', JSON.stringify(obj), (err) => {
    if (err) throw err;
    console.log("It's saved!");
  });
});

