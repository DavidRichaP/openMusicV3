const autoBind = require('auto-bind')

class SongHandler {
	constructor(service, validator) {
		this._service = service.song
		this._validator = validator.song

		autoBind(this)
	}

	async postSongHandler(request, h) {
		this._validator.validateSongsPayload(request.payload)

		const { title, year, genre, performer, duration, albumId } =
			request.payload

		const songs = await this._service.addSong({
			title,
			year,
			genre,
			performer,
			duration,
			albumId,
		})

		const response = h.response({
			status: 'success',
			message: 'Lagu sukses ditambahkan',
			data: {
				songId: songs,
			},
		})
		response.code(201)
		return response
	}

	async getSongsHandler() {
		const songs = await this._service.getSongs()
		return {
			status: 'success',
			data: {
				songs,
			},
		}
	}

	async getSongByIdHandler(request, h) {
		const { id } = request.params
		const song = await this._service.getSongById(id)
		return {
			status: 'success',
			data: {
				song,
			},
		}
	}

	async putSongByIdHandler(request, h) {
		this._validator.validateSongsPayload(request.payload)

		const { id } = request.params

		await this._service.editSongById(id, request.payload)

		return {
			status: 'success',
			message: 'Lagu berhasil diperbarui',
		}
	}

	async deleteSongByIdHandler(request, h) {
		
	const { id } = request.params
		await this._service.deleteSongById(id)
		return {
			status: 'success',
			message: 'Lagu berhasil dihapus',
		}
	}
}

module.exports = SongHandler
