var geolocate = require('../lib/geo.js');

exports.listen = (io) => {

  io.on('connection', (socket) => {
    // Listen for socket events emitted by client and 
    // answer by running back-end geolocation script.
    socket.on('geoSuccess', (data) => {
      geolocate(data, (err, obj) => {
        if (err) {
          socket.emit('geoFail', err);
        } else {
          socket.emit('geoLocate', obj);
        }
      });
    });

  });

}
