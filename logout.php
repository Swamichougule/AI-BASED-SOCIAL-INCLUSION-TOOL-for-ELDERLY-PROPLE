<?php
session_start();
session_destroy();
echo "<script>
    alert('Logged out successfully!');
    window.location.href = 'http://localhost/Login_system/login.php';
</script>";
exit;
?>
