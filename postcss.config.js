module.exports = {
    // parser: 'sugarss',
    plugins: {
        'postcss-preset-env': {},
        'autoprefixer': {
            browsers: ['>1%', 'last 4 versions', 'Firefox ESR', 'not ie < 9'],
            flexbox: 'no-2009',
        },
        'precss': {},
    }
}