<?php
require_once "IcaApi.php";

header("Access-Control-Allow-Origin: *");
header("Access-Control-Request-Method: POST, GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: accept, content-type, api, api-key");

$headers = getallheaders();
$class = $headers['api'];

/** @var mixed $class */
new $class;

abstract class RestApi {
	private $headers;
	private $method;
	private $params;

	public function __construct() {
		$this->headers = getallheaders();
		$this->method = substr($_SERVER['PATH_INFO'], 1);
		$this->checkMethod();
		$this->mapParams();
		$return_value = call_user_func_array(array($this, $this->method), $this->params);
		echo json_encode($return_value);
	}

	private function mapParams() {
		$this->params = array();
		switch ($_SERVER['REQUEST_METHOD']) {
			case 'GET':
				$reflectionMethod = new \ReflectionMethod($this, $this->method);
				$paramsMap = array();
				foreach($reflectionMethod->getParameters() as $methodParam) {
					$paramsMap[$methodParam->getName()] = $methodParam->getPosition();
					$this->params[] = null;
				}

				foreach($_REQUEST as $requestParam => $requestValue) {
					if (array_key_exists($requestParam, $paramsMap)) {
						$this->params[$paramsMap[$requestParam]] = $requestValue;
					}
				}

				break;
			case 'POST':
			case 'PUT':
				$input = file_get_contents('php://input');
				if (strlen($input) > 0) {
					$this->params[] = json_decode($input);
				}
				break;
			default:
				throw new Exception("Falsche Methode" . $_SERVER['REQUEST_METHOD']);
		}
	}

	private function checkMethod() {
		if (!array_key_exists('PATH_INFO', $_SERVER)) {
			$this->returnError(400, 'invalid request');
		}
		$this->method = substr($_SERVER['PATH_INFO'], 1);
		if (!method_exists($this, $this->method)) {
			$this->returnError(400, 'invalid request');
		}
	}

	protected function returnError($code, $msg) {
		http_response_code($code);
		if (is_scalar($msg)) {
			echo $msg;
		} else {
			echo json_encode($msg);
		}
		exit();
	}
}