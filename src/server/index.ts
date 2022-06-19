import * as ReactDOMServer from 'react-dom/server'
import bcrypt from 'bcryptjs';
import bodyParser from "koa-bodyparser";
import Koa from "koa";
import LocalStrategy from 'passport-local';
import passport from "koa-passport";
import React from "react";
import Router from 'koa-router';
import session from "koa-session";
import serve from 'koa-static'; 

import knex from './db/connection';
import queries from './db/queries/users';
import RootView from "./views/Index.tsx";
import Home from "./views/Home.tsx";
import Admin from "./views/Admin.tsx";
import PlayView from "./views/PlayView.tsx";

import {PhaserGame} from "./phaserGame";
const game = PhaserGame();

import { IUser } from "./types";

type IAccount = {
  userid: string;
  username: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
};

const PORT = process.env.PORT || 1337;
const app = new Koa();
const router = new Router();

app.keys = ['super-secret-key'];

app.use(session(app));
app.use(bodyParser());
app.use(serve('./dist'));

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


const Layout = <a>(user: IAccount, child, payload: a) => {
  return ReactDOMServer.renderToString(
    React.createElement(RootView, {
      ...user,
      children: React.createElement(child, { ...payload, ...user })
    })
  );
};

const noAuth: 
  (ctx: any, guestUser: (a: IAccount) => any) => any 
  = (ctx, guestUser) => {
  if (ctx.isAuthenticated()) {
    return queries.getSingleUser(ctx.state.user.id).then((users) => {

      if (users[0].admin) {
        return guestUser({
          userid: ctx.state.user.id,
          username: users[0].username,
          isAdmin: true,
          isAuthenticated: true,
        });
      } else {
        return guestUser({
          userid: ctx.state.user.id,
          username: users[0].username,
          isAdmin: false,
          isAuthenticated: true,
        });
      }

    })
  } else {
    return guestUser({
      userid: '-1',
      username: 'guest',
      isAdmin: false,
      isAuthenticated: false,
    });
  }
};

const auth: (
  ctx: any,
  guestUser: (a: IAccount) => any,
  plainUser: (a: IAccount) => any,
  adminUser: (a: IAccount) => any,
) => any = (ctx, guestUser, plainUser, adminUser) => {
  if (ctx.isAuthenticated()) {
    return queries.getSingleUser(ctx.state.user.id).then((users) => {

      if (users[0].admin) {
        return adminUser({
          userid: ctx.state.user.id,
          username: users[0].username,
          isAdmin: true,
          isAuthenticated: true,
        });
      } else {
        return plainUser({
          userid: ctx.state.user.id,
          username: users[0].username,
          isAdmin: false,
          isAuthenticated: true,
        });
      }

    })
  } else {
    return guestUser({
      userid: '-1',
      username: 'guest',
      isAdmin: false,
      isAuthenticated: false,
    });
  }
};

router.get('/', async (ctx) => {
  ctx.type = 'html';
  (await noAuth(ctx, async (user) => {
    ctx.body = (await Layout(user, Home));
  }));

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

router.get('/auth/logout', async (ctx) => {
  if (ctx.isAuthenticated()) {
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

router.get('/admin', async (ctx) => {
  ctx.type = 'html';

  (await auth(ctx, (user) => {
    ctx.redirect('/');
  }, (user) => {
    ctx.redirect('/');
  }, async (user) => {

    const users: IUser[] = await knex('users').select('*');
    
    ctx.body = (await Layout<{users: IUser[]}>(user, Admin, {users}));
  }));
});

router.get('/play', async (ctx) => {
  ctx.type = 'html';

  ctx.body = ReactDOMServer.renderToString(
    React.createElement(PlayView, {})
  );
});

app.use(router.routes());

import geckos from '@geckos.io/server'

const io = geckos()

io.listen(3000) // default port is 9208

io.onConnection(channel => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
  })

  channel.on('chat message', data => {
    console.log(`got ${data} from "chat message"`)
    // emit the "chat message" data to all channels in the same room
    io.room(channel.roomId).emit('chat message', data)
  })
})
