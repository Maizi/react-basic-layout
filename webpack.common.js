const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var px2rem = require('postcss-px2rem');
const pages = ['index' /*, "message", "checkout"*/]; // 多页面频道配置 home - 主页 message - 通知页 checkout - 三方充值页
const envConfig = require('./config/env');
const isProduction =
  process.env.APP_ENV === 'production' ||
  process.env.APP_ENV === 'preProduction';
const isDevelopment = process.env.APP_ENV === 'development';
const shouldUseSourceMap = true;
const ASSET_PATH = process.env.ASSET_PATH || '/';

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

// 获取CSS输出
function getCssOutput() {
  let pathStyle = {};
  pages.map((item) => {
    pathStyle[`${item}Styles`] = {
      name: item,
      test: (m, c, entry = item) =>
        m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
      chunks: 'all',
      enforce: true,
    };
  });

  return pathStyle;
}

/**
 * 【获取entry文件入口】
 * @returns {Object} 返回的entry { "home":"./src/home/index.js",}
 */
function getEntry() {
  let entryConfig = {};

  pages.map((item) => {
    entryConfig[item] = `./src/${item}.js`;
  });

  return entryConfig;
}

// 获取多个页面html生成配置
function getHtmlPlugin() {
  let plugins = [];

  pages.map((item) => {
    plugins.push(
      new HtmlWebpackPlugin({
        publicPath: envConfig.STATIC_DOMAIN, // 静态资源引入domain
        template: `./src/${item}${isProduction ? '_prod' : ''}.html`,
        filename: `${item}.html`,
        hash: false,
        chunks: [item],
        // favicon: './favicon.ico',
        inject: true,
        minify: {
          collapseWhitespace: true, //把生成文件的内容的没用空格去掉，减少空间
        },
      })
    );
  });

  return plugins;
}

// cdn映射关系，用于开发环境/测试环境/生产环境
// const CDN_MAPPING = {
//     'development' : 'http://static.ecase.cn/',
//     'testing'     : 'https://static.fp-testing.com/',
//     'production'  : 'https://static.funplay666.com/'
// }

// const pathUrl = process.env.testing ? 'https://static' + process.env.testing + '.fp-testing.com/' : CDN_MAPPING[env.mode]
module.exports = {
  entry: getEntry(), // 获取entry文件入口
  optimization: {
    splitChunks: {
      cacheGroups: getCssOutput(), // CSS输出配置
    },
  },
  output: {
    filename: 'wap/js/[name].bundle.[hash:8].js',
    chunkFilename: 'wap/js/[name].bundle.[chunkhash].js',
    // publicPath: './',
    path: path.resolve(__dirname, 'dist/'),
    publicPath: envConfig.PUBLIC_PATH,
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@store': path.join(__dirname, 'src/store'),
      '@actions': path.join(__dirname, 'src/actions'),
      '@reducers': path.join(__dirname, 'src/reducers'),
      '@components': path.join(__dirname, 'src/components'),
      '@containers': path.join(__dirname, 'src/containers'),
      '@constants': path.join(__dirname, 'src/constants'),
      '@assets': path.join(__dirname, 'src/assets'),
      '@utils': path.join(__dirname, 'src/utils'),
      '@reactX': path.join(__dirname, 'src/reactX'),
      '@pages': path.join(__dirname, 'src/pages'),
      '@img': path.join(__dirname, 'src/assets/img'),
      '@audio': path.join(__dirname, 'src/assets/audio'),
      '@services': path.join(__dirname, 'src/services'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(le|c|sc)ss$/, // .less and .css
        // exclude: /node_modules/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader', // 跟MiniCssExtractPlugin.loader一起使用时 要添加 使用范围
            options: {
              plugins: [
                require('autoprefixer')({
                  browsers: [
                    'Android 4.1',
                    'iOS 7.1',
                    'Chrome > 31',
                    'ff > 31',
                    'ie >= 8',
                  ],
                }),
                px2rem({ remUnit: 75 }),
              ],
            },
          },
          'less-loader',
        ],
      },
      {
        test: /\.(html|htm)$/i,
        use: 'html-withimg-loader', // 解析 html中的图片资源
      },
      {
        //图片小于一定大小使用base64 否则使用file-loader产生真实图片
        test: /\.(png|gif|jp?g|svg|webp|ico)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 5000, //小于限定使用base64
              name: 'wap/images/[name].[hash:8].[ext]',
              publicPath: `../../`,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(eot|woff|woff2|ttf|OTF|otf)(\?.*)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'wap/fonts/[name].[hash:8].[ext]',
              publicPath: `../../`,
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.(ogg|mp3|mp4|wav|mpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              publicPath: `../../`,
              name: 'wap/medias/[name].[hash:8].[ext]',
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    ...[
      // new CleanWebpackPlugin({
      //   verbose: true,
      //   dry: false,
      //   cleanAfterEveryBuildPatterns: ["**/*"], // 清除bundle目录
      // }),
      // new webpack.DllReferencePlugin({
      //     context: __dirname,
      //     manifest: require('./dist/dll/react.manifest.json')
      // }),
      new MiniCssExtractPlugin({
        filename: 'wap/css/[name].bundle.[hash:8].css',
        chunkFilename: 'wap/css/[name].bundle.[chunkhash].css',
      }),
      new webpack.DefinePlugin({
        envConfig: JSON.stringify(envConfig),
      }),
      new webpack.HotModuleReplacementPlugin(),
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: !isDevelopment
          ? ['**/*', '!global*', '!client/js/global*', '!client/js/global/**']
          : [],
      }), // 清理非global目录文件
    ],
    ...getHtmlPlugin(),
  ],
  stats: { warnings: false, children: false },
};
