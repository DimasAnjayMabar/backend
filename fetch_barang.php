<?php
// Allow access from any origin (you can specify a specific origin if needed)
header("Access-Control-Allow-Origin: *");

// Allow specific methods (GET, POST, etc.)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Allow specific headers in the request (you can specify more if needed)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight requests (browser sends OPTIONS request before actual request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Return a 200 status code for OPTIONS request
    http_response_code(200);
    exit();
}

session_start();  // Start the session to access session variables

// Check if the session variables are set
if (isset($_SESSION['servername']) && isset($_SESSION['username']) && isset($_SESSION['password']) && isset($_SESSION['database'])) {
    $servername = $_SESSION['servername'];
    $username = $_SESSION['username'];
    $password = $_SESSION['password'];
    $database = $_SESSION['database'];

    try {
        // Create the connection string for PostgreSQL
        $conn = new PDO("pgsql:host=$servername;dbname=$database", $username, $password);
        
        // Set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Fetch data or perform other actions with the database
        $stmt = $conn->query("SELECT nama_barang, harga_jual FROM barang");
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['success' => true, 'data' => $data]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Missing session variables.']);
}
?>
