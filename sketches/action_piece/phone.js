var socket = io();

var config = {
   socket: {},
   status: 'waiting',
   restartPointAngle: true
};

socket.on('connected', function(id) {
   config.socket.id = id;
   //console.log('connected with id:', id);

   updateUI();
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
   location.reload();
});

// configuration channel
socket.on('dataChannel3', function(data) {
   if (data.to === config.socket.id)
      switch(data.topic) {
         case 'accepted':
            config.status = 'accepted';
            break;
         case 'busy':
            config.status = 'busy';
            break;
         case 'disconnected':
            location.reload();
            break;
      }

   updateUI();
});

// acelerometer sensor
if (window.DeviceOrientationEvent) {
   //console.log('device Orientation');
   window.addEventListener("deviceorientation", function() {
      tilt(event.alpha, event.beta, event.gamma, event.absolute);
   }, true);
} else if (window.DeviceMotionEvent) {
   //console.log('device Motion');
   window.addEventListener('devicemotion', function() {
      tilt(event.acceleration.x * 2, event.acceleration.y * 2, event.acceleration.z * 2);
   }, true);
} else
   window.addEventListener("MozOrientation", function() {
      tilt(orientation.x * 50, orientation.y * 50, orientation.z * 50);
   }, true);

var timer = 0;
function tilt(a, b, g, ab) {
   if (config.restartPointAngle) {
      config.restartPointAngle = false;
      config.startPointAngle = a;
   }


   if(new Date().getTime() > timer + 10) {
      //console.log('tilt | a: ' + a + ' | b: ' + b + ' | g: ' + g);
      var point = {
         x: angleDistance(-a, -config.startPointAngle) / 90.0,
         y: angleDistance(0, -b) / 90.0
      };
      //console.log('x: ' + point.x + ' | y: ' + point.y);

      //$('#a').css({
         //left: 100 + point.x * 100,
         //top: 400 + -point.y * 100
      //});

      //$('#val').html('absolute: ' + ab + 'a: ' + a + ' | b: ' + b + '</br>x: ' + point.x + ' | y: ' + point.y);
      
      pushPointData(point);

      timer = new Date().getTime();
   }
}

function toRad(val) {
   return (Math.PI / 180) * val;
}

function toDeg(val) {
   return val / (Math.PI / 180);
}

function angleDistance(alpha, beta) {
   var phi = Math.abs(beta - alpha) % 360;       // This is either the distance or 360 - distance
   var distance = phi > 180 ? 360 - phi : phi;
   var sign = (alpha - beta >= 0 && alpha - beta <= 180) || (alpha - beta <= -180 && alpha - beta >= -360) ? 1 : -1;
   distance *= sign;
   return distance;
}

function updateUI() {
   $('.screen').hide();

   switch(config.status) {
      case 'waiting':
         $('.form').show();
         break;
      case 'busy':
         $('.busy').show();
         break;
      case 'accepted':
         $('.play').show();
         break;
   }
}

function pushPointData(point) {
   if (config.status == 'accepted')
      socket.emit('dataChannel1', {
         'topic': 'point',
         'id': config.socket.id,
         'point': point
      });
};


// Enable wake lock
var noSleep = new NoSleep();

function sendRequest() {
   // request access
   socket.emit('dataChannel3', {
      'topic': 'request',
      'id': config.socket.id
   });

   noSleep.enable();
   $('.btnStart').unbind();
}

$('.btnStart').on('click', sendRequest);

// reset the startPointAngle
$(document).on('click', function(e) {
   config.restartPointAngle = true;
});
