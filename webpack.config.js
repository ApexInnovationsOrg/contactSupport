const path = require("path");

module.exports = {
	entry: "./src/contactUs.jsx",
	output: {
		filename: "contactUs.js",
	},
	module: {
		rules: [
			// BABEL JS Loader
			{
				test: /\.jsx?$/,
				exclude: [/node_modules/],
				use: [
					{
						loader: "babel-loader",
						options: {
							presets: ["@babel/preset-env", "@babel/preset-react"],
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
			}
		]
	}
};
