var phones = {};

// --- sockets ---
var socket = io();

socket.on('connected', function(id) {
  console.log('connected with id:', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});

socket.on('dataChannel1', function(data) {
  if (data.mousePosition != undefined) {
    phones[data.id] = {
      last: new Date().getTime(),
      position: data.mousePosition
    };
  }
});

/* There are 3 channels to send data through sockets.
 * You can use them as you want.
 * For example, you can use one channel to send sensor data from the phone to the visuals,
 * another channel to trigger events and the last one for communicating with other phones
 * on the network.
 */

// --- p5.js ---

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function touchStarted() {
  frameRate(15);
}

function touchEnded() {
  frameRate(60);
}


function draw() {
  background(17);
  noStroke();
  fill(255);

  if (mouseIsPressed) {
    ellipse(mouseX, mouseY, 80, 80);

    // send the input data to the display using dataChannel1
    socket.emit('dataChannel1', {
      id: socket.id,
      mousePosition: {
        x:mouseX / width,
        y:mouseY / height }
    });
  }

  drawPlayers();
}

function drawPlayers() {
  for(var id in phones) {
    var phone = phones[id];
    if (phone.position != undefined) {
      // fade out when inactive
      var timeDistance = new Date().getTime() - phone.last;
      if (timeDistance < 2000) {
        fill(map( timeDistance, 0, 2000, 255, 0 ));
        stroke(0);

        ellipse(phone.position.x * width, phone.position.y * height, 10, 10);
      } else {
        phone.position = undefined;
      }
    }
  }
}

function b1() {
  socket.emit('dataChannel1', {
    id: socket.id,
    newColor: true
  });
}
