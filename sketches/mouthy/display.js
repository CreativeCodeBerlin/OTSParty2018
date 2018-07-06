// --- socket ---
var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});

// receive data from the phones
socket.on('dataChannel1', function(data) {
});

