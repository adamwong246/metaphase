Metaphase is a framework for creating multi-player phaserjs games in Typescript. It includes everything you need to make and host an MMO game. 

Metaphase is designed for games of a specific architiecture- an authoritarive server and sylized client. The client loads the art assets and gathers user inputs, while the server acts as a "refereree". In the `bumperBalls` example, note how the client does not include a physics system- the physics are done entirely on the server. An insanely fast UDP server (`geckos`) is included to syncronize the two processes. Though the server and client run as seperate processes, they are built from a singular code TS base, which means you can trivially share code between the two. This makes it easy and fast to develop games where latency must be minimized. 

Metaphase is built entirely from web technology. Though the phaserjs library was intended to only run on the browser, through the miracle of webpack, it can be run in on the node server with `jsdom` and managed with `pm2`. This means that you can host multiple sessions at once, scaling your session-processes on demand, or run multiple versions of your game without redeploying. 

Metaphase also includes:
- an http server (`koa`)
- database (`knex` + whatever DB you like)
- user-account system (`passport`)
- html templating (SSR `react`)

Metaphase is 100% TS and can easily be extended.
