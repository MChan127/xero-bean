const path = require("path");

module.exports = {
    entry: ["./httpdocs/App.js"],
    output: {
        path: path.join(__dirname, 'httpdocs/dist/'),
        publicPath: '/httpdocs/dist/',
        filename: 'main.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            },
            {
                test: /(\.css|\.scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "postcss-loader",
                    {
                        // Loads a SASS/SCSS file and compiles it to CSS
                        loader: 'sass-loader'
                    }
                ]
            },
            {
                test: /\.(jpe?g|png|gif|woff|woff2|eot|ttf|svg)(\?[a-z0-9=.]+)?$/,
                use: {
                    loader: "url-loader?limit=100000"
                }
            }
        ]
    }
};