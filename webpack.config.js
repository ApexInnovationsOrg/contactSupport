const webpack = require("webpack");

module.exports = {
	entry: ["@babel/polyfill", "./src/index.jsx"],
	output: {
		filename: "contactSupport.js"
	},
	plugins: [
		// Ignore all locale files of moment.js
		new webpack.DefinePlugin({
			"process.env.NODE_ENV": JSON.stringify("production")
		})
	],
	optimization: {
		minimize: true
	},
	module: {
		rules: [
			// BABEL JS Loader
			{
				test: /\.(js|jsx)$/,
				exclude: [/node_modules/],
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: [
								[
									"@babel/preset-env",
									{
										targets: {
											ie: "11"
										}
									}
								],
								"@babel/preset-react"
							],
							plugins: [
								"@babel/plugin-transform-flow-strip-types",
								[
									"@babel/plugin-proposal-decorators",
									{
										legacy: true
									}
								],
								[
									"@babel/plugin-proposal-class-properties",
									{
										loose: true
									}
								],
								"@babel/plugin-transform-regenerator",
								"@babel/plugin-transform-async-to-generator",
								"@babel/plugin-transform-runtime"
							]
						}
					}
				]
			},
			// CSS Loader
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			},
			// SASS Loader
			{
				test: /\.(sass|scss)$/,
				use: ["style-loader", "css-loader", "sass-loader"]
			},
			// Font Awesome Loader
			// the url-loader uses DataUrls.
			// the file-loader emits files.
			{
				test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
				// Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
				// loader: "url?limit=10000"
				loader: "url-loader",
				options: {
					name: "[name].[ext]",
					outputPath: "../fonts/",
					publicPath: "/fonts"
				}
			},
			{
				test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
				loader: "file-loader",
				options: {
					name: "[name].[ext]",
					outputPath: "../fonts/",
					publicPath: "/fonts"
				}
			}
		]
	}
};
