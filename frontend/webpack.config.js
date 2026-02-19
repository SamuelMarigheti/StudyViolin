const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['sucrase'],
      },
    },
    argv
  );

  // The 'sucrase' package will now be transpiled by Babel.

  return config;
};
