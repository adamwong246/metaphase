const bcrypt = require('bcryptjs');

const hashedPassword = (phrase) => bcrypt.hashSync(phrase, bcrypt.genSaltSync());

exports.seed = async (knex) => {
  return knex('users').del()
    .then(() => {
      return knex('users').insert({
        username: 'adam',
        password: hashedPassword('supersecret'),
        admin: true
      });
    }).then(() => {
      return knex('users').insert({
        username: 'chache',
        password: hashedPassword('supersecret'),
        admin: false
      });
    })
};
