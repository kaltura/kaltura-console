var FS = require('fs');
var Express = require('express'),
    App = Express();
var LucyConsole = require('lucy-console');

var Swagger = require('./static/swagger.json');
Swagger.info['x-lucy/readme'] = FS.readFileSync(__dirname + '/static/README.md', 'utf8')

var console = new LucyConsole({
  swagger: Swagger,
  cssIncludes: ['/css/bootstrap.css', '/css/styles.css'],
  disableAutorefresh: true,
  development: process.env.DEVELOPMENT ? true : false,
  codegenPath: '/code/build/kc_request',
  proxy: true,
})

App.get('/swagger.json', function(req, res) {
  res.json(Swagger);
})
App.use(Express.static(__dirname + '/static'));
App.use(require('body-parser').json());
require('./codegen.js').initialize(function(router) {
  App.use(router);
  App.use(console.router);
});
App.listen(3000);
