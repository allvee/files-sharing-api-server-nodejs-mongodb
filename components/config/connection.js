import mongoose from "mongoose";
import './env.config.js';

mongoose.set('strictQuery', false);
mongoose.connect(
    process.env.MONGO_CONNECTION_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`MongoDB Connected`);
    }
);