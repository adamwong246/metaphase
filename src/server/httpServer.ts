
import * as ReactDOMServer from 'react-dom/server'
import bcrypt from 'bcryptjs';
import bodyParser from "koa-bodyparser";
import Koa from "koa";
import LocalStrategy from 'passport-local';
import passport from "koa-passport";
import React from "react";
import Router from 'koa-router';
import serve from 'koa-static';
import session from "koa-session";

import knex from './db/connection';
import queries from './db/queries/users';
import Admin from "./views/Admin.tsx";
import EmptyBody from "./views/EmptyBody.tsx";
import Home from "./views/Home.tsx";
import RootView from "./views/Index.tsx";
import ShipBuilder from "./views/ShipBuilder.tsx";

import { IGameSession, IUser, IInjections, IAccount } from "./types";

const Layout = <a>(user: IAccount, child, payload: a, injections: IInjections[] = []) => {
  return ReactDOMServer.renderToString(
    React.createElement(RootView, {
      ...user,
      injections,
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

const PORT = process.env.PORT || 1337;
const app = new Koa();
const router = new Router();

{ // setup server
  app.keys = ['super-secret-key'];

  app.use(session(app));
  app.use(bodyParser());
  app.use(serve('./webpack/dist'));

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

  app.listen(PORT, () => console.log(`http server running on port: ${PORT}`));
}

export default ({ udpServer, ServerState }) => {

  { // routing
    router.get('/', async (ctx) => {
      ctx.type = 'html';
      (await noAuth(ctx, async (user) => {
        ctx.body = (await Layout(user, Home, {}, []));
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

        ctx.body = (
          await Layout<{ users: IUser[], gameSessions: IGameSession[] }>(user, Admin, { users, gameSessions: ServerState.GameSessions })
        );
      }));
    });

    router.get('/play/:id', async (cntxt) => {
      const gameUid = cntxt.params.id;
      cntxt.type = 'html';
      (await noAuth(cntxt, async (user) => {
        cntxt.body = (await Layout(user, EmptyBody, {}, [
          { src: 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js', content: '' },
          { src: '/slave.bundle.js', content: `` },
          { content: `window.udpRoomUid = '${gameUid}';` }
        ]));
      }));
    });

    router.post('/gameSession', async (cntxt) => {
      ServerState.addSession(udpServer);
      cntxt.redirect('/admin');
    })

    router.get('/shipbuilder', async (cntxt) => {
      cntxt.type = 'html';
      (await noAuth(cntxt, async (user) => { cntxt.body = (await Layout(user, ShipBuilder, {}, [{ src: '/client.bundle.js', content: '' }])); }));
    });

    app.use(router.routes());
  }

  return app;


}