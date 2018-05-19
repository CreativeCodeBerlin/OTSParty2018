const Koa = require('koa');

const api = require('./api.es6');

const path = require('path');
const app = new Koa();


global.__base = path.join(__dirname, '..');

app.use(require('koa-static')( path.join(__base,'public') ));
app.use(api);

app.listen(8080);
