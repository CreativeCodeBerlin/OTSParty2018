const Router = require('koa-router');
const path = require('path');
const fs = require('fs');

const projectFolder = path.join(global.__base, 'public', 'projects');

var api = new Router({
   prefix: '/api'
});

// display list of projects
api.get('/pieces', async (ctx, next) => {
   var pieces = [];

   await new Promise(resolve => {
      fs.readdir(projectFolder, (err, files) => {
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
   ctx.body = `API | play ${ctx.params.piecename}`;
   next();
});

module.exports = api.routes();

