const detailedMapping = ({
    id,
    name,
    year,
    title,
    genre,
    performer,
    duration,
    albumId,
    created_at,
    updated_at
  }) => ({
    id,
    name,
    year,
    title,
    genre,
    performer,
    duration,
    albumId,
    createdAt: created_at,
    updatedAt: updated_at,
  });
  
  const simpleMapping = ({
    id,
    title,
    performer,
  }) => ({
    id,
    title,
    performer,
  })

  module.exports = {detailedMapping,simpleMapping};
