module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@controllers': './src/controllers',
        '@services': './src/services',
        '@models': './src/models',
        '@routes': './src/routes',
        '@config': '.src/config',
      },
    }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  ignore: [
    '**/*.spec.ts',
  ],
};
