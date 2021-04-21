import {Request, Response} from "express";
import bodyParser from 'body-parser';

const red = require('@f0c1s/color-red');
const green = require('@f0c1s/color-green');
const blue = require('@f0c1s/color-blue');

const express = require('express');
const requestID = require('@m1yh3m/requestid.middleware')().requestid;
import log, {TypesEnum as LogTypes} from '@f0c1s/node-common-log-lib';

import {Client, ClientConfig, QueryResult} from "pg";
import {TAGS} from '@f0c1s/node-common-log-tag';
import {join} from 'path';
import {readFileSync} from "fs";
import {sha512} from '@f0c1s/node-sha-lib';
import {createServer as httpsServer} from "https";
import {createServer as httpServer} from 'http';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
const secretA = sha512('secretA since we are not using keys' + Date.now());
const secretB = sha512('secretB since we are not using keys' + Date.now());
const secretKeys = [secretA, secretB];

secretKeys.forEach((secret: string, i: number) => {
    log(TAGS.INFO, `secret ${i}: ${secret}`, LogTypes.LOG);
});


function forAllRoutes() {
    /* All routes go through these */
    app.all('/favicon.ico', (_: any, res: any) => {
        return res.sendStatus(404);
    });
    app.all('/.*', (_: any, res: any) => {
        return res.sendStatus(404);
    });
    app.all('*', requestID /* sets up req.ids.requestid */, (req: any, _: any, next: () => void) => {
        log(TAGS.REQUEST, `${blue(req.method.toUpperCase())} - ${red(req.path.toString())} - req.ids.requestid: ${req.ids.requestid}`);
        next();
    });
}

forAllRoutes();

import {DB} from './config/env.db';
import Timeout = NodeJS.Timeout;

const envConfig = join(__dirname, './config/env.db.json');
const {timestampdb}: DB = JSON.parse(readFileSync(envConfig).toString());
log(green(TAGS.READ('FILE')), blue(envConfig));

const timestampdbConfig: ClientConfig = {...timestampdb};
log(green(TAGS.READ('process.env.TIMESTAMP_DB_PASSWORD')), blue('********'));

const timestampdbDbClient: Client = new Client(timestampdbConfig);

timestampdbDbClient.connect()
    .then(() => console.log(`Connected to timestampdbDbClient.`))
    .catch((e: any) => log(red(TAGS.EXECUTE('timestamp-db-connect')), red(`CONNECTING TO DataBase failed\n${e}`), LogTypes.ERROR));

const appConfig = {httpPort: 54083, httpsPort: 54883};

app.get('/', (_: Request, res: Response) => {
    res.send('hello. Please POST (app, what) to /ts');
});

type ExtendedRequest = Request & { ids: { requestid: string } };

app.get('/ts', (req: ExtendedRequest, res: Response) => {
    try {
        const query = {
            name: 'get-all-timestamps',
            text: 'select * from public."timestamps" order by "ts" desc'
        };
        timestampdbDbClient.query(query, (error: Error, result: QueryResult<any>) => {
            if (error) {
                log(TAGS.INFO, `${req.method} DB timestamp select * query failed. ${JSON.stringify(error, null, 4)}`, LogTypes.WARN);
                res.sendStatus(503);
            }
            res.json({success: true, timestamps: result.rows});
        });
    } catch (e: any) {
        log(TAGS.REQUEST, `${req.method} /ts failed. ${e.message}`, LogTypes.WARN);
        res.sendStatus(400);
    }
});

app.post('/ts', (req: ExtendedRequest, res: Response) => {
    try {
        const body = req.body;
        const {app, what, requestid = req.ids.requestid} = body;

        const query = {
            name: 'register-timestamp',
            text: 'insert into public."timestamps" (app, what, requestid) values ($1, $2, $3)',
            values: [app, what, requestid]
        };
        timestampdbDbClient.query(query, (error: Error, _: QueryResult<any>) => {
            if (error) {
                log(TAGS.INFO, `${req.method} DB timestamp insert query failed. ${JSON.stringify(error, null, 4)}`, LogTypes.WARN);
                res.sendStatus(503);
            }
            res.json({success: true, requestid});

        });
    } catch (e: any) {
        log(TAGS.REQUEST, `${req.method} /ts failed. ${e.message}`, LogTypes.WARN);
        res.sendStatus(400);
    }
});

const certificates = {
    key: readFileSync(join(__dirname, './certificates/key.pem')),
    cert: readFileSync(join(__dirname, './certificates/cert.pem'))
};

/* Local cache for storing the interval ids for the app */
app.INTERVALS = [];

function handleExit() {
    function handleSignal(signal: string | symbol): void {
        log(TAGS.END, `Received ${signal.toString()}.`, LogTypes.INFO);

        function clearIntervals() {
            log(TAGS.END, 'Clearing intervals');
            Object.entries(app.INTERVALS)
                .forEach((i: Timeout | any) => clearInterval(i));
        }

        function closeDatabases() {
            log(TAGS.END, 'Closing database.');

            timestampdbDbClient.end().then(() => console.log('disconnected')).catch((e: Error) => {
                console.error('CANNOT stop timestampdbDbClient', e);
                log(TAGS.INFO, 'CANNOT stop timestampdbDbClient', LogTypes.ERROR);
            });
        }

        function exitProcess() {
            log(TAGS.END, 'Exiting process.');
            process.exit(parseInt(signal.toString()));
        }

        clearIntervals();
        closeDatabases();
        exitProcess();
    }

    process.on('SIGINT', handleSignal);
    process.on('SIGTERM', handleSignal);
}

handleExit();

const secureServer = httpsServer(certificates, app);
secureServer.listen(appConfig.httpsPort, () => {
    log(TAGS.START, `Listening on https at ${appConfig.httpsPort}.\nhttps://localhost:${appConfig.httpsPort}/`);
});

const insecureServer = httpServer(app);
insecureServer.listen(appConfig.httpPort, () => {
    log(TAGS.START, `Listening on http at ${appConfig.httpPort}.\nhttp://localhost:${appConfig.httpPort}/`);
});