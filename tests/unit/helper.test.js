const assert = require('assert');
const sinon = require('sinon');

const {v4: uuidv4} = require('uuid');

import {
    allowedFileTypes,
    generateRandomFilename,
    getPageDetails,
    updateDownloadCount
} from '../../components/utils/helper.js';


describe('helpers', () => {
    describe('allowedFileTypes', () => {
        it('should be an array', () => {
            assert(Array.isArray(allowedFileTypes));
        });
    });

    describe('generateRandomFilename', () => {
        it('should generate a string starting with img_prefix if provided', () => {
            const img_prefix = 'test';
            const filename = generateRandomFilename(img_prefix);
            assert.strictEqual(filename.startsWith(img_prefix), true);
        });

        it('should generate a string containing a UUID', () => {
            const filename = generateRandomFilename();
            const uuid = filename.split('-')[1];
            assert.strictEqual(uuidv4.is(uuid), true);
        });
    });

    describe('updateDownloadCount', () => {
        it('should update the download count for the given IP address and public key', async () => {
            // Mock DownloadHistory.findOneAndUpdate and File.updateMany methods
            const DownloadHistory = {
                findOneAndUpdate: () => Promise.resolve()
            };
            const File = {
                updateMany: () => Promise.resolve()
            };

            const spyDownloadHistory = sinon.spy(DownloadHistory, 'findOneAndUpdate');
            const spyFile = sinon.spy(File, 'updateMany');

            await updateDownloadCount('127.0.0.1', 'publicKey');

            assert(spyDownloadHistory.calledOnce);
            assert(spyFile.calledOnce);
        });

        it('should log an error message if the update fails', async () => {
            // Mock DownloadHistory.findOneAndUpdate and File.updateMany methods
            const DownloadHistory = {
                findOneAndUpdate: () => Promise.reject(new Error('Some error'))
            };
            const File = {
                updateMany: () => Promise.reject(new Error('Some error'))
            };

            const spyDownloadHistory = sinon.spy(DownloadHistory, 'findOneAndUpdate');
            const spyFile = sinon.spy(File, 'updateMany');
            const spyConsoleError = sinon.spy(console, 'error');

            await updateDownloadCount('127.0.0.1', 'publicKey');

            assert(spyDownloadHistory.calledOnce);
            assert(spyFile.notCalled);
            assert(spyConsoleError.calledOnce);

            spyConsoleError.restore();
        });
    });

    describe('getPageDetails', () => {
        it('should return an object with the expected properties', () => {
            const result = getPageDetails(10, 1, 100);
            const expectedProperties = ['current_page', 'has_previous', 'has_next', 'prevPage', 'nextPage', 'total_pages', 'total_items'];
            expectedProperties.forEach(property => {
                assert.strictEqual(result.hasOwnProperty(property), true);
            });
        });

        it('should return an object with the expected values when there are previous and next pages', () => {
            const result = getPageDetails(10, 2, 100);
            assert.strictEqual(result.current_page, 2);
            assert.strictEqual(result.has_previous, true);
            assert.strictEqual(result.has_next, true);
            assert.strictEqual(result.prevPage, 1);
            assert.strictEqual(result.nextPage, 3);
            assert.strictEqual(result.total_pages, 10);
            assert.strictEqual(result.total_items, 100);
        });

        it('should return an object with the expected values when there is only a previous page', () => {
            const result = getPageDetails(10, 2, 20);
            assert.strictEqual(result.current_page, 2);
            assert.strictEqual(result.has_previous, true);
            assert.strictEqual(result.has_next, false);
            assert.strictEqual(result.prevPage, 1);
            assert.strictEqual(result.nextPage, null);
            assert.strictEqual(result.total_pages, 2);
            assert.strictEqual(result.total_items, 20);
        });

        it('should return an object with the expected values when there is only a next page', () => {
            const result = getPageDetails(10, 1, 20);
            assert.strictEqual(result.current_page, 1);
            assert.strictEqual(result.has_previous, false);
            assert.strictEqual(result.has_next, true);
            assert.strictEqual(result.prevPage, null);
            assert.strictEqual(result.nextPage, 2);
            assert.strictEqual(result.total_pages, 2);
            assert.strictEqual(result.total_items, 20);
        });

        it('should return an object with the expected values when there are no previous or next pages', () => {
            const result = getPageDetails(10, 1, 10);
            assert.strictEqual(result.current_page, 1);
            assert.strictEqual(result.has_previous, false);
            assert.strictEqual(result.has_next, false);
            assert.strictEqual(result.prevPage, null);
            assert.strictEqual(result.nextPage, null);
            assert.strictEqual(result.total_pages, 1);
            assert.strictEqual(result.total_items, 10);
        });

    });

});
