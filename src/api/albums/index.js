const AlbumsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
	name: 'album',
	version: '2.0.0',
	register: async (server, { service, validator }) => {
		const OpenMusic = new AlbumsHandler(service, validator)
		server.route(routes(OpenMusic))
	},
}
