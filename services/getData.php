<?php
session_start();
header('Content-type: application/json');
if(isset($_SESSION["csv"])) {
    echo json_encode($_SESSION["csv"]);
} else {
    echo "{}";
}