const Router = require('koa-router');
const path = require('path');
const fs = require('fs');

var api = new Router({
   prefix: '/api'
});

// display list of projects
api.get('/pieces', async (ctx, next) => {
   var pieces = [];

   await new Promise(resolve => {
      fs.readdir(__sketchesDirectory, (err, files) => {
         pieces = files;
         resolve();
      });
   });

	var result = {};
	for (let id in pieces) {
		var name = pieces[id];
		result[id] = name;
	}
	result['active'] = __selectedPiece;

   ctx.status = 200;
   ctx.body = result;

   next();

});

// set a piece for playing
api.post('/play/:piecename', (ctx, next) => {
   // set a new piece
   __selectedPiece = ctx.params.piecename;
   console.log(`API play new piece ${__selectedPiece}`);

   // call reload visuals and phones with a new piece
   ctx.io.emit('reload', ctx.params.piecename);

   next();

   ctx.body = {
		status: 202,
		msg: `Sketch ${__selectedPiece} selected`,
		sketch: __selectedPiece
	};

   ctx.status = 202;
});

module.exports = api.routes();
