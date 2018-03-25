module.exports = {
    entry: "./src/main.js",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    mode: "development",

    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".ts", ".tsx", ".js", ".json"]
    },

    module: {
        rules: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader",
                options: {
                    configFile: "tsconfig.json"
                }
            },

            { test: /\.css$/, loader: "style-loader!css-loader" },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }
};