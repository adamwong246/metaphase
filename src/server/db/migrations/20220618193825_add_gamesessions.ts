exports.up = (knex, Promise) => {
  return knex.schema.createTable('gamesessions', (table) => {
    table.increments();
  });
};

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('gamesessions');
};
