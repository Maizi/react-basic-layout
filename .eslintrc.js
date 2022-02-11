module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  parser: 'babel-eslint',
  globals: {
    $: true,
    _g_deflang: true,
    require: true,
    envConfig: true,
    process: true,
    React: true,
    ysf: true,
    initNECaptcha: true,
    initNECaptchaWithFallback: true,
  },
  // plugins: ["react"],
  rules: {
    //"react/jsx-uses-react": 2,
    'no-nested-ternary': 0, // 允许嵌套三元表达式
    'no-script-url': 0, // 允许javascript:;
    'prefer-destructuring': 0, // 关闭强制使用解构
    'no-plusplus': 0, // 允许使用++和--的操作
    'array-callback-return': 0, // 允许数组map不返回值
    'consistent-return': 0,
    'no-param-reassign': 0, // 允许修改函数形参
    'no-unused-expressions': 0,
    'no-restricted-syntax': 0,
    'react/prop-types': 0,
    'no-prototype-builtins': 0,
    'react/no-deprecated': 0, // 关闭react弃用检测
    'react/no-string-refs': 0,
    'no-useless-escape': 0,
    'jsx-quotes': ['error', 'prefer-single'],
    'jsx-quotes': 0,
    quotes: ['error', 'single'],
  },
};
