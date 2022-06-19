const path = require("path");

const baseConfig = require("./src/game/webpack.config")();

module.exports = () => {
  return {
    ...baseConfig,
    entry: { slave: "./src/slave/index.ts" },
    output: {
      path: path.resolve(__dirname, "dist"),
      ...baseConfig.output
    },
  };
};
