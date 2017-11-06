const async = require("async");
const sass = require("node-sass");
const path = require("path");
const utils = require("loader-utils");

const threadPoolSize = (process.env.UV_THREADPOOL_SIZE || 4) - 1;
const asyncSass = async.queue(sass.render, threadPoolSize);

/**
 * The loader makes node-sass available to webpack modules.
 *
 * @this {LoaderContext}
 * @param {string} content
 */
module.exports = function (content) {
	this.cacheable && this.cacheable();
	const callback = this.async();
	const resourcePath = this.resourcePath;
	const self = this;

	if (typeof callback !== "function") {
		throw new Error("Synchronous compilation is not supported.");
	}

	const options = Object.assign({}, utils.getOptions(self), { data: content });
	options.includePaths.push(path.dirname(resourcePath));

	if (options.sourceMap) {
		options.sourceMap = path.join(process.cwd(), "sass.map");
		options.sourceMapRoot = process.cwd();
		options.omitSourceMapUrl = true;
		options.sourceMapContents = true;
	}

	asyncSass.push(options, (err, result) => {
		if (err) {
			err.file && self.dependency(err.file);
			callback(err);
			return;
		}

		if (result.map && result.map !== "{}") {
			result.map = JSON.parse(result.map);
			// result.map.file is an optional property that provides the output filename.
			// Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
			delete result.map.file;
			// The first source is 'stdin' according to node-sass because we've used the data input.
			// Now let's override that value with the correct relative path.
			// Since we specified options.sourceMap = path.join(process.cwd(), "/sass.map"); in normalizeOptions,
			// we know that this path is relative to process.cwd(). This is how node-sass works.
			result.map.sources[0] = path.relative(process.cwd(), resourcePath);
			// node-sass returns POSIX paths, that's why we need to transform them back to native paths.
			// This fixes an error on windows where the source-map module cannot resolve the source maps.
			// @see https://github.com/webpack-contrib/sass-loader/issues/366#issuecomment-279460722
			result.map.sourceRoot = path.normalize(result.map.sourceRoot);
			result.map.sources = result.map.sources.map(path.normalize);
		} else {
			result.map = null;
		}

		// node-sass returns POSIX paths
		result.stats.includedFiles.forEach(x => self.dependency(path.normalize(x)));
		callback(null, result.css.toString(), result.map);
	});
};