import { AngularCompilerPlugin } from '@ngtools/webpack';
const path = require('path');
const webpack = require('webpack');




/*
 * SplitChunksPlugin is enabled by default and replaced
 * deprecated CommonsChunkPlugin. It automatically identifies modules which
 * should be splitted of chunk by heuristics using module duplication count and
 * module category (i. e. node_modules). And splits the chunks…
 *
 * It is safe to remove "splitChunks" from the generated configuration
 * and was added as an educational example.
 *
 * https://webpack.js.org/plugins/split-chunks-plugin/
 *
 */

const HtmlWebpackPlugin = require('html-webpack-plugin')


/*
 * We've enabled HtmlWebpackPlugin for you! This generates a html
 * page for you when you compile webpack, which will make you start
 * developing and prototyping faster.
 *
 * https://github.com/jantimon/html-webpack-plugin
 *
 */

const workboxPlugin = require('workbox-webpack-plugin');


/*
 * We've enabled TerserPlugin for you! This minifies your app
 * in order to load faster and run less javascript.
 *
 * https://github.com/webpack-contrib/terser-webpack-plugin
 *
 */

const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
// ...

let extendedExternals = {
    "nativescript-sqlite-commercial": "nativescript-sqlite-commercial",
    "nativescript-sqlite-encrypted": "nativescript-sqlite-encrypted",
    "nativescript-sqlite": "nativescript-sqlite"

};


const externals = nsWebpack.getConvertedExternals(env.externals);

const config = {
    mode: uglify ? "production" : "development",
    context: appFullPath,
    context: appFullPath,externals,
    // externals: extendedExternals
}

  

module.exports = {
        
        externals: {
        jquery: 'jQuery',
        // extendedExternals
            
        },
    
    mode: 'production',
    module: {
        rules: [
            {
                test: /(?:\.ngfactory\.js|\.ngstyle\.js|\.ts)$/,
                loader: '@ngtools/webpack'
            }
        ],
 
        plugins: [
            new HtmlWebpackPlugin(),
            HtmlWebpackInlineSourcePlugin,
            new AngularCompilerPlugin({
                tsConfigPath: 'path/to/tsconfig.json',
                entryModule: 'path/to/app.module#AppModule',
                sourceMap: true,
                i18nInFile: 'path/to/translations.en.xlf',
                i18nInFormat: 'xlf',
                i18nOutFile: 'path/to/translations.xlf',
                i18nOutFormat: 'xlf',
                locale: 'en',
                hostReplacementPaths: {
                    'path/to/config.development.ts': 'path/to/config.production.ts'
                }
            })
        ],

        devServer: {
            open: true
        },

        optimization: {
            minimizer: [new TerserPlugin()],

            splitChunks: {
                chunks: 'all'
            }
        }
}