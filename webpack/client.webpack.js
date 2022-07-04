const path = require("path");

const baseConfig = require("../src/games/bumperBalls/game/webpack.config")();

module.exports = () => {
  return {
    ...baseConfig,
    entry: { client: "./src/client/index.tsx" },
    output: {
      path: path.resolve(__dirname, "dist"),
      ...baseConfig.output
    },
  };
};
