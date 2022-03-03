"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const webpack_1 = require("webpack");
const tsconfig_paths_webpack_plugin_1 = __importDefault(require("tsconfig-paths-webpack-plugin"));
const srcPath = (subdir) => {
    return path_1.default.join(__dirname, 'src', subdir);
};
const webpackConfig = () => ({
    entry: './src/index.tsx',
    ...(process.env.production || !process.env.development ? {} : { devtool: 'eval-source-map' }),
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [new tsconfig_paths_webpack_plugin_1.default({ configFile: './tsconfig.json' })],
        alias: {
            components: srcPath('components'),
            ajax: srcPath('ajax'),
            constants: srcPath('constants'),
            'small-components': srcPath('small-components'),
            store: srcPath('store'),
            types: srcPath('types'),
            utils: srcPath('utils'),
            hooks: srcPath('hooks'),
            assets: srcPath('assets'),
        },
    },
    output: {
        path: path_1.default.join(__dirname, '/build'),
        filename: 'build.js',
        publicPath: '/',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
                exclude: /build/,
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    devServer: {
        port: 3000,
        open: true,
        historyApiFallback: true,
        proxy: {
            '/api/**': 'http://localhost:8000',
        },
    },
    plugins: [
        new webpack_1.DefinePlugin({
            'process.env': process.env.production || !process.env.development,
        }),
    ],
});
exports.default = webpackConfig;
//# sourceMappingURL=webpack.config.js.map