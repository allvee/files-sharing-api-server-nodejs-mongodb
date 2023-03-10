import express from 'express';
import cors from 'cors';
import path from 'path';
import favicon from 'serve-favicon';
import helmet from 'helmet';

const app = express();

app.use(cors({
    origin: '*',
}));

app.use(helmet());
import requestIp from 'request-ip';

app.use(requestIp.mw());
import './config/connection.js'
import {general_configurations} from './config/index.js'

global.port = general_configurations.PORT;
global.application_base_url = general_configurations.APPLICATION_BASE_URL;

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use(favicon(path.join(process.cwd(), "favicon.svg")));

app.all('/', (req, res) => {

    let origin_url = req.get('origin');
    console.log("base api from origin:", origin_url);
    let response = {};
    response.success = true;
    response.status_code = 200;
    response.message = "Hi, Welcome to File Sharing API Server";
    return res.json(response);
});


import routes from './api/routes/index.js';

app.use('/', routes);

app.use((err, req, res) => {

    let error_response = {};
    error_response.seccessStatus = false;
    if (err.method === 'GET' && !err.query.publicKey) {
        error_response.errorMessage = 'publicKey key is required for download';
        return req.status(500).json(error_response);
    } else if (err.method === 'DELETE' && !err.query.privateKey) {
        error_response.errorMessage = 'Private key is required for deletion';
        return req.status(500).json(error_response);
    } else if (req.accepts('json')) {
        if (err.stack === 'ExtensionError' || err.stack === 'FieldNameMissing') {
            error_response.errorMessage = err.message;
        } else {
            error_response.errorMessage = err.statusMessage;
        }
        res.status(500).json(error_response);
    } else {
        res.status(500).send('Something broke! Please take care of this error');
    }
});

import './job/index.js';

export default app;