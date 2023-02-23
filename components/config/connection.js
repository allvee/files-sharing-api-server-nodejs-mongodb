import mongoose from "mongoose";
import {db_configurations} from "./index.js";

mongoose.set('strictQuery', false);
mongoose.connect(
    db_configurations.MONGO_CONNECTION_STRING,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`MongoDB Connected`);
    }
);