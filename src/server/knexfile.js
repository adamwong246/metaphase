const path = require('path');

const BASE_PATH = path.join(__dirname,   'db');

module.exports = {
  // test: {
  //   client: 'pg',
  //   connection: 'postgres://localhost:5432/koa_api_test',
  //   user: 'your_database_user',
  //   password: 'your_database_password',
  //   migrations: {
  //     directory: path.join(BASE_PATH, 'migrations')
  //   },
  //   seeds: {
  //     directory: path.join(BASE_PATH, 'seeds')
  //   }
  // },
  development: {
    client: 'pg',
    // connection: {
    //   host: 'postgres://localhost:5432',
    //   user: 'your_database_user',
    //   password: 'your_database_password',
    //   database: 'koa_api'
    // },
    connection: 'postgres://adam:@localhost:5432/koa_api',
    // user: 'your_database_user',
    // password: 'your_database_password',
    migrations: {
      directory: path.join(BASE_PATH, 'migrations')
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds')
    }
  }
};
