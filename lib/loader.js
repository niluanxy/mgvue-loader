var fs = require("fs"), BASE_DIR = __dirname;

function logPrint() {
    var args = arguments, output = "", sp = "";

    for(var i=0; i<64; i++) sp+="-";

    for(var i=0; i<args.length; i++) {
        output += args[i] + "\n";
    }

    return "\n" + sp + "\n" + output + sp + "\n";
}

function genID(resource) {
    var result = resource.match(/(pages\/)(.*)(\/index\.js)$/);

    if (result && result[2]) {
        result = result[2].replace(/\//g, "_");
    } else {
        result = null;
    }

    return result;
}

module.exports = function(source, map) {
    this.cacheable();

    var isProd = this.minimize || process.env.NODE_ENV === 'production',
        comid  = genID(this.resource), hotScript, options = this.query;

    if (isProd !== true && comid) {
        source = source.replace(/module.exports\s*=\s/,
            ';\nvar _H_O_T_COM__; module.exports = _H_O_T_COM__ = '
        );

        hotScript = fs.readFileSync(BASE_DIR+"/script.js").toString();
        hotScript = hotScript.replace(/_COMID_/g, comid);
        hotScript = hotScript.replace(/_NEWCOM_/g, "_H_O_T_COM__");

        if ((typeof options === "string" && options.match("autoReload=false"))
            || (options && options.autoReload === false)) {
            hotScript = hotScript.replace(/_AUTO_RELOAD_/g, "false");
        } else {
            hotScript = hotScript.replace(/_AUTO_RELOAD_/g, "true");
        }

        source += ";\n" + hotScript;

        this.callback(null, source, map);
    } else {
        this.callback(null, source, map);
    }
}
