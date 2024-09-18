const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const { detailedMapping, simpleMapping } = require('../../utils/entitySongs');
const NotFoundError = require('../../exceptions/NotFoundError');
const InvariantError = require('../../exceptions/InvariantError');

class songService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title, year, genre, performer, duration, albumId }) {
        const numbers = nanoid(16);
        const id = `song-${numbers}`;
        const createdAt = new Date().toISOString();
        const updatedAt = createdAt;

        const query = {
            text: 'INSERT INTO songs values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
            values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt ]
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Failed to add song');
        }

        return result.rows[0].id;

        }

    async getSongs() {
        const result = await this._pool.query('SELECT * FROM songs');
        return result.rows.map(simpleMapping);
        }

    async getSongById(id) { 
        const query = {
            text: 'SELECT * FROM songs WHERE id=$1',
            values: [id],
        }
        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Song Not Found')
        }

        const song = result.rows.map(detailedMapping)[0]
        return song
    }

    async editSongById(id, payloadData) {
        const updateAt = new Date().toISOString()
        const query = {
            text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id',
            values: [
                payloadData.title,
                payloadData.year,
                payloadData.genre, 
                payloadData.performer, 
                payloadData.duration,
                payloadData.albumId, 
                updateAt,
                id
            ]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Update Failed. Id not found')
        }
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM songs WHERE id=$1 RETURNING id' ,
            values: [id]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount){
            throw new NotFoundError('Delete failed. Id not found')
        }
    } 

    async verifySongExist(id) {
        const query = {
          text: 'SELECT * FROM songs WHERE id = $1',
          values: [id],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
          throw new NotFoundError('Song tidak ditemukan');
        }
    }
}

module.exports = songService;
