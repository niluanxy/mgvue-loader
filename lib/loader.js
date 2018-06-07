var fs = require("fs"), BASE_DIR = __dirname;

module.exports = function(source, map) {
    this.cacheable();

    var isProd = this.minimize || process.env.NODE_ENV === 'production',
        hotScript = fs.readFileSync(BASE_DIR+"/script.js").toString();

    if (isProd !== true && comid) {
        source += ";\n" + hotScript;

        this.callback(null, source, map);
    } else {
        this.callback(null, source, map);
    }
}
