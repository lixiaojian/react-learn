/**
 * Created by 872458899@qq.com on 2017/1/7.
 */
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
module.exports ={
    devtool:'cheap-module-eval-source-map',
    entry:{
        app:[
            './src/app.js',
            hotMiddlewareScript
        ]
    },
    vendor:[
        'react','react-dom','react-router'
    ],
    output:{
        filename:'[name].js',
        publicPath:'/build/',
        path: __dirname + '/build/'
    },
    module:{
        loaders:[
            {
                test:/\.jsx?$/,
                include:[
                    path.resolve(__dirname,'src')
                ],
                loaders:['react-hot','babel-loader']
            }
        ]
    },
    resolve:{
        extensions:['','.js','.jsx','.css']
    },
    plugins:[
        new webpack.optimize.CommonsChunkPlugin('vendor','vendor.js'),
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
            __DEV__:true
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};