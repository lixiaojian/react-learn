/**
 * Created by 872458899@qq.com on 2017/1/7.
 */
const path = require('path');
const webpack = require('webpack');

const hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
module.exports ={
    devtool:'cheap-module-eval-source-map',
    entry:{
        app:[
            './src/app.js',
            hotMiddlewareScript
        ],
        imgeCuter:[
            './src/ImageCuter.js',
            hotMiddlewareScript
        ]
    },
    output:{
        filename:'[name].js',
        publicPath:'/build/',
        path: __dirname + '/build/'
    },
    module:{
        loaders:[
            {
                test:/\.js$/,
                include:[
                    path.resolve(__dirname,'src')
                ],
                loaders:['react-hot','babel-loader']
            },
            {
                test: /\.less$/,
                loaders: [
                    'style-loader',
                    'css-loader',
                    'less-loader'
                ]
            }
        ]
    },
    resolve:{
        extensions:['','.js','.css']
    },
    plugins:[
        new webpack.optimize.DedupePlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
            __DEV__:true
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ]
};