/*

  inisialisasi

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

let client;

/*

  koneksi ke database

*/
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

  endpoint view

*/
//view produk
app.post('/products', (req, res) => {
    //request identitas database dari body flutter 
    const { servername, username, password, database } = req.body;

    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432,
    });
    
    //setelah terkoneksi dengan database, query data barang dari database
    client.connect()
      .then(() => {
        return client.query('SELECT * FROM barang');
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          products: result.rows,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch products: ' + err.message,
        });
    });
});

//view transaksi
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
          transactions: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch transactions: ' + err.message,
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

//view hutang
app.post('/debts', (req, res) => {
    //request identitas database dari body flutter untuk kunci masuk ke dalam database
    const { servername, username, password, database } = req.body;
  
    //inisialisasi koneksi
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432,
    });
    
    //jika terkoneksi
    client.connect()
      .then(() => {
        return client.query('SELECT * FROM barang WHERE hutang = TRUE'); 
      })
      .then((result) => {
        res.status(200).json({
          status: 'success',
          debts: result.rows,
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch debts: ' + err.message,
        });
      })
});

//view piutang
app.post('/receivables', (req, res) => {
  //request identitas database dari body flutter untuk kunci masuk ke dalam database
    const { servername, username, password, database } = req.body;
  
    //inisialisasi koneksi
    const client = new Client({
      host: servername,
      user: username,
      password: password,
      database: database,
      port: 5432,
    });
    
    //jika terkoneksi 
    client.connect()
      .then(() => {
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
          receivables: result.rows, // Send the product data in the response
        });
      })
      .catch((err) => {
        res.status(500).json({
          status: 'failure',
          message: 'Failed to fetch receivables: ' + err.message,
        });
      })
});

//view distributor
app.post('/distributors', (req, res) => {
  const { servername, username, password, database } = req.body;

  //inisialisasi koneksi
  const client = new Client({
    host: servername,
    user: username,
    password: password,
    database: database,
    port: 5432,
  });

  //jika terkoneksi
  client.connect()
    .then(() => {
      return client.query(`
          SELECT * 
          FROM distributor
        `);
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        distributors: result.rows, 
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch distributors: ' + err.message,
      });
    })
});

//view customers
app.post('/customers', (req, res) => {
  const { servername, username, password, database } = req.body;

  //inisialisasi koneksi
  const client = new Client({
    host: servername,
    user: username,
    password: password,
    database: database,
    port: 5432,
  });

  //jika terkoneksi
  client.connect()
    .then(() => {
      return client.query(`
          SELECT * 
          FROM customer
        `);
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        customers: result.rows, 
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch customers: ' + err.message,
      });
    })
});

/*

  endpoint fetch detail berdasarkan id

*/
//fetch admin
app.post('/admins', (req, res) => {
  const { servername, username, password, database, id_admin} = req.body;

  const client = new Client({
    host: servername,
    user: username,
    password: password,
    database: database,
    port: 5432
  });

  client.connect()
  .then(() => {
    return client.query('select * from admin where id_admin = $1', [id_admin]);
  })
  .then((result) => {
    if(result.rows.length === 0){
      return res.status(404).json({
        status: 'failure',
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      status: 'success',
      admins: result.rows[0]
    });
  })
  .catch((err) => {
    res.status(500).json({
      status: 'failure',
      message: 'Failed to fetch admin details: ' + err.message,
    });
  })
})

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
      return client.query(`SELECT * 
        FROM barang
        JOIN distributor ON barang.id_distributor = distributor.id_distributor
        where id_barang = $1`, [product_id]);
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
        transactions: transactionDetails,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch transaction details: ' + err.message,
      });
    });
});

//detail hutang
app.post('/debt-details', (req, res) => {
  //request identitas database beserta id produk agar kartu yang ditekan menunjukkan detail yang benar
  const { servername, username, password, database, product_id } = req.body;
  
  //inisialisasi koneksi
  const client = new Client({
    host: servername,
    user: username,
    password: password,
    database: database,
    port: 5432,
  });

  //jika terkoneksi
  client.connect()
    .then(() => {
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
});

//detail piutang
app.post('/receivable-details', (req, res) => {
    //request identitas database beserta id produk agar kartu yang ditekan menunjukkan detail yang benar
  const { servername, username, password, database, transaction_id } = req.body;

    //inisialisasi koneksi
  const client = new Client({
    host: servername,
    user: username,
    password: password,
    database: database,
    port: 5432,
  });

  client.connect()
    .then(() => {
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
        transactions: transactionDetails,
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch transaction details: ' + err.message,
      });
    });
});

