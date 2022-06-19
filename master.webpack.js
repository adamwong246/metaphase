const path = require("path");

const baseConfig = require("./src/game/webpack.config")();

module.exports = () => {
  return {
    ...baseConfig,
    entry: { master: "./src/master/index.ts" },
    output: {
      path: path.resolve(__dirname, "dist"),
      ...baseConfig.output
    },
  };
};
