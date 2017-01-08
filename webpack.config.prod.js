/**
 * Created by 872458899@qq.com on 2017/1/7.
 */
const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports ={
    devtool:'source-map',
    entry:{
        app:['./src/app.js'],
        vendor:['react','react-dom','react-router']
    },
    output:{
        filename:'[name].js',
        path: path.resolve(__dirname,'build')
    },
    module:{
        loaders:[
            {
                test:/\.jsx?$/,
                include:[
                    path.resolve(__dirname,'src')
                ],
                loaders:['babel-loader']
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
            __DEV__:false
        }),
        new ExtractTextPlugin('style.css',{
            allChunks:true
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings: false,
                unused:true,
                dead_code:true
            }
        })
    ]
};