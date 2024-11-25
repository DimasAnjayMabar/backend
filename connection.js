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
    secret: '123',
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

//fetch product into popup
app.post('/product-details', (req, res) => {
  const { servername, username, password, database, product_id } = req.body;

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
      // Query the database for a single product by ID
      return client.query('SELECT * FROM barang WHERE id_barang = $1', [product_id]);
    })
    .then((result) => {
      if (result.rows.length === 0) {
        // No product found with the given ID
        return res.status(404).json({
          status: 'failure',
          message: 'Product not found',
        });
      }

      res.status(200).json({
        status: 'success',
        products: result.rows[0], // Return only the first product (single product)
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch product details: ' + err.message,
      });
    });
});

//fetch transaction into popup
app.post('/transaction-details', (req, res) => {
  const { servername, username, password, database, transaction_id } = req.body;

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
      // Query the database for transaction details
      return client.query(`
        SELECT 
          t.id_transaksi, t.tanggal_transaksi, t.total_harga, t.piutang,
          c.nama_customer, c.no_telp_customer, c.email_customer,
          dt.id_barang, dt.quantity, dt.subtotal, b.nama_barang
        FROM transaksi t
        JOIN customer c ON t.id_customer = c.id_customer
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        JOIN barang b ON dt.id_barang = b.id_barang
        WHERE t.id_transaksi = $1
      `, [transaction_id]);
    })
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'failure',
          message: 'Transaction not found',
        });
      }

      // Organize the transaction and detail data
      const transactionDetails = {
        id_transaksi: result.rows[0].id_transaksi,
        tanggal_transaksi: result.rows[0].tanggal_transaksi,
        total_harga: result.rows[0].total_harga,
        piutang: result.rows[0].piutang,
        nama_customer: result.rows[0].nama_customer,
        no_telp_customer: result.rows[0].no_telp_customer,
        email_customer: result.rows[0].email_customer,
        items: result.rows.map(row => ({
          id_barang: row.id_barang,
          nama_barang: row.nama_barang,
          quantity: row.quantity,
          subtotal: row.subtotal
        }))
      };

      res.status(200).json({
        status: 'success',
        transaction: transactionDetails,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch transaction details: ' + err.message,
      });
    });
});

//fetch debt into popup
app.post('/debt-details', (req, res) => {
  const { servername, username, password, database, product_id } = req.body;

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
        FROM barang
        JOIN distributor ON barang.id_distributor = distributor.id_distributor
        where id_barang = $1 and hutang = true
      `, [product_id]);
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        products: result.rows[0], // Send the product data in the response
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

//fetch receivable into popup
app.post('/receivable-details', (req, res) => {
  const { servername, username, password, database, transaction_id } = req.body;

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
      // Query the database for transaction details
      return client.query(`
        SELECT 
          t.id_transaksi, t.tanggal_transaksi, t.total_harga, t.piutang,
          c.nama_customer, c.no_telp_customer, c.email_customer,
          dt.id_barang, dt.quantity, dt.subtotal, b.nama_barang
        FROM transaksi t
        JOIN customer c ON t.id_customer = c.id_customer
        JOIN detail_transaksi dt ON t.id_transaksi = dt.id_transaksi
        JOIN barang b ON dt.id_barang = b.id_barang
        WHERE t.id_transaksi = $1
      `, [transaction_id]);
    })
    .then((result) => {
      if (result.rows.length === 0) {
        return res.status(404).json({
          status: 'failure',
          message: 'Transaction not found',
        });
      }

      // Organize the transaction and detail data
      const transactionDetails = {
        id_transaksi: result.rows[0].id_transaksi,
        tanggal_transaksi: result.rows[0].tanggal_transaksi,
        total_harga: result.rows[0].total_harga,
        piutang: result.rows[0].piutang,
        nama_customer: result.rows[0].nama_customer,
        no_telp_customer: result.rows[0].no_telp_customer,
        email_customer: result.rows[0].email_customer,
        items: result.rows.map(row => ({
          id_barang: row.id_barang,
          nama_barang: row.nama_barang,
          quantity: row.quantity,
          subtotal: row.subtotal
        }))
      };

      res.status(200).json({
        status: 'success',
        transaction: transactionDetails,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch transaction details: ' + err.message,
      });
    });
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
