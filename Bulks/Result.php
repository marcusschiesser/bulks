<?php
namespace Bulks;
class Result
{
    const UNAUTHORIZED = "UNAUTHORIZED";
    const SERVER_ERROR = "SERVER_ERROR";
    const MISSING_ARGUMENTS = "MISSING_ARGUMENT";

    /** @var boolean */
    public $success; // either true if call successful or false otherwise
    /** @var array */
    public $errors; // array of error codes if success is false
    /** @var array */
    public $result; // an associative array with strings as keys that can be encoded as json

    public static function createSuccess($obj)
    {
        $result = new Result();
        $result->success = true;
        $result->result = $obj;
        $result->errors = array();
        return $result;
    }

    public static function createFailure($msg)
    {
        $result = new Result();
        $result->success = false;
        $errors = array();
        $errors[] =  $msg;
        $result->errors = $errors;
        if($msg!=self::UNAUTHORIZED) {
            $result->backtrace = debug_backtrace();
        }
        return $result;
    }

    public function getErrorMessage() {
        $ret = "";
        foreach ($this->errors as $error) {
            $ret = $ret . $error . ',';
        }
        return $ret;
    }
}

?>