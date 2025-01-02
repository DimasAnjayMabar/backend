/* === Initiate Start === */

const express = require('express');
const {Client} = require('pg'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: '123',
    resave: false,
    saveUninitialized: true,
}));

/* === Initiate End === */

/* === Login Start === */

//koneksi ke database
app.post('/connect', (req, res) => {
    //request ke dalam body flutter
    const { servername, username, password, database } = req.body;

    if (!servername || !username || !password || !database) {
        return res.status(400).json({
            status: 'failure',
            message: 'Please provide all required fields: servername, username, password, database.',
        });
    }

    //inisialisasi
    client = new Client({
        host: servername,
        user: username,
        password: password,
        database: database,
        port: 5432,
    });

    //koneksi inputan client ke database
    client.connect()
        .then(() => {
            //menyimpan session (hanya untuk chrome)
            req.session.servername = servername;
            req.session.username = username;
            req.session.password = password;
            req.session.database = database;

            return res.status(200).json({
                status: 'success',
                message: 'Successfully connected to the database!',
            });
        })
        .catch((err) => {
            return res.status(500).json({
                status: 'failure',
                message: 'Failed to connect to the database: ' + err.message,
            });
        });
});

/* === Login End === */

/* === Misc Endpoint Start === */

//memulai server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

/* === Misc Endpoint End === */

