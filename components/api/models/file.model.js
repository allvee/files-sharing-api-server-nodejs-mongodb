import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const Schema = mongoose.Schema;

const fileSchema = new Schema({
        ipAddress: {type: String, required: true},
        originalName: {type: String, required: true},
        publicKey: {type: String, required: true},
        privateKey: {type: String, required: true},
        size: {type: String},
        mimetype: {type: String, required: true},
        filepath: {type: String, required: true},
        provider: {type: String, default: 'local'},
        lastDownloadDate: {type: Date, default: null},
    },
    {
        timestamps: true
    });

fileSchema.plugin(mongoosePaginate);

export const File = mongoose.model("files", fileSchema);

export default File
