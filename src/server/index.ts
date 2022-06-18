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
import RootView from "./views/Index.tsx";
import Home from "./views/Home.tsx";
import Signin from "./views/Regsiter";
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
  return knex('users').where({ id }).first()
    .then((user) => { done(null, user); })
    .catch((err) => { done(err, null); });
});

passport.use(new LocalStrategy.Strategy({}, (username, password, done) => {
  knex('users').where({ username }).first()
    .then((user) => {
      if (!user) return done(null, false);
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


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

const Layout = (ctx, child) => {

  if (ctx.isAuthenticated()) {
    return queries.getSingleUser(ctx.state.user.id).then((users) => {
      const username = users[0].username;
      console.log(username);
  
      return ReactDOMServer.renderToString(
        React.createElement(RootView, {
          username,
          isAuthenticated: ctx.isAuthenticated(),
          children: React.createElement(child, { isAuthenticated: ctx.isAuthenticated() })
        })
      );
    })
  } else {  
      return ReactDOMServer.renderToString(
        React.createElement(RootView, {
          username: 'guest',
          isAuthenticated: ctx.isAuthenticated(),
          children: React.createElement(child, { isAuthenticated: ctx.isAuthenticated() })
        })
      );

  }

  
  

  
};

function ensureAuthenticated(context) {
  return context.isAuthenticated();
}

function ensureAdmin(context) {
  return new Promise((resolve, reject) => {
    if (context.isAuthenticated()) {
      queries.getSingleUser(context.state.user.id)
        .then((user) => {
          if (user && user[0].admin) resolve(true);
          resolve(false);
        })
        .catch((err) => { reject(false); });
    }
    return false;
  });
}

router.get('/', async (ctx) => {
  // ctx.type = 'html';
  // ctx.body = Layout(ctx, Home);

  const r = await Layout(ctx, Home);
  ctx.type = 'html';
  ctx.body = r;

});

router.get('/auth/register', async (ctx) => {
  ctx.type = 'html';
  ctx.body = Layout(ctx, Signin);
});

router.post('/auth/register', async (ctx) => {
  const user = await queries.addUser(ctx.request.body);
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.type = 'html';
      ctx.login(user);
      ctx.redirect('/');
    } else {
      ctx.type = 'html';
      ctx.status = 400;
      ctx.body = { status: 'error' };
    }
  })(ctx);
});

router.get('/auth/status', async (ctx) => {
  ctx.type = 'html';
  ctx.body = Layout(ctx, Status);
});

router.get('/auth/logout', async (ctx) => {
  if (ensureAuthenticated(ctx)) {
    ctx.logout();
    ctx.redirect('/');
  } else {
    ctx.body = { success: false };
    ctx.throw(401);
  }
});

router.post('/auth/login', async (ctx) => {
  return passport.authenticate('local', (err, user, info, status) => {
    if (user) {
      ctx.login(user);
      ctx.redirect('/');
    } else {
      ctx.status = 400;
      ctx.body = { status: 'error' };
    }
  })(ctx);
});

app.use(router.routes());


