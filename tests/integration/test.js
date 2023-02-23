import request from 'supertest';
import app from '../../components/app.js';
import {describe, it} from 'mocha';
import {expect} from 'chai';

const testCases = {
    "UPLOAD": [{
        description: 'Upload single file(should upload a file and return the public and private key)',
        files: {
            path: './tests/input-files/mKiddo.png',
        },
    }, {
        description: 'Upload multiple files (should upload a files and return the public and private key) if set limit greater than one',
        files: [{
            path: './tests/input-files/profile.png',
        }, {
            path: './tests/input-files/mKiddo.png',
        }
        ],
    }, {
        description: 'should return http status 500 if internal server error',
        files: {
            path: './tests/input-files/mKiddo.5t',
        },
    }, {
        description: 'should return http status 501 if multer upload error(unsupported format/without providing any files in the request etc.)',
        files: {
            path: './tests/input-files/mKiddo.5t',
        },
    }, {
        description: 'should return http status 401 if daily upload limit exceeded',
        files: {
            path: './tests/input-files/mKiddo.png',
        },
    }
    ],
    "DOWNLOAD": [{
        description: 'should download the files with the given publicKey',
        publicKey: '0134beff-f25b-4680-9b70-3e43b2266f62'
    }, {
        description: 'should return http status 500 if without providing publicKey in the request',
        publicKey: null
    }, {
        description: 'should return http status 404 if file not found',
        publicKey: 'dd2bf10e-5548-41e8-8c5d-9946c5800db8'
    }, {
        description: 'should return http status 401 if daily download limit exceeded',
        publicKey: 'dd2bf10e-5548-41e8-8c5d-9946c5800db8'
    }
    ],
    "DELETE": [{
        description: 'should delete a file with the given privateKey',
        privateKey: '446d4b06-0a89-4f7c-8ba2-e7a8358ee410'
    }, {
        description: 'should return  http status 404 if file not found',
        privateKey: '6d3166dc-fafb-4775-a829-ac9b8a543a93'
    }, {
        description: 'should return http status 500 if without providing privateKey in the request',
        privateKey: null
    }
    ]
};


describe('POST /files', () => {

    it(testCases.UPLOAD[0].description, async () => {
        const response = await request(app)
            .post('/files')
            .attach('files', testCases.UPLOAD[0].files.path);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('successStatus');
        expect(response.body).to.have.property('publicKey');
        expect(response.body).to.have.property('privateKey');
    });

    it(testCases.UPLOAD[2].description, async () => {
        const response = await request(app)
            .post('/files')
            .attach('files', testCases.UPLOAD[2].files.path);

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });
    it(testCases.UPLOAD[3].description, async () => {
        const response = await request(app)
            .post('/files')
            .attach('files', testCases.UPLOAD[3].files.path);

        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });
    it(testCases.UPLOAD[4].description, async () => {
        const response = await request(app)
            .post('/files')
            .attach('files', testCases.UPLOAD[4].files.path);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });
});

describe('GET /files/:publicKey', () => {

    it(testCases.DOWNLOAD[0].description, async () => {
        const publicKey = testCases.DOWNLOAD[0].publicKey;
        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(200);
        expect(response.header['content-type']).to.equal('image/webp');

    });
    it(testCases.DOWNLOAD[1].description, async () => {

        const response = await request(app).get('/files/');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });
    it(testCases.DOWNLOAD[2].description, async () => {
        const publicKey = testCases.DOWNLOAD[2].publicKey;
        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });
    it(testCases.DOWNLOAD[3].description, async () => {
        const publicKey = testCases.DOWNLOAD[3].publicKey;

        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });


});

describe('DELETE /files/:privateKey', () => {

    it(testCases.DELETE[0].description, async () => {
        const privateKey = testCases.DELETE[0].privateKey;
        const response = await request(app).delete('/files/' + privateKey);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('successStatus', true);
        expect(response.body).to.have.property('message');
    });
    it(testCases.DELETE[1].description, async () => {
        const privateKey = testCases.DELETE[1].privateKey;
        const response = await request(app).delete('/files/' + privateKey);

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({
            successStatus: false,
            errorMessage: 'File not found',
        });
    });
    it(testCases.DELETE[2].description, async () => {

        const response = await request(app).delete('/files/');

        expect(response.status).to.equal(500);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });

});
