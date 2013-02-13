<?php
	require_once 'connect.php';
	require_once 'account_func.php';
	if ($_FILES['file']['error'] > 0)	echo('Upload error code '.$_FILES['file']['error'].'.'); else {
	$ext = array('jpg', 'jpeg', 'gif', 'png');
	$type = array('image/gif', 'image/jpeg', 'image/pjpeg', 'image/png');
	$extension = end(explode('.', $_FILES['file']['name']));
	if (!in_array($extension, $ext)) echo('Invalid image extension.'); else {
	if ($_FILES['file']['size'] > 200000) echo('Image is too large.'); else {
	if (!in_array($_FILES['file']['type'], $type)) echo('Invalid image type.'); else {
		
	testLogin($row);
	if ($row['user_level'] == -1) die_Log();
	
	if ($_FILES['file']['type'] == 'image/gif')
		$img = imagecreatefromgif($_FILES['file']['tmp_name']);
	else if ($_FILES['file']['type'] == 'image/png')
		$img = imagecreatefrompng($_FILES['file']['tmp_name']);
	else
		$img = imagecreatefromjpeg($_FILES['file']['tmp_name']);
	
	$ww = imagesx($img); $hh = imagesy($img); $mm = min($ww, $hh);
	if (max($ww, $hh) > 2000) { echo('Image is too large.'); ImageDestroy($img); } else {
	
	$thumb = imagecreatetruecolor(64, 64);
	imagecopyresampled($thumb, $img, 0, 0, ($ww-$mm)/2, ($hh-$mm)/2, 64, 64, $mm, $mm);
	imagepng($thumb, 'icon/'.$row['user_id']."_64.png", 9); ImageDestroy($thumb);
	
	$thumb = imagecreatetruecolor(32, 32);
	imagecopyresampled($thumb, $img, 0, 0, ($ww-$mm)/2, ($hh-$mm)/2, 32, 32, $mm, $mm);
	imagepng($thumb, 'icon/'.$row['user_id']."_32.png", 9); ImageDestroy($thumb);
	
	ImageDestroy($img);
	echo('Success. You can close this window now.');
	}}}}}
?>