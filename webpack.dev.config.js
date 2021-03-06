const path = require('path');
const base = require('./webpack.base.config');

module.exports = {
    ...base,
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    }
};
