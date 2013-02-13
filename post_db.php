<?php
header('content-type: text/html; charset=utf-8');
require_once 'connect.php';
require_once 'post_func.php';
require_once 'account_func.php';

if (!isset($_SESSION['user_id'])) $_SESSION['user_id'] = -1;

if ($_POST['a'] == 'ge0')
{
	if ($GLOBALS['mcache'] == '') {
		post_get('', '', '', 30, '', 0, -1, -1); die();
	}
	$threads_list = $GLOBALS['mcache']->get('pivory.threads.list');
	if ($threads_list == '') {
		ob_start();
		post_get('', '', '', 30, '', 0, -1, -1);
		$threads_list = ob_get_contents();
		ob_end_clean();
		$GLOBALS['mcache']->set('pivory.threads.list', $threads_list);
	}
	echo $threads_list; die();
}
else if ($_POST['a'] == 'get')
{
	if (!isset($_POST['n'])) $_POST['n'] = '';
	if (!isset($_POST['begin'])) $_POST['begin'] = '';
	
	$tmp = explode('_', $_POST['n']);
	$_POST['n'] = $tmp[0]; 
	if (isset($tmp[1])) $user = $tmp[1]; else $user = '';

	$type = '';
	$topic = '';
	if (empty($_POST['n']))
	{
		$type = '';
		$topic = '';
	}
	else if (is_numeric($_POST['n'])) 
	{
		$type = '';
		$topic = $_POST['n'];
	}
	else
	{
		$type = substr($_POST['n'], 0, 1);
		$xdetail = substr($_POST['n'], 1);
		if (($type == 'a') || ($type == 'b') || ($type == 'c') || ($type == 't'))
		{
			$topic = $xdetail;
		}
		else if (is_numeric($xdetail) || (empty($xdetail)))
		{
			$topic = $xdetail;
		}
		else
		{
			die();
		}
	}
	/*$limit = 10;
	if (($type == 'u') && (is_numeric($topic)))
		$limit = 10;
	else if (($type == '') && (is_numeric($topic)))
		$limit = 10;
	else
		$limit = 10;*/
	$limit = 30;
	if (!empty($_POST['limit'])) $limit = min($limit, $_POST['limit']);
	if ((empty($_POST['begin']) || is_numeric($_POST['begin'])))
	{
		if (isset($_POST['r'])) $anchor = isset($_POST['r']); else $anchor = 0;
		post_get($type, $topic, $_POST['begin'], $limit, $user, $anchor, $_SESSION['user_id'], $_SESSION['user_level']); die();
	}
}
else if (($_POST['a'] == 'qrx') && is_numeric($_POST['n']))
{
	$query = $db->query("SELECT post_text FROM posts WHERE post_id = ".$_POST['n']);
	if ($query->rowCount() == 1)
	{
		$row = $query->fetch(PDO::FETCH_ASSOC);
		die($row['post_text']);
	}
	die();
}
else if (($_POST['a'] == 'xou') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	if ($_SESSION['user_id'] == 1)
	{
		$_POST['text'] = mynl2br($_POST['text']);
	}
	else
	{
		$mm = verifyText($_POST['text']);
		if ($mm != '') die($mm);
		$_POST['text'] = mynl2br(htmlspecialchars($_POST['text']));
	}
	if ($_POST['n'] > 0)
	{ // admin editing could be dangerous, cause may active XSS !!!
		/*if ($_SESSION['user_id'] == 1)
			$query = $db->prepare("UPDATE posts SET post_text = ?, post_edit = NOW() WHERE post_id = ".$_POST['n']);
		else*/
			$query = $db->prepare("UPDATE posts SET post_text = ?, post_edit = NOW() WHERE post_id = ".$_POST['n']." AND post_by = ".$_SESSION['user_id']);
	}
	else
	{
		/*if ($_SESSION['user_id'] == 1)
			$query = $db->prepare("UPDATE topics SET topic_title = ? WHERE topic_id = ".(-$_POST['n']));
		else*/
			$query = $db->prepare("UPDATE topics SET topic_title = ? WHERE topic_id = ".(-$_POST['n'])." AND topic_by = ".$_SESSION['user_id']);
	}
	$query->execute(array($_POST['text']));
	if ($query->rowCount() < 1)
	{
		die('Access denied or not modified. However "EDIT" can be used for reading source codes of posts.'); 
	}
	die('SUCCESS'.$_POST['text']);
}
else if (($_POST['a'] == 'xfo') && is_numeric($_POST['n']))
{
	$targ = abs($_POST['n']);
	$sign = ($_POST['n'] > 0) ? (1) : (-1);
	if ($sign == 1)
	{
		$query = $db->query("INSERT INTO follow(follow_a, follow_b) VALUES(".$_SESSION['user_id'].",$targ)");
	}
	else
	{
		$query = $db->query("DELETE FROM follow WHERE (follow_a = ".$_SESSION['user_id']." AND follow_b = $targ)");
	}
	if ($query->rowCount() > 0) // only change if really changed
	{
		$db->query("UPDATE users SET user_following = user_following + ($sign) WHERE user_id = ".$_SESSION['user_id'].";".
			"UPDATE users SET user_followers = user_followers + ($sign) WHERE user_id = $targ");
		$query = $db->query("SELECT user_followers FROM users WHERE user_id = $targ");
		$row = $query->fetch(PDO::FETCH_ASSOC);
		die($row['user_followers']);
	}
}
else if ($_POST['a'] == 'xta')
{
	$xa = $_SESSION['user_id'];
	$xb = substr($_POST['n'], 0, strpos($_POST['n'], '_'));
	$xc = substr($_POST['n'], strpos($_POST['n'], '_') + 1);
	if ((!is_numeric($xa)) || (!is_numeric($xb)) || (!is_numeric($xc))) die('-1');
	if ($xc > 0)
	{
		$query = $db->query("INSERT INTO list2top (id_by, id_topic, id_list) VALUES($xa, $xb, $xc)");
		if ($query->rowCount() > 0)
		{
			$db->query("UPDATE lists SET list_cnt = list_cnt + 1 WHERE list_id = $xc"
				.";UPDATE lists SET list_date = NOW() WHERE list_id = $xc");
			die('1');
		}
	}
	else
	{
		$xc = -$xc;
		$query = $db->query("DELETE FROM list2top WHERE (id_by = $xa AND id_topic = $xb AND id_list = $xc)");
		if ($query->rowCount() > 0)
		{
			$db->query("UPDATE lists SET list_cnt = list_cnt - 1 WHERE list_id = $xc");
			die('1');
		}
	}
	die('0');
}
else if (($_POST['a'] == 'xxl') || ($_POST['a'] == 'xxe') || ($_POST['a'] == 'xxm') || ($_POST['a'] == 'xxh'))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	$_POST['title'] = htmlspecialchars($_POST['title']);
	$ll = ($_POST['a'] == 'xxh') ? (100) : (50);
	$_POST['title'] = substr(trim(strtr($_POST['title'], '^', ' ')), 0, $ll);
	$tt = 'user_location';
	if ($_POST['a'] == 'xxe') $tt = 'user_education';
	else if ($_POST['a'] == 'xxm') $tt = 'user_major';
	else if ($_POST['a'] == 'xxh') $tt = 'user_hobby';
	$query = $db->prepare('UPDATE users SET '.$tt.' = ? WHERE user_id ='.$_SESSION['user_id']);
	$query->execute(array($_POST['title']));
	die($_POST['title']);
}
else if (($_POST['a'] == 'q01') && is_numeric($_POST['n']) && is_numeric($_POST['begin']))
{
	if ($_POST['begin'] > 0)
		$query = $db->query('SELECT post_id FROM posts WHERE post_topic = '.$_POST['n'].' AND post_by = '.$_POST['begin']
			.' ORDER BY post_date DESC LIMIT 1');
	else
		$query = $db->query('SELECT post_id FROM posts WHERE post_topic = '.$_POST['n'].' AND post_by = '.(-$_POST['begin'])
			.' ORDER BY post_date ASC LIMIT 1');
	if ($query->rowCount() > 0)
	{
		$top = $query->fetch(PDO::FETCH_ASSOC);
		die($top['post_id']);
	}
	die('0');
}
else if ($_POST['a'] == 'nli')
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	$_POST['title'] = trim($_POST['title']);
	$_POST['title'] = htmlspecialchars($_POST['title']);
	$title_len = mb_strlen($_POST['title'],'UTF8');
	if (($title_len < 1) || ($title_len > 100))
	{
		die('List name length shall be in [1, 100].');
	}
	
	$query = $db->prepare("INSERT INTO lists(list_name, list_by, list_date, list_cnt) VALUES(?,?,NOW(),0)");
	$query->execute(array($_POST['title'], $_SESSION['user_id']));
	if ($query->rowCount() < 1)
	{
		die('Cannot add list.');
	}
	die('SUCCESS');
}
else if (($_POST['a'] == 'dpo') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	$query = $db->query('SELECT post_topic, post_by, post_root, topic_special FROM posts LEFT JOIN topics ON post_root = topic_id WHERE post_id = '.$_POST['n']);
	$pos = $query->fetch(PDO::FETCH_ASSOC);
	if ($pos['post_topic'] > 0)
	{
		if (($_SESSION['user_id'] == 1) || ($pos['post_by'] == $_SESSION['user_id'])) 
		{ 
			$db->query('DELETE FROM posts WHERE post_id = '.$_POST['n'].';'
			.'UPDATE topics SET topic_replies = topic_replies - 1 WHERE topic_id = '.$pos['post_topic'].';'
			.'UPDATE users SET user_posts = user_posts - 1 WHERE user_id = '.$pos['post_by']);
		} 
		else 
		{
			$query = $db->query('SELECT topic_by FROM topics WHERE topic_id = '.$pos['post_topic']);
			$ppp = $query->fetch(PDO::FETCH_ASSOC);
			if ($ppp['topic_by'] == $_SESSION['user_id']) 
			{
				$db->query('UPDATE posts SET post_topic = NULL, post_root = 0 WHERE post_id = '.$_POST['n'].';'
				.'UPDATE topics SET topic_replies = topic_replies - 1 WHERE topic_id = '.$pos['post_topic']);				
			} 
			else {
				die('Access denied.');
			}
		}
	} 
	else if ($pos['post_root'] < 0) 
	{
		if ($pos['post_by'] == $_SESSION['user_id']) 
		{
			$db->query('DELETE FROM posts WHERE post_id = '.$_POST['n'].';'
				.'UPDATE users SET user_posts = user_posts - 1 WHERE user_id = '.$pos['post_by']);
			if ((-$pos['post_root']) != $pos['post_by'])
			{
				$db->query('UPDATE users SET user_posts = user_posts - 1 WHERE user_id = '.(-$pos['post_root']));
			}
		} 
		else if ($pos['post_root'] == (-$_SESSION['user_id']))
		{
			$db->query('UPDATE posts SET post_topic = NULL, post_root = 0 WHERE post_id = '.$_POST['n'].';'
				.'UPDATE users SET user_posts = user_posts - 1 WHERE user_id = '.(-$pos['post_root']));
		}
		else {
			die('Access denied.');
		}
	} 
	else if ($pos['post_root'] == 0) 
	{
		if ($pos['post_by'] == $_SESSION['user_id']) 
		{
			$db->query('DELETE FROM posts WHERE post_id = '.$_POST['n'].';'
				.'UPDATE users SET user_posts = user_posts - 1 WHERE user_id = '.$pos['post_by']);
		}
		else {
			die('Access denied.');
		}
	} else {
		die();
	}
	if ($pos['topic_special'] == 4) {
		$db->query('UPDATE users SET user_hidposts = user_hidposts - 1 WHERE user_id = '.$pos['post_by']);
	}
	die('SUCCESS');
}
else if (($_POST['a'] == 'mod') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] < 999) die('Meow.');
	$db->query('UPDATE posts SET post_topic = 1195, post_root = 1195 WHERE post_id = '.$_POST['n']);
}
else if (($_POST['a'] == 'xli') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	
	if (isset($_POST['title']))
	{
		$_POST['title'] = htmlspecialchars($_POST['title']);
		$_POST['title'] = trim($_POST['title']);
		$title_len = mb_strlen($_POST['title'],'UTF8');
		if (($title_len < 1) || ($title_len > 100))
		{
			die('List name length shall be in [1, 100].');
		}
		
		$query = $db->prepare("UPDATE lists SET list_name = ? WHERE list_id = ".$_POST['n']." AND list_by = ".$_SESSION['user_id']);
		$query->execute(array($_POST['title']));
		if ($query->rowCount() < 1)
		{
			die('Access denied or not modified.');
		}
		die('SUCCESS'.$_POST['title']);
	}
	else
	{
		$query = $db->query("DELETE FROM lists WHERE list_id = ".$_POST['n']." AND list_by = ".$_SESSION['user_id']);
		if ($query->rowCount() < 1)
		{
			die('Access denied.');
		}		
		die('SUCCESS');
	}
}
else if (($_POST['a'] == 'xhi') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	$thi = ($_POST['n'] > 0) ? 4 : 0;
	$tht = abs($_POST['n']);

	if (($thi > 0) && ($_SESSION['user_level'] == -1)) die_Log();

	$query = $db->query("SELECT topic_special, topic_by FROM topics WHERE topic_id = $tht AND topic_by = ".$_SESSION['user_id']);
	if ($query->rowCount() < 1)
	{
		die();
	}
	$row = $query->fetch(PDO::FETCH_ASSOC);
	if ($row['topic_special'] != $thi)
	{
		$db->query("UPDATE topics SET topic_special = $thi WHERE topic_id = $tht");
		
		$db->query("UPDATE users SET user_hidposts=user_hidposts".(($thi==0)?('-'):('+'))
			.'(1+(SELECT COUNT(*) FROM posts WHERE posts.post_topic = '.$tht.' AND posts.post_by = '.$_SESSION['user_id']
			.')) WHERE user_id='.$_SESSION['user_id']);
	}
	die('s'.$thi);
}
else if (($_POST['a'] == 'xlo') && is_numeric($_POST['n']))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	$thi = ($_POST['n'] > 0) ? 2 : 0;
	$tht = abs($_POST['n']);
	
	if (($thi > 0) && ($_SESSION['user_level'] == -1)) die_Log();
	
	$db->query("UPDATE topics SET topic_special = $thi WHERE topic_id = $tht AND topic_by = ".$_SESSION['user_id']);
	die('s'.$thi);
}
else if (($_POST['a'] == 'css') && (strlen($_POST['n']) < 20))
{
	if ($_SESSION['user_id'] <= 0) die_Log();
	if ($_SESSION['user_level'] == -1) die_Log();
	
	$query = $db->prepare("UPDATE users SET user_css = ? WHERE user_id = ".$_SESSION['user_id']);
	$query->execute(array($_POST['n']));
	die('Saved.');
}
else
{
	die('Something is wrong.');
}
?>