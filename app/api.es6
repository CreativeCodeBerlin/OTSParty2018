const Router = require('koa-router');

var api = new Router({
   prefix: '/api'
});

api.get('/pieces', (ctx, next) => {
   var pieces = {
      one: 2,
      two: 3
   };

   ctx.body = JSON.stringify(pieces);
   next();
});

api.post('/play/:id', (ctx, next) => {
   console.log(`getting play id = ${ctx.params.id}`);
   ctx.body = `Hello api id ${ctx.params.id}`;
   next();
});

module.exports = api.routes();

