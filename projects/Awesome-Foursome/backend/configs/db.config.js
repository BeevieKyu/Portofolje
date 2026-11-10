import mongoose from "mongoose";

const { DB_HOSTNAME, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, NODE_ENV } = process.env;
const CONNECTION_URI = `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB(){
    if(DB_HOSTNAME && DB_NAME && DB_PORT && DB_USER && DB_PASSWORD){
        mongoose.connection.on("error", err=>{
            console.error("Unhandled mongoose/mongodb connection error:", err);
        });
        console.log("Connecting to MongoDB", CONNECTION_URI);
        return mongoose.connect(
            CONNECTION_URI,
            {
                appName: DB_NAME + (NODE_ENV || 'development'),
                maxPoolSize: 70,
                authSource: "admin"
            }
        );
    }
    throw new Error(`Missing env variables needed to connect to MongoDB: ${DB_HOSTNAME}, ${DB_NAME}, ${DB_PORT}, ${DB_USER}, ${DB_PASSWORD}`);
}

export async function disconnectDB(){
    return mongoose.disconnect();
}