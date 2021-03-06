const http = require('http');
const Koa = require('koa');
const router = require('koa-router')();
const send = require('koa-send');
const socket = require('socket.io');
const path = require('path');
const osc = require('node-osc');

global.__base = path.join(__dirname, '..');
global.__sketchesDirectory = path.join(__base, 'sketches');
//set the defaoult piece
global.__selectedPiece = 'demo_template';

const api = require('./api.es6');
const routeController = require('./routeController.es6');


/*
 * SERVER
 */
const app = new Koa();

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
  console.log(' ---- ');
});

// use the API
app.use(api);

// use the routes
app.use(routeController);

const server = http.createServer(app.callback())

/*
 * SOCKETS
 */
const io = socket(server);

// pass socketio to the koa context
app.context.io = io;

// TODO: dynamically create client.
var client = new osc.Client('192.168.178.134', 10627);

io.on('connection', socket => {
   console.log(`socket connected | id ${socket.id}`);

	socket.emit('connected', socket.id);

   // sketch data channels
	socket.on('dataChannel1', msg => {
		socket.broadcast.emit('dataChannel1', msg);
	});

	socket.on('dataChannel2', msg => {
		socket.broadcast.emit('dataChannel2', msg);
	});

	socket.on('dataChannel3', msg => {
		socket.broadcast.emit('dataChannel3', msg);
	});

	socket.on('osc', msg => {
		client.send(msg.address, msg.message, function () {
		});	
	});

});

// id generator
var custom_id = 0
io.engine.generateId = (req) => {
  return "OTS:id:" + (''+custom_id++).padStart(4, "0");
}

var port = 3000;
console.log('listening on port', port);
server.listen(port);
