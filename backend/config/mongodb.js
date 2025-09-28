import mongoose from "mongoose";

const connectDB = async () => {
    //mongodb connector
    mongoose.connection.on('connected', () => {
        console.log("DB Connected");
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/fseCommDemo`)
}

export default connectDB;