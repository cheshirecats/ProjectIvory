<?php 
	$IS_ACC_PHP = true;
	$SHALL_LOG_OFF = ($_GET["a"] == 'logoff');
	require_once 'header.php';
?>
<style>html { background-image: url('') }</style>
<div id="wrap">
<div style="width:100%;background:#fff;padding:10% 0 0 10%;">
	<div><a href="index.php" style="cursor:pointer"><img src="title.png" style="margin-bottom:32px;margin-left:-1px;" alt="Project Ivory"/></a></div>
	<div id="login_form">
		<?php 
		if (($_GET["a"] != 'login') && ($_GET["a"] != 'icon') && ($_GET["a"] != 'reset'))
		{
			echo '<div style="height:16px"></div>';
		}
		if ($_GET["a"] == 'login')
		{
			echo '<div style="margin-bottom:38px;font-size:16px;color:#ccc"><span id="login_signup" class="hover" style="padding:20px 0;">sign up?</span></div>';
			echo '<input type="text" id="login_user" placeholder="username" />';
			echo '<input type="password" id="login_pass" placeholder="password" />';
			echo '<span class="button" id="login_button">sign in</span>';
		}
		else if ($_GET["a"] == 'register')
		{
			echo '<input type="text" id="login_user" placeholder="username" />';
			echo '<input type="text" id="login_email" placeholder="email" />';
			echo '<div style="height:9px"></div>';
			echo '<input type="password" id="login_pass" placeholder="password" />';
			echo '<input type="password" id="login_pass_again" placeholder="password (repeat)" />';
			echo '<span class="button" id="login_button">sign up</span>';
		}
		else if ($_GET["a"] == 'change')
		{
			echo '<input type="text" id="login_user" placeholder="old username" value="'
			.((isset($_SESSION['user_name'])) ? $_SESSION['user_name'] : '')
			.'"/>';
			echo '<input type="password" id="login_pass" placeholder="old password" />';
			echo '<div style="height:9px"></div>';
			//echo '<input type="text" id="new_user" placeholder="new username" />';		
			echo '<input type="password" id="new_pass" placeholder="new password" />';
			echo '<input type="password" id="new_pass_again" placeholder="new password (repeat)" />';
			echo '<span class="button" id="login_button">change</span>';
		}
		else if ($_GET["a"] == 'email')
		{
			echo '<input type="text" id="login_user" placeholder="username" value="'
			.((isset($_SESSION['user_name'])) ? $_SESSION['user_name'] : '')
			.'"/>';
			echo '<input type="password" id="login_pass" placeholder="password" />';
			echo '<div style="height:9px"></div>';
			echo '<input type="text" id="new_email" placeholder="new email" />';
			echo '<input type="text" id="new_email_again" placeholder="new email (repeat)" />';
			echo '<span class="button" id="login_button">change</span>';
		}
		else if ($_GET["a"] == 'icon')
		{
			echo '<div style="margin-bottom:30px;margin-left:1px;margin-top:-6px;font-size:16px;">Make your icon a 64x64 PNG, with no transparency.</div>';
			echo '<form style="position:relative" enctype="multipart/form-data" target="upload_dummy" action="upload_icon.php" method="POST">';
			echo '<input name="user" type="text" placeholder="username" value="'.((isset($_SESSION['user_name'])) ? $_SESSION['user_name'] : '').'"/>';
			echo '<input name="pass" type="password"  placeholder="password" />';
			echo '<input name="file" type="file" style="width:380px;display:block;margin-top:20px;border:0px;"/><input id="upload_button" type="submit" value="Proceed" /></form>';
			echo '<iframe name="upload_dummy" id="upload_dummy" style="border:0;width:400px;margin-top:16px;margin-left:-8px;"></iframe>';
		}
		else if ($_GET["a"] == 'forgot')
		{
			echo '<input type="text" id="login_email" placeholder="email" />';
			echo '<span class="button" id="login_button">Proceed</span>';
		}
		else if ($_GET["a"] == 'reset')
		{
			echo '<div style="margin-bottom:38px;margin-left:1px;font-size:16px">Reseting password for account : '.$_GET["c"].'</div>';
			echo '<input type="password" id="new_pass" placeholder="new password" />';
			echo '<input type="password" id="new_pass_again" placeholder="new password (repeat)" />';
			echo '<span class="button" id="login_button">proceed</span>';
		}
		?>
	</div>
	<div style="margin:36px 0px 0px 1px;font-size:14px" id="message"></div>
</div>
<div style="height:1px;background-color:#fff;"></div>
</div>
<?php
	require_once 'footer.php'; 
?>