<?php
require '../../../config/database.php';

header('Content-Type: application/json'); // Asegúrate de que la respuesta sea JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $ci = $_POST['ci'];
    $password = $_POST['password'];

    // Validar los datos
    if (empty($ci) || empty($password)) {
        echo json_encode(['error' => 'Cédula y contraseña son obligatorios.']);
        exit;
    }

    // Consultar la base de datos para verificar las credenciales
    $stmt = $pdo->prepare("SELECT * FROM user WHERE ci = :ci");
    $stmt->execute(['ci' => $ci]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Generar un token (puedes usar JWT o cualquier otro método)
        $token = bin2hex(random_bytes(16)); // Ejemplo simple de token

        // Aquí podrías guardar el token en la base de datos si es necesario

        // Devolver el token como respuesta
        echo json_encode(['token' => $token]);
    } else {
        echo json_encode(['error' => 'Credenciales incorrectas.']);
    }
} else {
    echo json_encode(['error' => 'Método no permitido.']);
}