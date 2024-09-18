const autoBind = require('auto-bind')

class userHandler {
  constructor(service, validator) {
    this._service = service.user
    this._validator = validator.user
    
    autoBind(this)
  }
  
  async postUserHandler(request, h) {
    this._validator.validateUserPayload(request.payload)

    const { username, password, fullname } = request.payload

    const userId = await this._service.addUser({ username, password, fullname })

    const response = h.response ({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    })
    response.code(201)
    return response
  }

  async getUserByIdHandler(request) {

    const { id } =request.params

    const user = await this._service.getUserbyId(id)

    return {
      status: 'success',
      data: {
        user,
      },
    }
  }
}

module.exports = userHandler
