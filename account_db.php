<?php
header('content-type: text/html; charset=utf-8');
require_once 'connect.php';
require_once 'account_func.php';

if ($_POST['a'] == 'forgot')
{
	testMail($_POST['mail']);
	
	$query = $GLOBALS['db']->prepare("SELECT user_name, user_pass FROM users WHERE user_email LIKE ?");
	$query->execute(array($_POST['mail']));
	if ($query->rowCount() > 0)
	{
		$row = $query->fetch(PDO::FETCH_ASSOC);
		$head = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=ISO-8859-1\r\n";
		$hasx = hash('ripemd160', 'xpfmrhsjfyusl'.$row['user_name'].$row['user_pass']);
		$urx = 'http://qivory.com/account.php?a=reset&b='.$hasx.'&c='.$row['user_name'];
		mail($_POST['mail'], 'Project Ivory : reseting password',
			'<br />If you have requested to reset the password for your account <b>'.$row['user_name'].'</b> : <br /><br /><a href="'.$urx.'">click this link</a> ( '.$urx." ).<br /><br />Regards,<br />Project Ivory",
			$head);
		die('Email sent. Click the link in mail to reset password.');
	}
	die('Email is not used by any accounts.');
} 

$_POST['user'] = trim($_POST['user']);
$pass_salt = "???????????".strtolower($_POST['user']);

if ($_POST['a'] == 'reset')
{
	$_POST['user'] = trim($_POST['user']);
	$_POST['new_pass'] = trim($_POST['new_pass']);
	testName($_POST['user']);
	testPass($_POST['new_pass']);
	$query = $GLOBALS['db']->prepare("SELECT user_name, user_pass FROM users WHERE user_name LIKE ?");
	$query->execute(array($_POST['user']));
	if ($query->rowCount() > 0)
	{
		$row = $query->fetch(PDO::FETCH_ASSOC);
		$hasx = hash('ripemd160', 'xpfmrhsjfyusl'.$row['user_name'].$row['user_pass']);
		if ($hasx == $_POST['magic']) {
			$query = $GLOBALS['db']->prepare("UPDATE users SET user_pass = UNHEX(?) WHERE user_name LIKE ?");
			$query->execute(array(hash('ripemd160', $_POST['new_pass'].$pass_salt), $_POST['user']));
			die('Success.');
		}
	}
	die('Hello');
}

$_POST['pass'] = trim($_POST['pass']);


if ($_POST['a'] == 'login')
{
	login();
}
else if ($_POST['a'] == 'register') 
{
	testName($_POST['user']);
	testPass($_POST['pass']);
	testMail($_POST['mail']);
	
	$query = $GLOBALS['db']->prepare("SELECT user_id FROM users WHERE user_name LIKE ?");
	$query->execute(array($_POST['user']));
	if ($query->rowCount() > 0)
	{
		die('Username is already taken.');
	}
	
	$query = $GLOBALS['db']->prepare("SELECT user_id FROM users WHERE user_email LIKE ?");
	$query->execute(array($_POST['mail']));
	if ($query->rowCount() > 0)
	{
		die('Email is already taken.');
	}
	
	$new_pass = $_POST['pass'];

	$query = $GLOBALS['db']->prepare("INSERT INTO users(user_name,user_pass,user_email,user_date) VALUES(?,UNHEX(?),?,NOW())");
	$query->execute(array($_POST['user'], hash('ripemd160', $new_pass.$pass_salt), $_POST['mail']));
	if ($query->rowCount() < 1)
	{
		die('Username is already taken.');
	}
	
	login($db);
}
else if ($_POST['a'] == 'change') 
{
	testLogin($row);	
	if ($row['user_level'] == -1) die_Log();
	/*
	testName($_POST['new_user']);
	$query = $GLOBALS['db']->prepare("SELECT user_id FROM users WHERE user_name LIKE ?");
	$query->execute(array($_POST['new_user']));
	if ($query->rowCount() > 0)
	{
		die('Username is already taken.');
	} */	
	$_POST['new_pass'] = trim($_POST['new_pass']);
	testPass($_POST['new_pass']);
	
	/* $pass_salt = "24humUfrAw".strtolower($_POST['new_user']);
	$query = $GLOBALS['db']->prepare("UPDATE users SET user_name LIKE ?, user_pass = UNHEX(?) WHERE user_id = ?");
	$query->execute(array($_POST['new_user'], hash('ripemd160', $_POST['new_pass'].$pass_salt), $row['user_id']));
	$_SESSION['user_name'] = $new_user; */
	
	$query = $GLOBALS['db']->prepare("UPDATE users SET user_pass = UNHEX(?) WHERE user_id = ?");
	$query->execute(array(hash('ripemd160', $_POST['new_pass'].$pass_salt), $row['user_id']));
	
	die('Success.');
}
else if ($_POST['a'] == 'email')
{
	testLogin($row);
	if ($row['user_level'] == -1) die_Log();
	
	testMail($_POST['mail']);
	$query = $GLOBALS['db']->prepare("SELECT user_id FROM users WHERE user_email LIKE ?");
	$query->execute(array($_POST['mail']));
	if ($query->rowCount() > 0)
	{
		die('Email is already taken.');
	}
	
	$query = $GLOBALS['db']->prepare("UPDATE users SET user_email = ? WHERE user_id = ?");
	$query->execute(array($_POST['mail'], $row['user_id']));
	
	die('Success.');
}
?>
