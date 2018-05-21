const http = require('http');
const Koa = require('koa');
const router = require('koa-router')();
const send = require('koa-send');
const socket = require('socket.io');
const path = require('path');

global.__base = path.join(__dirname, '..');
global.__sketchesDirectory = path.join(__dirname, 'projects');
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

// pass socketio to the koa pp contect
app.context.io = io;

// connection
io.on('connection', socket => {
	// TODO get uset ID
	//console.log('a user connected');

	socket.emit('connected', '007');

	socket.on('dataChannel1', msg => {
		socket.broadcast.emit('dataChannel1', msg);
	});

});

server.listen(3000)
