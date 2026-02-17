<?php
session_start();
include('db.php');

// Check if the user is logged in
if (!isset($_SESSION['email'])) {
    echo "<script>
        alert('Please log in first!');
        window.location.href = 'http://localhost/Login_system/login.php';
    </script>";
    exit;
}

$email = $_SESSION['email'];
$name = $_SESSION['name'];
?>

<!DOCTYPE html>
<html>
<head>
    <title>User Profile</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }

        .profile-container {
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 300px;
        }

        h2 {
            color: #333;
        }

        p {
            margin: 8px 0;
            color: #555;
        }

        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
        }

        button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="profile-container">
        <h2>Welcome, <?php echo htmlspecialchars($name); ?>!</h2>
        <p>Email: <?php echo htmlspecialchars($email); ?></p>
        <button onclick="window.location.href='logout.php'">Logout</button>
    </div>
</body>
</html>
