// const mongoose = require('mongoose');

// const connectDB = async () => {
//     try {
//         await mongoose.connect(process.env.DATABASE_URI, {
//             useUnifiedTopology: true,
//             useNewUrlParser: true
//         });
//     } catch (err) {
//         console.error(err);
//     }
// }

// module.exports = connectDB


const { Client } = require("pg");

const client = new Client(process.env.DATABASE_URI); //Configuring PostgresSQL Database

module.exports = client;