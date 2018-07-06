// Manage sockets
var socket = io();

socket.on('connected', function(id) {
  console.log('connected with id:', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});


function send(msg) {
   socket.emit('osc', {
      address: '/client',
      message: msg
   });
}

$('#btnup').on('click', function(){
   send('up');
});


$('#btdown').on('click', function(){
   send('down');
});
