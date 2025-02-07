/*

  initialization

*/
const express = require('express');
const {Client} = require('pg'); 
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

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

/*

    create endpoint

*/

//to do here

/*

    read endpoint

*/

//to do here

/*

    update endpoint

*/

//to do here

/*

    delete ednpoint

*/

//to do here

/*

    login endpoint

*/

//connect to the database
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

/*

    logout endpoint 

*/

//menghapus session dari node js (khusus untuk chrome dan web app)
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                status: 'failure',
                message: 'Failed to logout: ' + err.message,
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully.',
        });
    });
});

/*

    misc endpoint

*/
//verify admin to setting
app.post('/verify-admin', async (req, res) => {
  const { servername, username, password, database, username_admin, password_admin } = req.body;

  const client = new Client({
    host: servername,
    user: username,
    password: String(password),
    database: database,
    port: 5432,
  });

  try {
    await client.connect(); // Properly waiting for the connection to establish

    // Query untuk mencari admin berdasarkan username
    const result = await client.query('SELECT * FROM admin WHERE username = $1', [username_admin]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        status: 'failure',
        message: 'Admin user not found',
      });
    }

    const admin = result.rows[0];

    // Verifikasi password menggunakan bcrypt
    const isMatch = await bcrypt.compare(password_admin, admin.password);

    if (isMatch) {
      // Verifikasi berhasil, kirim data admin dalam response
      return res.status(200).json({
        status: 'success',
        message: 'Admin verified successfully',
        admin: {
          id_admin: admin.id_admin,  // Kirimkan id_admin sebagai integer
          username_admin: admin.username,  // Pastikan mengirimkan username_admin yang benar
        },
      });
    } else {
      return res.status(401).json({
        status: 'failure',
        message: 'Incorrect password',
      });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      status: 'failure',
      message: 'Internal server error: ' + err.message,
    });
  }
});

//memulai server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});