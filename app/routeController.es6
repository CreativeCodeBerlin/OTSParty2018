const Router = require('koa-router');
const send = require('koa-send');
const path = require('path');

var routeController = new Router();

// redirect to sketch by default
routeController.get('/', (ctx, next) => {
	ctx.redirect('/sketch/');
});

// main entry for sketches
routeController.get('/sketch/*', async (ctx, next) => {
   // substrack /sketch from path
   var filepath = path.join('/', path.relative('/sketch',ctx.path));
   //console.log('/Sketch route path', ctx.path);
   //console.log('/Sketch route file:', filepath);

   await send(ctx, filepath, {
      root: path.join(__sketchesDirectory, __selectedPiece),
      index: 'index.html'
   });
   next();
});

routeController.get('/control/*', async (ctx, next) => {
   // substrack /control from path
   var filepath = path.join('/', path.relative('/control',ctx.path));
   //console.log('/control route path', ctx.path);
   //console.log('/ontrol route file:', filepath);

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
   //console.log('/libs route path', ctx.path);
   //console.log('/libs route file:', filepath);

   await send(ctx, filepath, {
		root: path.join(__base, 'public', 'libs')
   });
   next();
});



//module.exports.routeSketch = routeSketch.routes();
module.exports = routeController.routes();
