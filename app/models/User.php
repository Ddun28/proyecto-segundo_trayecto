<?php
// models/User.php

class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // Método para crear un nuevo usuario
    public function create($name, $lastname, $ci, $rol, $password, $cargo) {
        // Hashear la contraseña
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        $sql = "INSERT INTO user (name, lastname, ci, rol, password, cargo) VALUES (:name, :lastname, :ci, :rol, :password, :cargo)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            'name' => $name,
            'lastname' => $lastname,
            'ci' => $ci,
            'rol' => $rol,
            'password' => $hashedPassword,
            'cargo' => $cargo
        ]);
        return $this->pdo->lastInsertId();
    }

    // Método para obtener todos los usuarios
    public function getAll() {
        $sql = "SELECT * FROM user";
        $stmt = $this->pdo->query($sql);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Método para obtener un usuario por ID
    public function getById($id) {
        $sql = "SELECT * FROM user WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Método para actualizar un usuario
    public function update($id, $name, $lastname, $ci, $rol, $cargo) {
        $sql = "UPDATE user SET name = :name, lastname = :lastname, ci = :ci, rol = :rol, cargo = :cargo WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'id' => $id,
            'name' => $name,
            'lastname' => $lastname,
            'ci' => $ci,
            'rol' => $rol,
            'cargo' => $cargo
        ]);
    }

    // Método para eliminar un usuario
    public function delete($id) {
        $sql = "DELETE FROM user WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute(['id' => $id]);
    }
}