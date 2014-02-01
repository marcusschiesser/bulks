<?php

namespace Bulks;

require_once __DIR__ . '/Result.php';

class ActionInvoker
{
    private static $actionsPath;

    public static function setActionsPath($path) {
        self::$actionsPath = $path;
    }

    public static function invoke($action, $params)
    {
        if (preg_match("/^[a-zA-Z]+(Action|Process)$/", $action)) {
            require_once self::$actionsPath . $action . '.php';
            $fullClassName = BULKS_ACTIONS_NAMESPACE. '\\' . $action;
            $inst = new $fullClassName;
        }

        if (isset($inst)) {
            $ret = $inst->execute($params);
        } else {
            $ret = Result::createFailure(Result::SERVER_ERROR);
        }

        return $ret;
    }


    public static function bulkInvoke($actionName, $paramNames, $data)
    {
        $result = array();

        foreach($data as $row) {
            set_time_limit(20);
            $params = array_combine($paramNames, $row);
            $ret = self::invoke($actionName, $params);
            if($ret->success) {
                $row[] = json_encode($ret->result);
            } else {
                $row[] = $ret->getErrorMessage();
            }
            $result[] = $row;
        }

        return $result;
    }
}