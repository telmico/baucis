// __Module Definition__
var middleware = module.exports = {
  // Set the conditions used for finding/removing documents
  conditions: function (request, response, next) {
    if (!request.query.conditions) return next();

    request.baucis.conditions = JSON.parse(request.query.conditions);
    next();
  },
  // Apply various options based on controller parameters
  controller: function (request, response, next) {
    if (request.app.get('select')) request.baucis.query.select(request.app.get('select'));
    if (request.app.get('restrict')) return next(new Error('Use query middleware instead'));
    next();
  },
  // Apply various options based on request query parameters
  query: function (request, response, next) {
    var populate;
    var query = request.baucis.query;

    if (request.query.sort) query.sort(request.query.sort);
    if (request.query.skip) query.skip(request.query.skip);
    if (request.query.limit) query.limit(request.query.limit);
    if (request.query.select) {
      if (request.query.select.indexOf('+') !== -1) {
        return next(new Error('Including excluded fields is not permitted.'));
      }
      query.select(request.query.select);
    }
    if (request.query.populate) {
      populate = JSON.parse(request.query.populate);
      if (!Array.isArray(populate)) populate = [ populate ];
      populate.forEach(function (field) {
        if (request.app.get('deselected').contains(field.path || field)) { // TODO case
          return next(new Error('Including excluded fields is not permitted.'));
        }
        // Don't allow selecting +field from client
        if (field.select && field.select.indexOf('+') !== -1) {
          return next(new Error('Including excluded fields is not permitted.'));
        }
        query.populate(field);
      });
    }

    next();
  }
};
