/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.addConstraint('collaborations', 'fk_collaborations.playlist_id_playlists.id', 'FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE')
  pgm.addConstraint('songs','fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
  pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE' )
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
