<?php
	namespace Bulks;

    require_once __DIR__ . '/../Bulks/Action.php';
	require_once __DIR__ . '/../Bulks/Result.php';
    require_once __DIR__ . '/../Bulks/ActionInvoker.php';

    include_once __DIR__ . '/../../bulks-config.php';

	$action = $_REQUEST['action'];
	$params = array();
	foreach ($_GET as $key=>$value) {
		if ($key != 'action') {
			$params[$key] = $value;
		}
	}

    ActionInvoker::setActionsPath(BULKS_ACTIONS_PATH);
    $ret = ActionInvoker::invoke($action, $params);

    header('Content-Type: application/json');
	echo json_encode($ret);
    http_response_code(200);
?>