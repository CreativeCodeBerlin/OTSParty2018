const Router = require('koa-router');
const send = require('koa-send');
const path = require('path');

var routeController = new Router();

// redirect to sketch by default
routeController.get('/', (ctx, next) => {
	ctx.redirect('/sketch/phone.html');
});

// redirect to the visuals
routeController.get('/display', (ctx, next) => {
	ctx.redirect('/sketch/display.html');
});

// redirect to control panel
routeController.get('/control', (ctx, next) => {
	ctx.redirect('/control/index.html');
});


// main entry for sketches
routeController.get('/sketch/*', async (ctx, next) => {
   // substrack /sketch from path
   var filepath = path.join('/', path.relative('/sketch',ctx.path));

   await send(ctx, filepath, {
      root: path.join(__sketchesDirectory, __selectedPiece)
   });
   next();
});

routeController.get('/control/*', async (ctx, next) => {
   // substrack /control from path
   var filepath = path.join('/', path.relative('/control',ctx.path));

   await send(ctx, filepath, {
		root: path.join(__dirname, 'control'),
      index: 'index.html'
   });
   next();
});

// common static assets and libraries
routeController.get('/libs/*', async (ctx, next) => {
   // substrack /common from path
   var filepath = path.join('/', path.relative('/libs',ctx.path));

   await send(ctx, filepath, {
		root: path.join(__base, 'libs')
   });
   next();
});



//module.exports.routeSketch = routeSketch.routes();
module.exports = routeController.routes();
