import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const configurationSchema = new Schema({
        maxDownloadsPerIp: {type: Number, default: 5},
        maxUploadsPerIp: {type: Number, default: 5},
        inactivityLimit: {type: Number, default: 7},
        startDate: {type: Date, required: true, default: Date.now},
        endDate: {
            type: Date, required: true, default: () => {
                const date = new Date();
                date.setFullYear(date.getFullYear() + 1);
                return date;
            }
        }
    },
    {
        timestamps: true
    });

export const Configuration = mongoose.model("configuration", configurationSchema);

export default Configuration
