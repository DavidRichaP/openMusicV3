const autoBind = require("auto-bind")

class playlistHandler{
  constructor(service, validator) {
    this._service = service.playlist
    this._usersService = service.user
    this._songsService = service.song
    this._validator = validator.playlist
    this._validatorPlaylistSong = validator.playlistSong

    autoBind(this)
  }

  async postPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const idUser = await this._usersService.verifyUserExist(credentialId);
    request.payload.owner = idUser;

    this._validator.validatePlaylistPayload(request.payload)

    const playlist = await this._service.addPlaylist(request.payload)

    const response = h.response({
      status: 'success',
      message: 'Playlist sukses ditambahkan',
      data: {
        playlistId: playlist
      },
    })
    response.code(201)
    return response
  }
  
  async getPlaylistByIdHandler(request) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._service.getPlaylist(userId);


    //await this._service.verifyPlaylistAccess(id, credentialId)
    //const playlist = await this._service.getPlaylist()
    
    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistOwner(credentialId, playlistId);

    await this._service.deletePlaylist(playlistId);

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    });

    return response;
  }

  async postPlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    request.payload.playlistId = playlistId;
    await this._validatorPlaylistSong.validatePlaylistSongPayload(request.payload);
    await this._songsService.verifySongExist(songId);
    await this._service.verifyPlaylistAccess(credentialId, playlistId);

    const playlistSong = await this._service.addSongToPlaylist(request.payload, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist Song berhasil ditambahkan',
      data: {
        playlistSong,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistSongsByIdHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;

    await this._service.verifyPlaylistAccess(credentialId, playlistId);

    const playlist = await this._service.getPlaylistById(credentialId, playlistId);
    const songs = await this._service.getPlaylistSongs(playlistId);
    playlist.songs = songs;

    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id: playlistId } = request.params;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(credentialId, playlistId);

    await this._service.deletePlaylistSong(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Playlist Songs berhasil dihapus',
    });

    return response;
  }

}

module.exports = playlistHandler
