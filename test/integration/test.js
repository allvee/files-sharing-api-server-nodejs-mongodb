import request from 'supertest';
import app from '../../components/app.js';
import {describe, it} from 'mocha';
import {expect} from 'chai';


describe('POST /files', () => {

    it('should upload a file and return the public and private key', async () => {
        const response = await request(app)
            .post('/files')
            .attach('files', 'D:\\OpenSource\\FileSharingAPIServer\\test\\files\\mKiddo.png')
            /*            .attach('files', 'D:\\OpenSource\\FileSharingAPIServer\\test\\files\\nbr_tin_certificate_612472694050.pdf')*/
            .expect(200);

        expect(response.body).to.have.property('successStatus');
        expect(response.body).to.have.property('publicKey');
        expect(response.body).to.have.property('privateKey');
    });
});

describe('GET /files/:publicKey', () => {

    it('should return 404 status if file is not found', async () => {
        const publicKey = 'dd2bf10e-5548-41e8-8c5d-9946c5800db8';

        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });

    it('should return 401 status if download limit excited', async () => {
        const publicKey = 'dd2bf10e-5548-41e8-8c5d-9946c5800db8';

        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(401);
        expect(response.body).to.have.property('successStatus', false);
        expect(response.body).to.have.property('errorMessage');
    });

    it('should download the files with the given public key', async () => {
        const publicKey = '5ea458ff-f59b-4f80-a9c4-aa1237b20239';
        const response = await request(app).get('/files/' + publicKey);

        expect(response.status).to.equal(200);
        expect(response.header['content-type']).to.equal('image/webp');

    });
});

describe('DELETE /files/:privateKey', () => {
    it('should delete a file with the given private key', async () => {
        const privateKey = '6d3166dc-fafb-4775-a829-ac9b8a543a91';
        const response = await request(app).delete('/files/' + privateKey);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('successStatus', true);
        expect(response.body).to.have.property('message');
    });
    it('should return 404 status if file not found', async () => {
        const privateKey = '6d3166dc-fafb-4775-a829-ac9b8a543a93';
        const response = await request(app).delete('/files/' + privateKey);

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({
            successStatus: false,
            errorMessage: 'File not found',
        });
    });

});
