<%
  var rewriteVariable = function(v) {
    return v.replace(/([a-z])([A-Z])/g, function(whole, lower, upper) {
      return lower + '_' + upper.toLowerCase();
    })
  }
  var rewriteAction = function(a) {
    if (a.indexOf('Action') !== -1) a = a.substring(0, a.length - 6);
    return rewriteVariable(a);
  }
-%>
<% parameters.filter(function(param) {return param.fields}).forEach(function(param) { -%>
<%- param.name %> = <%- param.class %>.new();
<%   param.fields.forEach(function(field) { -%>
<%- '<\% if (Lucy.answer("' + field.name + '") !== null) { -%\>' %>
<%     if (field.type.indexOf('Kaltura') === 0) { -%>
<%- param.name %>.<%- rewriteVariable(field.name) %> = <%- '<\%- Lucy.answer("' + field.name + '") %\>' %>.new();
<%     } else if (!field.enum) { -%>
<%- param.name %>.<%- rewriteVariable(field.name) %> = <%- '<\%- Lucy.code.variable("answers.' + field.name + '") %\>' %>;
<%     } else { -%>
<%       for (valueName in field.enum.values) { -%>
<%- '<\% if (Lucy.answer("' + field.name + '") === ' + JSON.stringify(field.enum.values[valueName]) + ') { -%\>' %>
<%- param.name %>.<%- rewriteVariable(field.name) %> = <%- field.enum.name %>::<%- valueName %>;
<%- '<\% } -%\>' %>
<%       } -%>
<%     } -%>
<%- '<\% } -%\>' %>
<%   }); -%>

<% }); -%>
<% parameters.filter(function(param) {return !param.fields}).forEach(function(param) { -%>
<%     if (!param.enum) { -%>
<%- param.name %> = <%- '<\%- Lucy.code.variable("answers.' + param.name + '") %\>' %>;
<%     } else { -%>
<%       for (valueName in param.enum.values) { -%>
<%- '<\% if (Lucy.answer("' + param.name + '") === ' + JSON.stringify(param.enum.values[valueName]) + ') { -%\>' %>
<%- param.name %> = <%- param.enum.name %>::<%- valueName %>;
<%- '<\% } -%\>' %>
<%       } -%>
<%     } -%>
<% }); -%>

results = @@client.<%- rewriteVariable(service) %>_service.<%- rewriteAction(action) %>(<%- -%>
<% if (parameters.length === 0) { -%>
<%- ')' %>
<% } else if (parameters.length === 1) { -%>
<%- parameters[0].name + ')' %>
<% } else { -%>

<% parameters.forEach(function(param, index) { -%>
    <%- param.name %><%- index < parameters.length - 1 ? ',' : ')' %>
<% }); -%>
<% } -%>
<% if (returns === 'list') { -%>
<%- '<\%- Lucy.returnCode("results.objects") %\>' %>
<% } else { -%>
<%- '<\%- Lucy.returnCode("results") %\>' %>
<% } -%>
