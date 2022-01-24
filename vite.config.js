const { resolve } = require('path')

module.export config = {
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
