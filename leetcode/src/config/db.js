const mongoose = require('mongoose');

let isConnected = false;

async function main(){
    if (isConnected) {
        console.log("Using existing connection");
        return;
    }

    try {
        await mongoose.connect(process.env.DB_CONNECT_STRING);
        isConnected = true;
        console.log("connected");
    } catch (error) {
        console.error("DB connection failed:", error);
        throw error;
    }
}

module.exports = main;
