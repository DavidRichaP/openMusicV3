const AuthHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'auth',
  version: '1.0.0',
  register: async (server, {
    authService,
    userService,
    tokenManager,
    validator
  }) => {
    const authHandler = new AuthHandler(
      authService,
      userService,
      tokenManager,
      validator,
    )

    server.route(routes(authHandler))
  },
}