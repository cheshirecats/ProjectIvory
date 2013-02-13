<?php

function info_Log()
{
	return '<span class="aaa signup_now">Sign up</span> or <span class="aaa signin_now">sign in</span> first.';
}
function die_Log()
{
	die(info_Log());
}

function testName(&$name)
{
	if (!$name) die('Fill in username.');
	if (!preg_match("/^[a-zA-Z0-9_]+$/u",$name))
	{
		die('Username can only contain a-z, A-Z, 0-9 and underscore.'); 
	}
	if ((strlen($name) < 3) || (strlen($name) > 16))
	{
		die('Username length needs to be within [3, 16].');
	}
}
function testPass(&$pass)
{
	if (!$pass) die('Fill in password.');
	if ((strlen($pass) < 6) || (strlen($pass) > 255))
	{
		die('Password length needs to at least 6.');
	}
}
function testMail(&$mail)
{
	$mail = strtolower(trim($mail));
	if (!$mail) die('Fill in email.');
	if (strlen($mail) > 50)
	{
		die('Email cannot be longer than 50 letters.');
	}
	if (!filter_var($mail, FILTER_VALIDATE_EMAIL))
	{
		die('Email is invalid.');
	}
}
function testURL(&$url)
{
	$url = strtolower(trim($url));
	if (!$url) die('Fill in URL.');
	if (!filter_var($url, FILTER_VALIDATE_URL))
	{
		die('URL is invalid.');
	}
}

function xtestLogin(&$row, $user, $pass)
{
	if (!$user) die('Fill in username.');

	$is_guest = 0;
	$query = $GLOBALS['db']->prepare("SELECT * FROM users WHERE user_name LIKE ?");
	$query->execute(array($user));
	$row = $query->fetch(PDO::FETCH_ASSOC);
	if ($query->rowCount() > 0)
	{
		if ($row['user_level'] == -1) 
		{
			$is_guest = 1;
		}
		if ($row['user_level'] < -99)
		{
			die('Older accounts are temporarily disabled. Stay tuned.');
		}
	}
	if ($is_guest == 0)
	{
		if (!$pass) die('Fill in password.');
		
		$query = $GLOBALS['db']->prepare("SELECT * FROM users WHERE user_name LIKE ?");
		$query->execute(array($user));
		if ($query->rowCount() < 1) {
			die('Non-existent username. <a href="account.php?a=forgot" style="color:#999">Forgot account?</a>');
		}
		
		$query = $GLOBALS['db']->prepare("SELECT * FROM users WHERE ((user_name LIKE ?) AND (user_pass = UNHEX(?)))");
		$query->execute(array($user, hash('ripemd160', $pass."24humUfrAw".strtolower($user))));
		$row = $query->fetch(PDO::FETCH_ASSOC);
		if ($query->rowCount() < 1)
		{
			die('Incorrect password. <a href="account.php?a=forgot" style="color:#999">Forgot account?</a>');
		}
	}
}

function testLogin(&$row)
{
	xtestLogin($row, $_POST['user'], $_POST['pass']);
}

function xlogin($user, $pass, $die)
{
	xtestLogin($row, $user, $pass);
	$_SESSION['user_name'] = $row['user_name'];
	$_SESSION['user_id'] = $row['user_id'];
	$_SESSION['user_level'] = $row['user_level'];

	$query = $GLOBALS['db']->prepare("UPDATE users SET user_signin = NOW(), user_ip = '".$_SERVER["REMOTE_ADDR"]."' WHERE user_id = ?");
	$query->execute(array($row['user_id']));
	
	if ($die)	die('Success.');
}

function login()
{
	xlogin($_POST['user'], $_POST['pass'], true);
}
?>