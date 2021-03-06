'use strict';

const Boom = require('boom');
const Hoek = require('hoek');

module.exports = (client, settings) => {
  return (request) => ({
    cookieName: settings.cookieName,
    expire: (key = request.state[settings.cookieName]) => {
      Hoek.assert(key, 'A key must be specified.');
      Hoek.assert(request.auth.artifacts, 'Invalid cookie.');
      return client
        .selectAsync(settings.redis.db)
        .then(client.expireAsync(`${settings.prefixKey}:${key}`, 0))
        .then(() => {
          request.auth.artifacts = null;

          if (settings.cookie.clearInvalid) {
            request.redis.reply.unstate(settings.cookieName);
          }
        })
        .catch(Boom.badImplementation);
    },
    get: (key) => {
      return client.getAsync(`${settings.prefixKey}:${key}`);
    },
    set: (key, session) => {
      Hoek.assert(key, 'Invalid token.');
      Hoek.assert(typeof session === 'object', 'Invalid session.');
      return client
        .selectAsync(settings.redis.db)
        .then(client.setAsync(`${settings.prefixKey}:${key}`, JSON.stringify(session)))
        .then(client.expireAsync(`${settings.prefixKey}:${key}`, settings.ttl))
        .then(() => {
          request.redis.reply.state(request.redis.cookieName, key);
          request.auth.artifacts = session;
        })
        .catch(Boom.badImplementation);
    }
  });
};
