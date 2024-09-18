const InvariantError = require('../../exceptions/InvariantError')
const collabPayloadSchema = require('./schema')

const collaborationsValidator = {
  validateCollaborationPayload: (payload) => {
    const validationResult = collabPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = collaborationsValidator
