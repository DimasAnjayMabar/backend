const express = require('express');
const { Client } = require('pg');  // Import PostgreSQL Client from pg package
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));

// PostgreSQL connection (but not yet established)
let client;

// /connect endpoint to verify database connection
app.post('/connect', (req, res) => {
    const { servername, username, password, database } = req.body;

    // Validate input
    if (!servername || !username || !password || !database) {
        return res.status(400).json({
            status: 'failure',
            message: 'Please provide all required fields: servername, username, password, database.',
        });
    }

    // Attempt to establish the database connection
    client = new Client({
        host: servername,
        user: username,
        password: password,
        database: database,
        port: 5432,  // Default PostgreSQL port
    });

    client.connect()
        .then(() => {
            // Store the connection details in the session
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

// // /products endpoint to fetch product details (after session connection is successful)
app.post('/products', (req, res) => {
    const { servername, username, password, database } = req.body;
  
    // Use the provided credentials to connect to the database
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432, // PostgreSQL default port
    });
  
    client.connect()
      .then(() => {
        return client.query('SELECT * FROM barang'); // Query the products
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          products: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch products: ' + err.message,
        });
    });
});

// // /products endpoint to fetch product details (after session connection is successful)
app.post('/transactions', (req, res) => {
    const { servername, username, password, database } = req.body;
  
    // Use the provided credentials to connect to the database
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432, // PostgreSQL default port
    });
  
    client.connect()
      .then(() => {
        return client.query(`
            SELECT * 
            FROM transaksi
            JOIN customer ON transaksi.id_customer = customer.id_customer
          `); // Query the products
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          products: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch products: ' + err.message,
        });
    });
});
  
// app.get('/products', (req, res) => {
//     // Mock response for testing
//     const mockProducts = [
//         { nama_barang: 'Product 1', harga_jual: '100' },
//         { nama_barang: 'Product 2', harga_jual: '150' },
//         { nama_barang: 'Product 3', harga_jual: '200' },
//     ];

//     res.status(200).json({
//         status: 'success',
//         products: mockProducts,
//     });
// });

//debt endpoint
app.post('/debts', (req, res) => {
    const { servername, username, password, database } = req.body;
  
    // Use the provided credentials to connect to the database
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432, // PostgreSQL default port
    });
  
    client.connect()
      .then(() => {
        // Query the products where the 'hutang' column is true
        return client.query('SELECT * FROM barang WHERE hutang = TRUE'); 
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          products: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch products: ' + err.message,
        });
      })
    //   .finally(() => {
    //     client.end(); // Ensure the client connection is closed
    // });
});

app.post('/receivables', (req, res) => {
    const { servername, username, password, database } = req.body;
  
    // Use the provided credentials to connect to the database
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432, // PostgreSQL default port
    });
  
    client.connect()
      .then(() => {
        // Query the products where the 'hutang' column is true
        return client.query(`
            SELECT * 
            FROM transaksi
            JOIN customer ON transaksi.id_customer = customer.id_customer
            where piutang = true
          `);
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          products: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch products: ' + err.message,
        });
      })
    //   .finally(() => {
    //     client.end(); // Ensure the client connection is closed
    // });
});


// Route to handle logout (clear session)
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

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
