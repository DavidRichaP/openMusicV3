const playlistHandler = require('./handler')
const routes = require('./routes')

module.exports = {
	name: 'playlist',
	version: '1.0.0',
	register: async (server, { service, validator }) => {
		const OpenMusic = new playlistHandler(service, validator)
		server.route(routes(OpenMusic))
	},
}
