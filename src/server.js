// hapi functionality
const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const path = require('path')
const Inert = require('@hapi/inert')

// caching

const CacheService = require('./services/redis/CacheService')

// core functionality
const albumService = require('./services/postgres/AlbumService')
const musicService = require('./services/postgres/SongService')
const songsValidator = require('../src/validator/songs')
const albumValidator = require('../src/validator/album')
const albums = require('./api/albums')
const songs = require('./api/songs')
const LikesService = require('./services/postgres/LikeService');

// user
const UserService = require('./services/postgres/UserService')
const userValidator = require('./validator/users')
const users = require('./api/users')

// playlist
const PlaylistService = require('./services/postgres/PlaylistService')
const playlistValidator = require('./validator/playlist')
const playlistSongValidator = require('./validator/playlistSongs')
const playlists = require('./api/playlist')

// uploads

const uploads = require('./api/uploads')
const StorageService = require('./services/storage/StorageService')
const uploadsValidator = require('./validator/uploads')

// auth
const auth = require('./api/auth')
const AuthService = require('./services/postgres/AuthService')
const tokenManager = require('./tokenize/TokenManager')
const authValidator = require('./validator/auth')

// collab
const collaborations = require('./api/collaborations')
const CollaborationsService = require('./services/postgres/CollabService')
const collaborationsValidator = require('./validator/collabs')

// Exports
const _exports = require('./api/exports')
const ProducerService = require('./services/rabbitMQ/ProducerService')
const ExportsValidator = require('./validator/exports')

// error and env
const ClientError = require('./exceptions/ClientError')
require('dotenv').config()

const init = async () => {
	const cacheService = new CacheService();
	const openMusicSongs = new musicService()
	const openMusicAlbums = new albumService()
	const likeService = new LikesService(cacheService);
	const userService = new UserService()
	const authService = new AuthService()
	const collaborationService = new CollaborationsService()
	const playlistService = new PlaylistService(collaborationService)
	const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'))

	const server = Hapi.server({
		port: process.env.PORT,
		host: process.env.HOST,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	})

	// userauth
	await server.register([
		{
			plugin: users,
			options: {
				service: {
					user: userService,
				},
				validator: {
					user: userValidator,
				},
			},
		},
		{
			plugin: auth,
			options: {
				authService,
				userService,
				tokenManager: tokenManager,
				validator: authValidator
			}
		},
		{
			plugin: Jwt,
		},
		{
			plugin: Inert,
		}
	])

	// jwt strat
	server.auth.strategy('openmusic_jwt', 'jwt', {
		keys: process.env.ACCESS_TOKEN_KEY,
		verify: {
			aud: false,
			iss: false,
			sub: false,
			maxAgeSec: process.env.ACCESS_TOKEN_AGE,
		},
		validate: (artifacts) => ({
			isValid: true,
			credentials: {
				id: artifacts.decoded.payload.id,
			},
		})
	})

	// main functionality
	await server.register([
		{
			plugin: albums,
			options: {
				service: {
					album: openMusicAlbums,
					user: userService,
					like: likeService
				},
				validator: {
					album: albumValidator,
				},
			},
		},
		{
			plugin: songs,
			options: {
				service: {
					song: openMusicSongs,
				},
				validator: {
					song: songsValidator,
				},
			},
		},
		{
			plugin: collaborations,
			options: {
				service:{ 
					collaborationService,
					playlistService,
					validator: collaborationsValidator
				}
			}
		},
		{
			plugin: playlists,
			options: {
				service: {
					playlist: playlistService,
					user: userService,
					song: openMusicSongs,
				},
				validator: {
					playlist: playlistValidator,
					playlistSong: playlistSongValidator,
				},
			},
		},
		{
			plugin: uploads,
			options: {
				service: {
					storage: storageService,
					album: openMusicAlbums
				},
				validator: uploadsValidator
			}
		},
		{
			plugin: _exports,
			options: {
				service: {
					exportService: ProducerService,
					playlist: playlistService
				},
				validator: ExportsValidator
			},
		},
	])

	await server.ext('onPreResponse', (request, h) => {
		// mendapatkan konteks response dari request
		const { response } = request;
	
		if (response instanceof ClientError) {
		  // membuat response baru dari response toolkit sesuai kebutuhan error handling
		  console.log(response);
		  return h.response({
			status: 'fail',
			message: response.message,
		  }).code(response.statusCode);
		}
	
		if (response instanceof Error) {
		  // kondisi ini digunakan untuk menangkap error yang tidak secara manual di-throw
		  const { statusCode, payload } = response.output;
		  switch (statusCode) {
			case 401:
			  return h.response(payload).code(401);
			case 404:
			  return h.response(payload).code(404);
			case 413:
			  return h.response(payload).code(413);
			default:
			  console.log(response);
			  return h.response({
				status: 'error',
				error: payload.error,
				message: payload.message,
			  }).code(500);
		  }
		}
	
		// jika bukan ClientError, lanjutkan dengan response sebelumnya (tanpa terintervensi)
		return response.continue || response;
	  });
	
	await server.start()
	console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
