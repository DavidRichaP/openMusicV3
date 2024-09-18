const autoBind = require("auto-bind")

class CollaborationsHandler {
  constructor(collaborationService, playlistService, playlistSongService, userService, validator) {
    this._collaborationsService = collaborationService
    this._playlistService = playlistService
    this._playlistSongService = playlistSongService
    this._userService = userService
    this._validator = validator

    autoBind(this)
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload
    
    await this._userService.verifyUserExist(userId)
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)

    const collaborationId = await this._collaborationsService.addCollaboration(playlistId, userId)

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil ditambahkan',
      data: {
        collaborationId
      }
    })
    response.code(201)
    return response
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload)
    const { id: credentialId } = request.auth.credentials
    const { playlistId, userId } = request.payload
    
    await this._playlistService.verifyPlaylistOwner(playlistId, credentialId)
    await this._collaborationsService.deleteCollaboration(playlistId, userId)

    return {
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    }
  }
}

module.exports = CollaborationsHandler
