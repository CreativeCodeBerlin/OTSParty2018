var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed
*/
socket.on('reload', function(piecename) {
  location.reload();
});


var phones = {};

// receive data from the phones
socket.on('dataChannel1', function(data) {

  if(phones[data.id] == undefined) {
    phones[data.id] = {
      color: color(random(255), random(255), random(255))
    };
  }
  var phone = phones[data.id];

  if (data.mousePosition != undefined) {
    phone.last = new Date().getTime();
    phone.position = data.mousePosition;
  } else if(data.newColor) {
    phone.color = color(random(255), random(255), random(255));
  }
});

// init visuals
function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  //background(0);

  drawCubes();
}

// draw a cube at the position of each phone input
function drawCubes() {
  push();
  translate(-width/2, -height/2);

  for(var id in phones) {
    var phone = phones[id];
    if (phone.position != undefined) {
      push();

      // fade cube out when is inactive
      var timeDistance = new Date().getTime() - phone.last;
      if (timeDistance < 2000) {
        var a = map( timeDistance, 0, 2000, 255, 0 );
        fill(phone.color);
        stroke(0);
        translate(phone.position.x * width, phone.position.y * height);
        rotateX(frameCount * 0.01);
        box(50);
      }
      else {
        phone.position = undefined;
      }

      pop();
    }
  }
  pop();
}
