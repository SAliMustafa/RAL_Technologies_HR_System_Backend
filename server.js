const app = require('./app.js')
const connectToDB = require('./config/db.js')


const dns = require('dns');
dns.setServers(['8.8.8.8', '1.0.1.1']);

// connect to database and listen on Port 3000
async function startServer() {
    const PORT = process.env.PORT || 3000;
    await connectToDB();

    app.listen(PORT, () => {
        console.log(`App is running on port ${PORT}`);
    });
}
startServer();