const path = require("path");

const baseConfig = require("../src/games/bumperBalls/game/webpack.config")();

module.exports = () => {
  return {
    ...baseConfig,
    entry: { master: "./src/games/bumperBalls/master/index.ts" },
    output: {
      path: path.resolve(__dirname, "dist"),
      ...baseConfig.output
    },
  };
};
