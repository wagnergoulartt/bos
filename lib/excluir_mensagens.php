<?php
// Conectar ao banco de dados
$conn = new mysqli('localhost', 'phpmyadmin', 'erick91492832', 'painelbot');

// Verificar conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

// Limpar a tabela mensagens
$sql = "DELETE FROM mensagens";
if ($conn->query($sql) === TRUE) {
    echo "Mensagens zeradas com sucesso";
} else {
    echo "Erro ao excluir mensagens: " . $conn->error;
}

// Fechar conexão
$conn->close();
?>
