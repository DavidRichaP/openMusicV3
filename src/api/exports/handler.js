class ExportHandler {
  constructor(service, validator) {
    this._exportService = service.exportService
    this._playlistService = service.playlist
    this._validator = validator

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this)
  }

  async postExportPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials
    const { playlistId: id } = request.params

    this._validator.validateExportSongsPayload(request.payload)

    const message = {
      userId: credentialId,
      playlistId: id,
      targetEmail: request.payload.targetEmail,
    }

    await this._playlistService.verifyPlaylistAccess(credentialId, id)
    await this._exportService.sendMessage('export:playlist', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportHandler

