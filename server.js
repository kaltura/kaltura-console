var Express = require('express'),
    App = Express();
var Swagger = require('./static/swagger.json');
var LucyConsole = require('lucy-console');

var console = new LucyConsole({
  swagger: Swagger,
  cssIncludes: ['/css/bootstrap.css', '/css/styles.css'],
  disableAutorefresh: true,
  development: process.env.DEVELOPMENT ? true : false,
})

App.use(Express.static(__dirname + '/static'));
App.use(require('body-parser').json());
require('./codegen.js').initialize(function(router) {
  App.use(router);
  App.use(console.router);
});
App.listen(3000);
