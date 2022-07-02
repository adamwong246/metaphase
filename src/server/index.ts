import { uid } from 'uid';
import * as ReactDOMServer from 'react-dom/server'
import bcrypt from 'bcryptjs';
import bodyParser from "koa-bodyparser";
import fs from "fs";
import geckos from '@geckos.io/server'
import http from "http";
import jsdom from "jsdom";
import Koa from "koa";
import LocalStrategy from 'passport-local';
import passport from "koa-passport";
import path from "path";
import React from "react";
import Router from 'koa-router';
import serve from 'koa-static';
import session from "koa-session";

import { udpEvent, udpPort } from "../index";

import Admin from "./views/Admin.tsx";
import Home from "./views/Home.tsx";
import knex from './db/connection';
import queries from './db/queries/users';
import RootView from "./views/Index.tsx";

import { IGameSession, IUser } from "./types";

const masterBundle = fs.readFileSync("./dist/master.bundle.js").toString();

type IAccount = {
  userid: string;
  username: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
};

const { JSDOM } = jsdom;
const channelSession = {};
class FakeXMLHttpRequest {
  url;
  status = 200;
  response;
  responseText;

  open(_type, url) {
    this.url = path.resolve(__dirname, url);
  }

  send() {
    const cleanUrl = this.url.split('/Users/adam/Code/spacetrash_v3/dev/')[1];
    http
      .get(cleanUrl, (resp) => {
        let data = "";

        resp.setEncoding('base64');

        // A chunk of data has been received.
        resp.on("data", (chunk) => {
          // console.log("data", chunk);
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          // console.log("end", JSON.parse(data).explanation);
          this.response = data
          this.responseText = data
          const event = { target: { status: this.status } }
          this.onload(this, event)
        });
      })
      .on("error", (err) => {
        console.log("Error: " + err.message);
      });
  }
  onload(xhr, event) { }
  onerror(err) { }
  onprogress() { }
};

const PORT = process.env.PORT || 1337;
const app = new Koa();
const router = new Router();
const GameSessions: any[] = [];

const udpServer = geckos();
udpServer.listen(udpPort);

{ // setup server
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

  app.listen(PORT, () => console.log(`http server running on port: ${PORT}`));
}

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

{ // routing
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

      ctx.body = (
        await Layout<{ users: IUser[], gameSessions: IGameSession[] }>(user, Admin, { users, gameSessions: GameSessions })
      );
    }));
  });

  router.get('/play/:id', async (ctx) => {
    const gameUid = ctx.params.id;

    ctx.type = 'html';
    ctx.body = `
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/phaser@3.15.1/dist/phaser.min.js"></script>
    <script> localStorage.setItem('udpRoomUid', '${gameUid}')</script>
    <script src="/slave.bundle.js"></script>
    </script>
  </head>
  <body></body>
</html>
    `;
  });

  router.post('/gameSession', async (cntxt) => {
    const newuid = uid();
    GameSessions.push(
      {
        uid: newuid,
        game: new JSDOM(
          `
<!DOCTYPE html>
<html>
  <head><script>${masterBundle}</script></head>
  <body></body>
</html>
    `,
          {
            url: "https://example.org/",
            runScripts: "dangerously",
            resources: "usable",
            pretendToBeVisual: false,

            beforeParse: (window) => {

              window.XMLHttpRequest = FakeXMLHttpRequest;

              window.URL.createObjectURL = (base64) => {
                return `data:image/png;base64, ${base64}`
              };

              window.URL.revokeObjectURL = () => { };

              const animationFrame = (cb: any) => {
                if (typeof cb !== 'function') return 0 // this line saves a lot of cpu
                window.setTimeout(() => cb(0), 1)
                return 0
              }
              window.requestAnimationFrame = cb => animationFrame(cb)

              window.authoritativeUpdate = (data) => {
                udpServer.room(newuid).emit(udpEvent, { update: data })
              };

            },
          }
        )
      }
    )
    cntxt.redirect('/admin');
  })

  app.use(router.routes());
}

const gameSessionById = (uid: string) => GameSessions.find((gs) => gs.uid === uid);

udpServer.onConnection(channel => {

  channel.onDisconnect(() => {
    const gameChannel = channelSession[channel.id]
    if (gameChannel && gameSessionById(gameChannel)) {
      gameSessionById(gameChannel).game.window.removeUser(channel.id);
      udpServer.room(gameChannel).emit(udpEvent, { goodbye: channel.id });
    }
    delete channelSession[channel.id];
  });

  channel.on(udpEvent, data => {
    const { hello, go } = data;
    if (hello) {
      channel.join(hello);
      gameSessionById(hello).game.window.addUser(channel.id);
      udpServer.room(hello).emit(udpEvent, { hello: channel.id });
      channelSession[channel.id] = hello;
    } else if (go) {
      gameSessionById(channelSession[channel.id]).game.window.moveUser(channel.id, go);
    }
  })
});
