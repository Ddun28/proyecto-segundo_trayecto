<?php
// controllers/UserController.php

require_once '../../models/User.php';

class UserController {
    private $userModel;

    public function __construct($pdo) {
        $this->userModel = new User($pdo);
    }

    // Método para crear un nuevo usuario
    public function createUser ($name, $lastname, $ci, $rol, $password) {
        return $this->userModel->create($name, $lastname, $ci, $rol, $password);
    }

    // Método para obtener todos los usuarios
    public function getAllUsers() {
        return $this->userModel->getAll();
    }

    // Método para obtener un usuario por ID
    public function getUserById($id) {
        return $this->userModel->getById($id);
    }

    // Método para actualizar un usuario
    public function updateUser ($id, $name, $lastname, $ci, $rol) {
        return $this->userModel->update($id, $name, $lastname, $ci, $rol);
    }

    // Método para eliminar un usuario
    public function deleteUser ($id) {
        return $this->userModel->delete($id);
    }
}