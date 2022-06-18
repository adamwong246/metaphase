import * as ReactDOMServer from 'react-dom/server'
import bcrypt from 'bcryptjs';
import bodyParser from "koa-bodyparser";
import Koa from "koa";
import LocalStrategy from 'passport-local';
import passport from "koa-passport";
import React from "react";
import Router from 'koa-router';
import session from "koa-session";

import knex from './db/connection';
import App from "./index.tsx";
import Signin from "./views/Signin";
import Status from "./views/Status";
import queries from './db/queries/users';

const PORT = process.env.PORT || 1337;
const app = new Koa();
const router = new Router();

app.keys = ['super-secret-key'];
app.use(session(app));
app.use(bodyParser());

passport.serializeUser((user, done) => { done(null, user.id); });

passport.deserializeUser((id, done) => {
  return knex('users').where({id}).first()
  .then((user) => { done(null, user); })
  .catch((err) => { done(err,null); });
});

passport.use(new LocalStrategy.Strategy({}, (username, password, done) => {
  knex('users').where({ username }).first()
  .then((user) => {
    if (!user) return done(null, false);
    // if (!comparePass(password, user.password)) {
    if (!bcrypt.compareSync(password, user.password)) {
      return done(null, false);
    } else {
      return done(null, user);
    }
  })
  .catch((err) => { return done(err); });
}));

app.use(passport.initialize());
app.use(passport.session());


app.use(
router.get('/', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'hello, world!'
  };
}).routes()
);

app.use(
  router.get('/hello', async (ctx) => {
    ctx.type = 'html';
    ctx.body = ReactDOMServer.renderToString(
      React.createElement(App),
    )
  }).routes()
);

app.use(
  router.get('/auth/register', async (ctx) => {
    ctx.type = 'html';
    ctx.body = ReactDOMServer.renderToString(
      React.createElement(Signin),
    )
  }).routes()
);

app.use(
  router.post('/auth/register', async (ctx) => {

    const user = await queries.addUser(ctx.request.body);
    return passport.authenticate('local', (err, user, info, status) => {
      if (user) {
        ctx.login(user);
        ctx.redirect('/auth/status');
      } else {
        ctx.status = 400;
        ctx.body = { status: 'error' };
      }
    })(ctx);

    // ctx.type = 'html';
    // ctx.body = ReactDOMServer.renderToString(
    //   React.createElement(Signin),
    // )
  }).routes()
);

app.use(
  router.get('/auth/status', async (ctx) => {
    ctx.type = 'html';
    ctx.body = ReactDOMServer.renderToString(
      React.createElement(Status),
    )
  }).routes()
);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
