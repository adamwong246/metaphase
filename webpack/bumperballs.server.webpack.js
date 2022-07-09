const path = require("path");

const baseConfig = require("./server.webpack")();

module.exports = () => {
  return {
    ...baseConfig,
    entry: { masterServer: "./src/server/phaserServer.ts" },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: 'masterServer.bundle.js',
      // ...baseConfig.output
    },
  };
};
