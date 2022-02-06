import path from 'path';
import { Configuration, DefinePlugin } from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const srcPath = (subdir: string) => {
    return path.join(__dirname, 'src', subdir);
};

const webpackConfig = (): Configuration => ({
    entry: './src/index.tsx',
    ...(process.env.production || !process.env.development ? {} : { devtool: 'eval-source-map' }),

    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
        alias: {
            components: srcPath('components'),
            ajax: srcPath('ajax'),
            constants: srcPath('constants'),
            'small-components': srcPath('small-components'),
            store: srcPath('store'),
            types: srcPath('types'),
            utils: srcPath('utils'),
            assets: srcPath('assets'),
        },
    },
    output: {
        path: path.join(__dirname, '/build'),
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
        // DefinePlugin allows you to create global constants which can be configured at compile time
        new DefinePlugin({
            'process.env': process.env.production || !process.env.development,
        }),
    ],
});

export default webpackConfig;
