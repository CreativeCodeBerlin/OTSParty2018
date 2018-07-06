var phones = {};
var pg;
var fx;
var tex;

var CMD_START = 0;
var CMD_MOVE = 1;
var CMD_END = 2;

var tex = document.createElement('canvas');
var img = new Image();
img.onload = function() {
  tex.width = img.width;
  tex.height = img.height;
  tex.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
}
function loadRandomTexture() {
  var n = Math.floor(Math.random() * 40);
  img.src = 'media/' + (n < 10 ? '0' : '') + n + '.jpg';
  console.log('load ' + img.src);
}
loadRandomTexture();

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

  if(phones[data.id] == undefined) {
    phones[data.id] = {
      color: 0 //color(random(255), random(255), random(255))
    };
  }
  var phone = phones[data.id];

  if(data.cmd == CMD_START) {
    phone.color = tex.getContext('2d').getImageData(
      data.x * tex.width,
      data.y * tex.height, 1, 1).data;
  }
  if(data.cmd <= CMD_END) {
    var c = new THREE.Color(
      phone.color[0] / 255,
      phone.color[1] / 255,
      phone.color[2] / 255
    );
    var material = new THREE.MeshPhongMaterial( { color: c } );
    var cube = new THREE.Mesh( cubeGeo, material );
    cube.position.x = data.x * 2 - 1;
    cube.position.y = 1 - data.y * 2;
    cube.userData.age = 0.2;
    scene.add( cube );
  }
});

// --- three.js ---

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer({
  preserveDrawingBuffer: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.autoClearColor = false;
renderer.antialias = true;
document.body.appendChild( renderer.domElement );

var cubeGeo = new THREE.BoxGeometry( 3, 0.3, 0.3 );

camera.position.z = 1;

var light = new THREE.PointLight( 0xffffff, 1.2 );
light.position.set(1, 1, 1);
scene.add( light );

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
  requestAnimationFrame( animate );

  var t = 0.001 * Date.now();

  var old = [];
  scene.traverse( function( o ) {
    if ( o.isMesh === true ) {

      var c = tex.getContext('2d').getImageData(
        (o.position.x * 0.5 + 0.5) * tex.width,
        (o.position.y * 0.5 + 0.5) * tex.height, 1, 1).data;

      var a = c[0] + c[1] + c[2];
      o.position.x += 0.01 * Math.cos(a);
      o.position.y += 0.01 * Math.sin(a);

      o.rotation.x += 0.03;
      o.rotation.y += 0.05;

      o.userData.age *= 0.85 + 0.1 * Math.sin(t * 1.7);
      var s = o.userData.age * (0.5 + 0.4 * Math.sin(t*0.5));
      if(t % 1 < 0.05) {
        var s0 = Math.min(1, s * Math.abs(Math.tan(t)));
        var s1 = Math.min(0.1, s * Math.abs(Math.tan(t-3)));
        o.scale.set(s0, s1, s1);
      } else {
        o.scale.set(s, s, s);
      }
      if(s < 0.01) {
        old.push(o);
      }
      //o.position.x = 1 * Math.sin(t);
    }
  });
  for(var o in old) {
    scene.remove(old[o]);
  }

  renderer.render( scene, camera );
}
animate();

window.setInterval(function() {
  loadRandomTexture();
}, 15000)

