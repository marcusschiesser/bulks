<?php

session_start();
session_unset();

if (isset($_FILES['userfile']) && is_uploaded_file($_FILES['userfile']['tmp_name'])) {
    $file_handle = fopen($_FILES['userfile']['tmp_name'], "r");
    $count = 0;
    $headers = array();
    while (!feof($file_handle)) {
        $row = fgetcsv($file_handle, 0, ';', '"');
        if (is_array($row)) {
            if($count == 0) {
                $headers = $row;
            } else {
                $object = array();
                foreach ($row as $i=>$value)
                {
                    $key = $headers[$i];
                    $object[$key] = $value;
                }
                $_SESSION["csv"][] = $object;
            }
            $count++;
        }
    }
    fclose($file_handle);
    echo "{success: true}";
} else {
    echo "{success: false}";
}

?>