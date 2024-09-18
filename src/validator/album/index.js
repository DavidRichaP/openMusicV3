const InvariantError = require('../../exceptions/InvariantError')
const { AlbumPayloadSchema } = require('../album/schema');

const AlbumValidator = {
    validateAlbumsPayload: (payload) => {
        const validationResult = AlbumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError (validationResult.error.message);
        }
    },
};

module.exports = AlbumValidator;
