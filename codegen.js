var FS = require('fs');
var EJS = require('ejs');
var Router = require('express').Router();
var Schema = require('kaltura-schema');
var Lucy = require('lucy-codegen').Lucy;

var BLACKLISTED_FIELDS = ['id', 'partnerId'];
var ACTION_FIELDS = ['list', 'clone', 'delete'];

var EXT = {node: '.js', javascript: '.js', ruby: '.rb', php: '.php'}

var renderParams = {};
module.exports = {};
module.exports.initialize = function(cb) {
  Schema.initialize(function() {
    for (var service in Schema.services) {
      var serviceSchema = Schema.services[service];
      for (var action in serviceSchema.actions) {
        var actionSchema = serviceSchema.actions[action];
        var codeParams = {
          parameters: [],
          service: service,
          action: action,
          returns: actionSchema.returns && actionSchema.returns.indexOf('ListResponse') !== -1 ? 'list' : 'object',
        }
        if (ACTION_FIELDS.indexOf(action) !== -1) codeParams.action += 'Action';
        for (parameter in actionSchema.parameters) {
          var type = actionSchema.parameters[parameter].type;
          var paramObject = {name: parameter, class: type}
          var enumType = actionSchema.parameters[parameter].enumType;
          if (enumType) paramObject.enum = {name: enumType, values: Schema.enums[enumType].values};
          codeParams.parameters.push(paramObject);
          if (type.indexOf('Kaltura') !== 0) continue;

          paramObject.fields = [];
          var cls = Schema.classes[type];
          if (!cls) throw new Error('Type ' + type + ' not found in schema');
          for (field in cls.properties) {
            if (BLACKLISTED_FIELDS.indexOf(field) !== -1) continue;
            var fieldType = cls.properties[field].type;
            var enumType = cls.properties[field].enumType;
            var field = {
                name: field,
                type: fieldType,
            };
            if (enumType) field.enum = {name: enumType, values: Schema.enums[enumType].values};
            paramObject.fields.push(field);
          }
        }
        renderParams[service] = renderParams[service] || {};
        renderParams[service][action] = codeParams;
      }
    }

    Router.post('/code/build/kc_request', function(req, res) {
      var path = req.body.request.path;
      var parts = path.match(/service\/(\w+)\/action\/(\w+)$/);
      var service = parts[1], action = parts[2];
      var lang = req.body.language;
      var codeParams = renderParams[service][action];
      var tmpl = FS.readFileSync(__dirname + '/generic_actions/' + lang + EXT[lang], 'utf8');
      req.body.request.query = req.body.request.query || {};
      tmpl = EJS.render(tmpl, codeParams);
      var answers = {};
      for (var key in req.body.request.query) {
        var bracket = key.lastIndexOf('[');
        var name = bracket === -1 ? key : key.substring(bracket + 1, key.lastIndexOf(']'));
        answers[name] = {val: req.body.request.query[key]};
      }
      var lucy = new Lucy(lang, answers);
      lucy.returnCode = function(val, tabs) {
        var ret = '';
        if (lang === 'javascript' || lang === 'node') {
          ret = 'console.log(' + val + ')';
        } else if (lang === 'ruby') {
          ret = 'puts ' + val;
        } else if (lang === 'php') {
          ret = 'echo ' + val;
        }
        for (var i = 0; i < tabs; ++i) ret = ' ' + ret;
        return ret;
      }
      var code = EJS.render(tmpl, {
        Lucy: lucy,
      })
      res.json({code: code});
    })
    cb(Router);
  });
}
