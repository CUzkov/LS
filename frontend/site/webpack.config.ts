import path from 'path';
import { DefinePlugin } from 'webpack';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const srcPath = (subdir: string) => {
    return path.join(__dirname, 'src', subdir);
};

const webpackConfig = () => ({
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
            hooks: srcPath('hooks'),
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
            { test: /\.scss$/, use: [ 
                { loader: "style-loader" },  // to inject the result into the DOM as a style block
                { loader: "css-modules-typescript-loader" },  // to generate a .d.ts module next to the .scss file (also requires a declaration.d.ts with "declare modules '*.scss';" in it to tell TypeScript that "import styles from './styles.scss';" means to load the module "./styles.scss.d.td")
                { loader: "css-loader", options: { modules: { localIdentName:'[local]_[hash:base64:10]' } } },  // to convert the resulting CSS to Javascript to be bundled (modules:true to rename CSS classes in output to cryptic identifiers, except if wrapped in a :global(...) pseudo class)
                { loader: "sass-loader" },  // to convert SASS to CSS
            ] }, 
            {
                test: /\.svg$/,
                use: ['@svgr/webpack'],
            },
        ],
    },
    devServer: {
        port: 3000,
        historyApiFallback: true,
    },
    plugins: [
        // DefinePlugin allows you to create global constants which can be configured at compile time
        new DefinePlugin({
            PROD_ENV: JSON.stringify(process.env.PROD_ENV),
        }),
    ],
});

export default webpackConfig;
