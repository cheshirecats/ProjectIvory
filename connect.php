<?php
error_reporting(E_ALL);
if (!isset($NO_NEED_FOR_SESSION))
{
	session_name('cwSession'); session_set_cookie_params(10*365*24*60*60); session_start();
}

$GLOBALS['mcache'] = '';

if (class_exists('Memcached')) 
{
	$mcache = new Memcached();
	$mcache->addServer('localhost', 11211);
}

$GLOBALS['db'] = '';

function connect_db() {
	$db_host		= 'localhost';
	$db_user		= 'curiousw_admin';
	$db_pass		= '???????????????';
	$db_name		= 'curiousw_db';

	$GLOBALS['db'] = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass
		, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
}

connect_db();

?>