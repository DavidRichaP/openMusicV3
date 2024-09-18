const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const {
	mapDBToModelAlbum,
	mapDBToModelAlbumSimple,
} = require('../../utils/entityAlbum')

class AlbumService {
	constructor() {
		this._pool = new Pool()
	}

	async addAlbum({ name, year }) {
		const numbers = nanoid(16)
		const id = `album-${numbers}`
		const createdAt = new Date().toISOString()

		const query = {
			text: 'INSERT INTO albums values ($1, $2, $3, $4, $5) RETURNING id',
			values: [id, name, year, createdAt, createdAt],
		}

		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new InvariantError('Failed to Add Album')
		}

		return result.rows[0].id
	}

	async getAlbums() {
		const result = await this._pool.query('SELECT * FROM albums')
		return result.rows.map(mapDBToModelAlbumSimple)
	}

	async getAlbumById(id) {
		const query = {
			text: 'SELECT * FROM albums WHERE id=$1',
			values: [id],
		}
		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new NotFoundError('Album Not Found')
		}

		const album = result.rows.map(mapDBToModelAlbum)[0]

		return album
	}

	async editAlbumById(id, payloadData) {
		const updateAt = new Date().toISOString()
		const query = {
			text: 'UPDATE albums SET name=$1, year=$2, updated_at=$3 WHERE id=$4 RETURNING id',
			values: [payloadData.name, payloadData.year, updateAt, id],
		}

		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new NotFoundError('Update Failed. Id Not Found')
		}
	}

	async deleteAlbumById(id) {
		const query = {
			text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
			values: [id],
		}

		const result = await this._pool.query(query)

		if (!result.rowCount) {
			throw new NotFoundError('Delete Failed. Id Not Found')
		}
	}
}

module.exports = AlbumService
