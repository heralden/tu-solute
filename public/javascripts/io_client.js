var uri = $.url('protocol') + "://" + $.url('hostname') + ':' + $.url('port');
var socket = io.connect(uri);

var query = $.url('?');
if (query === undefined) geoinit();
else
  if (query.hasOwnProperty('lat') && query.hasOwnProperty('lon')) {
    geocoord(query);
  } else {
    geoinit();
  }

socket.on('geoLocate', (data) => {
  showWeather(data);
});

socket.on('geoFail', (err) => {
  $("#status").text("Ikke-finne-deg feil. " + err);
});

function geocoord(query) {
  $("#status").text("Bruker oppgitte koordinater...");
  socket.emit('geoSuccess', {
    lat: query.lat,
    lon: query.lon
  });
}

function geoinit() {
  if (geoPosition.init()) {
    geoPosition.getCurrentPosition(geosuccess, geoerror);
  } else {
    $("#status").text("Støttes ikke.");
  }
}

function geosuccess(pos) {
  $("#status").text("Fant deg! Ser på himmelen...");
  socket.emit('geoSuccess', { 
    lat: pos.coords.latitude,
    lon: pos.coords.longitude
  });
}

function geoerror(msg) {
  $("#status").text("Kan ikke finne deg. " + msg);
}

function showWeather(data) {
  $("#footer").html(" -- <a href=\"" + data.comment.url + "\">" + data.comment.url + "</a>");

  $("#weather").prepend("<h2>" + data.area + "</h2>");

  var imagePath = "/images/sym/svg/" + data.weather.symbol + ".svg";
  $("#w2").append("<img src=\"" + imagePath + "\" class=\"center-block\" style=\"width: 100%;\">");

  $("#w1").append("<h3>Temperatur: " + data.weather.temperature + " °C</h3>");
  $("#w1").append("<h3>Nedbør: " + data.weather.precipitation + " mm</h3>");
  $("#w1").append("<h3>Vind: " + data.weather.windSpeed + " m/s fra " + data.weather.windDirection + "</h3>");


  $("#w3").append("<p>" + data.weather.description + "</p>");

  $("#main").slideUp(() => {
    $("#weather").appendTo("#container").slideDown();
  });
}
