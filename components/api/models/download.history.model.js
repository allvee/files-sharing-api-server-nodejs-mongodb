import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
const Schema = mongoose.Schema;

const downloadHistorySchema = new Schema({
    ipAddress: {type: String, required: true},
    downloadDate: {
        type: Date, required: true, default: function () {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            return now;
        }
    },
    downloadCount: {type: Number, required: true, default: 0}
});
downloadHistorySchema.plugin(mongoosePaginate);

export const DownloadHistory = mongoose.model("downloads", downloadHistorySchema);

export default DownloadHistory
