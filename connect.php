<?php

if (!isset($NO_NEED_FOR_SESSION))
{
	session_name('cwSession'); session_set_cookie_params(10*365*24*60*60); session_start();
}

if (!isset($GLOBALS['mcache'])) {
	if (class_exists('Memcached')) 
	{
		$mcache = new Memcached();
		$mcache->addServer('localhost', 11211);
	}
	else if (class_exists('memcache')) 
	{
		$mcache = new memcache();
		$mcache->addServer('localhost', 11211);
	}
}

if (!isset($GLOBALS['db'])) {
	function connect_db() {
		$db_host		= 'localhost';
		$db_user		= 'curiousw_admin';
		$db_pass		= '123456';
		$db_name		= 'curiousw_db';

		$GLOBALS['db'] = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass
			, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
	}
	connect_db();
}

?>
