const path = require("path");

module.exports = {
    entry: ["./httpdocs/App.js"],
    output: {
        path: path.join(__dirname, 'httpdocs/dist/js'),
        publicPath: '/httpdocs/dist/js',
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
            }
        ]
    }
};