//fetch detail distributor
app.post('/distributor-details', (req, res) => {
  const { servername, username, password, database, distributor_id} = req.body;

  const client = new Client({
    host: servername,
    user: username,
    password: String(password),
    database: database,
    port: 5432,
  });

  //jika terkoneksi
  client.connect()
    .then(() => {
      return client.query(`
        SELECT * FROM distributor WHERE id_distributor = $1
      `, [distributor_id]);
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        distributors: result.rows[0],
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to fetch distributors: ' + err.message,
      });
    })
});

//fetch detail customer
app.post('/customer-details', (req, res) => {
  const{servername, username, password, database, customer_id} = req.body;

  //inisialisasi koneksi
  const client = new Client ({
    host : servername,
    user : username,
    password : password,
    database : database,
    port : 5432
  })

  //jika terkoneksi
  client.connect()
  .then(() => {
    return client.query(`select * from customer where id_customer = $1`, [customer_id])
  })
  .then((result) => {
    res.status(200).json({
      status : 'success',
      customers : result.rows[0],
    })
  })
  .catch((err) => {
    res.status(500).json({
      status : 'failure',
      message : 'Failed to fetch customers: ' + err.message,
    })
  })
})

/*

  endpoint add

*/

//tambah barang baru
app.post('/new-product', (req, res) => {
  const { servername, username, password, database, nama_barang, harga_beli, harga_jual, stok, hutang, id_distributor } = req.body;

  // Use the provided credentials to connect to the database
  const client = new Client({
    host: servername,
    user: username,
    password: String(password),
    database: database,
    port: 5432, // PostgreSQL default port
  });

  client.connect()
    .then(() => {
      return client.query(`
        INSERT INTO barang (nama_barang, harga_beli, harga_jual, stok, hutang, id_distributor)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [nama_barang, harga_beli, harga_jual, stok, hutang, id_distributor]); // Added distributor_id
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
        message: 'Failed to add product: ' + err.message,
      });
    })
});

//tambah distributor baru
app.post('/new-distributor', (req, res) => {
  const { servername, username, password, database, nama_distributor, no_telp_distributor, email_distributor, link_ecommerce } = req.body;

  const client = new Client({
    host: servername,
    user: username,
    password: String(password),
    database: database,
    port: 5432,
  });

  client.connect()
    .then(() => {
      return client.query(`
        INSERT INTO distributor (nama_distributor, no_telp_distributor, email_distributor, link_ecommerce)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [nama_distributor, no_telp_distributor, email_distributor, link_ecommerce]); 
    })
    .then((result) => {
      res.status(200).json({
        status: 'success',
        distributors: result.rows[0],
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'failure',
        message: 'Failed to add distributor: ' + err.message,
      });
    })
});

/*

  endpoint edit

*/
app.post('/edit-pin', async (req, res) => {
  const { servername, username, password, database, id_admin, new_pin } = req.body;

  const client = new Client({
    host: servername,
    user: username,
    password: String(password),
    database: database,
    port: 5432
  });

  try {
    await client.connect();  // Menggunakan async/await untuk penanganan koneksi yang lebih baik

    // Menggunakan crypt untuk hashing PIN sebelum disimpan
    await client.query(
      `UPDATE admin SET pin = crypt($1, gen_salt('bf')) WHERE id_admin = $2`,
      [new_pin, id_admin]
    );

    res.status(200).json({
      status: 'success',
      message: 'Pin successfully updated'
    });

  } catch (err) {
    res.status(500).json({
      status: 'failure',
      message: 'Failed to edit pin: ' + err.message,
    });

  } finally {
    await client.end();  // Pastikan koneksi selalu ditutup
  }
});

/*

  endpoint delete

*/

//to do delete here

/*

  endpoint verify

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

/*

  endpoint logout

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

  ednpoint misc

*/
//memulai server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
