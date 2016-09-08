'use strict';

module.exports = (server, db) => {
  server.route([{
    method: 'POST',
    path: '/sessions',
    config: {
      auth: false
    },
    handler: require('./actions/login')(db)
  }, {
    method: 'DELETE',
    path: '/sessions',
    handler: require('./actions/revoke')
  }]);
};
