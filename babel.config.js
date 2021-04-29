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
        '@repositories': './src/repositories',
        '@models': './src/models',
        '@routes': './src/routes',
      },
    }],
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  ignore: [
    '**/*.spec.ts',
  ],
};
