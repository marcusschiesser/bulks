<?php
header('Content-type: application/json');
include_once __DIR__ . '/../../bulks-config.php';
$actions = explode(',', BULKS_ACTIONS_NAME);
$actionObj = array_map(function($actionName) {
    return array('action' => $actionName, 'name' => $actionName);
}, $actions);
echo json_encode($actionObj);
http_response_code(200);

