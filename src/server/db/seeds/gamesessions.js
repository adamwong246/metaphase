exports.seed = async (knex) => {
  return knex('gamesessions').del()
    .then(() => {
      return knex('gamesessions').insert({});
    })
};
