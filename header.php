<?php
	require_once 'connect.php';
	require_once 'account_func.php';
	
	if (isset($SHALL_LOG_OFF)) if ($SHALL_LOG_OFF)
	{
		$_SESSION = array(); setcookie(session_name(), '', time() - 3600); session_destroy(); $SHALL_LOG_OFF = false;
		header('location: index.php');
	}
	if (!isset($IS_ACC_PHP))
	{
		if (!isset($_SESSION['user_id']))
		{
			xlogin('guest', '123456', false);
		}
		else if ($_SESSION['user_id'] <= 0)
		{
			xlogin('guest', '123456', false);
			header('location: index.php');
		}
	}
	header('content-type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<!-- Welcome to the real world, Neo. -->
<html>
<head>
	<meta charset="UTF-8">
	<title>Project Ivory</title>
	<meta name="description" content="Project Ivory is a minimal forum with TeX and Code support."/>
	<meta name="viewport" content="maximum-scale=1"/>
	<link type="image/x-icon" href="favicon.ico" rel="icon" />
	<link rel="stylesheet" type="text/css" href="style.css" />
	<link rel="stylesheet" type="text/css" href="font-awesome.css" />
	<link rel="stylesheet" type="text/css" href="prettify.css"/>
	<style id="css_a"></style>
	<style id="css_0"></style>
	<style id="css_1">.title p, .item p, textarea, #mid_preview{line-height:1.6}</style>
	<style id="css_2"></style>
	<style id="css_3"></style>
</head>
<body><div id="fb-root"></div>
<noscript>
	<style type="text/css">#wrap{display:none}</style>
	<div style="margin:100px;font-size:20px;">Please turn on JavaScript support as the site is completely AJAX + WebSocket.</div>
</noscript>
<div id="bad_ie" style="display:none; margin:100px;">Your browser does not have window.WebSocket object.
<br /><br />Try the lastest version of <a href='//www.gooogle.com/chrome' class='aaa' target="_blank">Chrome</a> or <a href='//www.mozilla.org/en-US/firefox/new' class='aaa' target="_blank">Firefox</a> or <a href='//www.apple.com/safari' class='aaa' target="_blank">Safari</a>.
</div>