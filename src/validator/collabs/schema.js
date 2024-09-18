const Joi = require('joi')
const collabPayloadSchema = Joi.object({
  playlistId: Joi.string().required(),
  userId: Joi.string().required(),
})

module.exports = { collabPayloadSchema }
