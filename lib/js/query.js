const util = require('./util');

const modules = function modules() {
  return {
    post: function(input) {
      return util.promiseResponse(
          util.constructRequestDetails(
              {body: input},
              'coql',
              HTTP_METHODS.POST,
              true
          )
      ); // No I18N
    }
  };
};

module.exports = modules;
