"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = __importDefault(require("body-parser"));
var red = require('@f0c1s/color-red');
var green = require('@f0c1s/color-green');
var blue = require('@f0c1s/color-blue');
var express = require('express');
var requestID = require('@m1yh3m/requestid.middleware')().requestid;
var node_common_log_lib_1 = __importStar(require("@f0c1s/node-common-log-lib"));
var pg_1 = require("pg");
var node_common_log_tag_1 = require("@f0c1s/node-common-log-tag");
var path_1 = require("path");
var fs_1 = require("fs");
var node_sha_lib_1 = require("@f0c1s/node-sha-lib");
var https_1 = require("https");
var http_1 = require("http");
var app = express();
app.disable('x-powered-by');
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded());
var secretA = node_sha_lib_1.sha512('secretA since we are not using keys' + Date.now());
var secretB = node_sha_lib_1.sha512('secretB since we are not using keys' + Date.now());
var secretKeys = [secretA, secretB];
secretKeys.forEach(function (secret, i) {
    node_common_log_lib_1.default(node_common_log_tag_1.TAGS.INFO, "secret " + i + ": " + secret, node_common_log_lib_1.TypesEnum.LOG);
});
function forAllRoutes() {
    /* All routes go through these */
    app.all('/favicon.ico', function (_, res) {
        return res.sendStatus(404);
    });
    app.all('/.*', function (_, res) {
        return res.sendStatus(404);
    });
    app.all('*', requestID /* sets up req.ids.requestid */, function (req, _, next) {
        node_common_log_lib_1.default(node_common_log_tag_1.TAGS.REQUEST, blue(req.method.toUpperCase()) + " - " + red(req.path.toString()) + " - req.ids.requestid: " + req.ids.requestid);
        next();
    });
}
forAllRoutes();
var envConfig = path_1.join(__dirname, './config/env.db.json');
var timestampdb = JSON.parse(fs_1.readFileSync(envConfig).toString()).timestampdb;
node_common_log_lib_1.default(green(node_common_log_tag_1.TAGS.READ('FILE')), blue(envConfig));
var timestampdbConfig = __assign({}, timestampdb);
node_common_log_lib_1.default(green(node_common_log_tag_1.TAGS.READ('process.env.TIMESTAMP_DB_PASSWORD')), blue('********'));
var timestampdbDbClient = new pg_1.Client(timestampdbConfig);
timestampdbDbClient.connect()
    .then(function () { return console.log("Connected to timestampdbDbClient."); })
    .catch(function (e) { return node_common_log_lib_1.default(red(node_common_log_tag_1.TAGS.EXECUTE('timestamp-db-connect')), red("CONNECTING TO DataBase failed\n" + e), node_common_log_lib_1.TypesEnum.ERROR); });
var appConfig = { httpPort: 54083, httpsPort: 54883 };
app.get('/', function (_, res) {
    res.send('hello. Please POST (app, what) to /ts');
});
app.get('/ts', function (req, res) {
    try {
        var query = {
            name: 'get-all-timestamps',
            text: 'select * from public."timestamps" order by "ts" desc'
        };
        timestampdbDbClient.query(query, function (error, result) {
            if (error) {
                node_common_log_lib_1.default(node_common_log_tag_1.TAGS.INFO, req.method + " DB timestamp select * query failed. " + JSON.stringify(error, null, 4), node_common_log_lib_1.TypesEnum.WARN);
                res.sendStatus(503);
            }
            res.json({ success: true, timestamps: result.rows });
        });
    }
    catch (e) {
        node_common_log_lib_1.default(node_common_log_tag_1.TAGS.REQUEST, req.method + " /ts failed. " + e.message, node_common_log_lib_1.TypesEnum.WARN);
        res.sendStatus(400);
    }
});
app.post('/ts', function (req, res) {
    try {
        var body = req.body;
        var app_1 = body.app, what = body.what, _a = body.requestid, requestid_1 = _a === void 0 ? req.ids.requestid : _a;
        var query = {
            name: 'register-timestamp',
            text: 'insert into public."timestamps" (app, what, requestid) values ($1, $2, $3)',
            values: [app_1, what, requestid_1]
        };
        timestampdbDbClient.query(query, function (error, _) {
            if (error) {
                node_common_log_lib_1.default(node_common_log_tag_1.TAGS.INFO, req.method + " DB timestamp insert query failed. " + JSON.stringify(error, null, 4), node_common_log_lib_1.TypesEnum.WARN);
                res.sendStatus(503);
            }
            res.json({ success: true, requestid: requestid_1 });
        });
    }
    catch (e) {
        node_common_log_lib_1.default(node_common_log_tag_1.TAGS.REQUEST, req.method + " /ts failed. " + e.message, node_common_log_lib_1.TypesEnum.WARN);
        res.sendStatus(400);
    }
});
var certificates = {
    key: fs_1.readFileSync(path_1.join(__dirname, './certificates/key.pem')),
    cert: fs_1.readFileSync(path_1.join(__dirname, './certificates/cert.pem'))
};
/* Local cache for storing the interval ids for the app */
app.INTERVALS = [];
function handleExit() {
    function handleSignal(signal) {
        node_common_log_lib_1.default(node_common_log_tag_1.TAGS.END, "Received " + signal.toString() + ".", node_common_log_lib_1.TypesEnum.INFO);
        function clearIntervals() {
            node_common_log_lib_1.default(node_common_log_tag_1.TAGS.END, 'Clearing intervals');
            Object.entries(app.INTERVALS)
                .forEach(function (i) { return clearInterval(i); });
        }
        function closeDatabasesAndExitProcess() {
            node_common_log_lib_1.default(node_common_log_tag_1.TAGS.END, 'Closing database.');
            timestampdbDbClient.end()
                .then(function () { return node_common_log_lib_1.default(node_common_log_tag_1.TAGS.INFO, 'disconnected'); })
                .catch(function (e) {
                node_common_log_lib_1.default(node_common_log_tag_1.TAGS.INFO, "CANNOT stop database client: " + e.message, node_common_log_lib_1.TypesEnum.ERROR);
            })
                .finally(function () { return exitProcess(); });
        }
        function exitProcess() {
            node_common_log_lib_1.default(node_common_log_tag_1.TAGS.END, 'Exiting process.');
            process.exit(parseInt(signal.toString()));
        }
        clearIntervals();
        closeDatabasesAndExitProcess();
    }
    process.on('SIGINT', handleSignal);
    process.on('SIGTERM', handleSignal);
}
handleExit();
var secureServer = https_1.createServer(certificates, app);
secureServer.listen(appConfig.httpsPort, function () {
    node_common_log_lib_1.default(node_common_log_tag_1.TAGS.START, "Listening on https at " + appConfig.httpsPort + ".\nhttps://localhost:" + appConfig.httpsPort + "/");
});
var insecureServer = http_1.createServer(app);
insecureServer.listen(appConfig.httpPort, function () {
    node_common_log_lib_1.default(node_common_log_tag_1.TAGS.START, "Listening on http at " + appConfig.httpPort + ".\nhttp://localhost:" + appConfig.httpPort + "/");
});
//# sourceMappingURL=timestamp.service.js.map