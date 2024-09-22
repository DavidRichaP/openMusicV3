const autoBind = require('auto-bind')

class AlbumHandler {
	constructor(service, validator) {
		this._service = service.album
		this._validator = validator.album
		this._usersService = service.user
		this._likesService = service.like

		autoBind(this)
	}

	async postAlbumHandler(request, h) {
		this._validator.validateAlbumsPayload(request.payload)

		const { name, year } = request.payload

		const albums = await this._service.addAlbum({ name, year })

		const response = h.response({
			status: 'success',
			message: 'Album sukses ditambahkan',
			data: {
				albumId: albums,
			},
		})
		response.code(201)
		return response
	}

	async getAlbumsHandler() {
		const albums = await this._service.getAlbums()
		return {
			status: 'success',
			data: {
				albums,
			},
		}
	}

	async getAlbumByIdHandler(request) {
		const { id } = request.params
		const album = await this._service.getAlbumById(id)
		return {
			status: 'success',
			data: {
				album,
			},
		}
	}

	async putAlbumByIdHandler(request) {

			this._validator.validateAlbumsPayload(request.payload)

			const { id } = request.params

			await this._service.editAlbumById(id, request.payload)

			return {
				status: 'success',
				message: 'Album berhasil diperbarui',
			}

	}

	async deleteAlbumByIdHandler(request) {
	
		const { id } = request.params
		await this._service.deleteAlbumById(id)
		return {
			status: 'success',
			message: 'Album berhasil dihapus',
		}
	}

	async postLikeHandler(request, h) {
		const { id: credentialId } = request.auth.credentials
		const { id: albumId } = request.params

		await this._service.getAlbumById(albumId)
		await this._usersService.verifyUserExist(credentialId)
		const likeStatus = await this._likesService.verifyLike(credentialId, albumId)

		let likeId = ''
		let message = ''
		if (!likeStatus) {
			likeId = await this._likesService.addLike(credentialId, albumId)
			message = 'Likes berhasil ditambahkan'
		} else {
			likeId = await this._likesService.deleteLike(credentialId, albumId)
			message = 'Likes berhasil dihapus'
		}

		const response = h.response({
			status: 'success',
			message,
			data: {
				likeId,
			}
		})

		response.code(201)
		return response
	}

	async getCountAlbumLikesHandler(request, h) {
		const { id: albumId } = request.params
		const result = await this._likesService.getCountLikesAlbumById(albumId)

		const response = h.response({
			status: 'success',
			data: {
				likes: result.likes
			}
		})

		if (result.source === 'cache') {
			response.header('X-Data-Source', result.source)
		} else {
			response.header('X-Data-Source', '')
		}

		return response
	}
}

module.exports = AlbumHandler
