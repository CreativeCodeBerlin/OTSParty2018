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

   ctx.status = 200;
   ctx.body = JSON.stringify(pieces);

   next();

});

// set a piece for playing
api.post('/play/:piecename', (ctx, next) => {
   // set a new piece
   ctx.selectedPiece = ctx.params.piecename;

   // call reload visuals and phones with a new piece
   ctx.io.emit('reload', ctx.params.piecename);
   //ctx.body = `API | play ${ctx.params.piecename}`;
   next();
});

module.exports = api.routes();

