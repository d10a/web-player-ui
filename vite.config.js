const { resolve } = require('path')

let config = {
    mode: 'development',
    build: {
        target: 'esnext',
        sourcemap: true,
    },
    // rollupOptions: {
    //     input: {
    //         main: resolve(__dirname, 'src/index.html'),
    //     },
    // },
    server: {
        port: 8080
    }
}

module.exports = config;
