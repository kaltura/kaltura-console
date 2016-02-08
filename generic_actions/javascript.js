<% parameters.filter(function(param) {return param.fields}).forEach(function(param) { -%>
<%- param.name %> = new <%- param.class %>();
<%   param.fields.forEach(function(field) { -%>
<%- '<\% if (Lucy.answer("' + field.name + '") !== null) { -%\>' %>
<%     if (field.type.indexOf('Kaltura') === 0) { -%>
<%- param.name %>.<%- field.name %> = new <%- '<\%- Lucy.answer("' + field.name + '") %\>' %>();
<%     } else if (!field.enum) { -%>
<%- param.name %>.<%- field.name %> = <%- '<\%- Lucy.code.variable("answers.' + field.name + '") %\>' %>;
<%     } else { -%>
<%       for (valueName in field.enum.values) { -%>
<%- '<\% if (Lucy.answer("' + field.name + '") === ' + JSON.stringify(field.enum.values[valueName]) + ') { -%\>' %>
<%- param.name %>.<%- field.name %> = <%- field.enum.name %>.<%- valueName %>;
<%- '<\% } -%\>' %>
<%       } -%>
<%     } -%>
<%- '<\% } -%\>' %>
<%   }); -%>

<% }); -%>
<% parameters.filter(function(param) {return !param.fields}).forEach(function(param) { -%>
<%     if (!param.enum) { -%>
var <%- param.name %> = <%- '<\%- Lucy.code.variable("answers.' + param.name + '") %\>' %>;
<%     } else { -%>
<%       for (valueName in param.enum.values) { -%>
<%- '<\% if (Lucy.answer("' + param.name + '") === ' + JSON.stringify(param.enum.values[valueName]) + ') { -%\>' %>
var <%- param.name %> = <%- param.enum.name %>.<%- valueName %>;
<%- '<\% } -%\>' %>
<%       } -%>
<%     } -%>
<% }); -%>

var getResults = function() {
  if (!client.ks) return setTimeout(getResults, 100);
  client.<%- service %>.<%- action %>(function(success, results) {
<% if (returns === 'list') { -%>
    if (!success || (results && results.code && results.message)) {
      console.log('Kaltura Error', success, results);
<%- '<\%- Lucy.returnCode("results", 6) %\>' %>
    } else {
      console.log('Kaltura Result', results);
<%- '<\%- Lucy.returnCode("results.objects", 6) %\>' %>
    }
<% } else { -%>
    if (!success || (results && results.code && results.message)) {
      console.log('Kaltura Error', success, results);
    }
<%- '<\%- Lucy.returnCode("results", 4) %\>' %>
<% } -%>
  }<%- parameters.length === 0 ? ');' : ',' %>
<% parameters.forEach(function(param, index) { -%>
  <%- param.name %><%- index < parameters.length - 1 ? ',' : ');' %>
<% }); -%>
}
getResults();
