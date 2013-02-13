<?php

function mynl2br($text, $order = true) {
	$src = array("\r\n", "\r", "\n");
	$des = array('<br />', '<br />', '<br />');
	if ($order)
		return str_replace($src, $des, $text);
	else
		return str_replace($des, $src, $text);
}
function verifyText(&$text) {
	$text = trim($text);
	$text_len = mb_strlen($text, 'UTF8');
	if (($text_len < 1) || ($text_len > 9999))
	{
		return 'Text length needs to be within [1, 9999]. Now it is '.$text_len.'.';
	}
	$line_cnt = substr_count($text, '\n') + 1;
	if ($line_cnt > 500)
	{
		return 'Line count needs to be within [1, 500]. Now it is '.$line_cnt.'.';
	}
}
function verifyTitle(&$title) {
	$title = trim($title);
	if (!$title)
	{
		return 'Fill in title.';
	}
	$title_len = mb_strlen($title,'UTF8');
	if (($title_len < 6) || ($title_len > 100))
	{
		return 'Title length needs to be within [6, 100]. Now it is '.$title_len.'.';
	}
	$title = htmlspecialchars($title);
}
function get_magic_string($query, $type, $topic, $begin, $limit)
{
	$x_begin = $begin + 1;
	$x_up = max(1, $begin - $limit + 1);
	if ($begin <= 0)
	{
		$x_up = -1;
	}
	$x_down = $begin + $limit + 1;
	if ($query->rowCount() < $limit + 1)
	{
		$x_down = -1;
	}
	return "$type,$topic,$x_begin,$x_up,$x_down";
}
function get_icon($user)
{
	$icon = 'icon/'.$user.'_64.png'; if (!file_exists($icon)) $icon = 'icon/0_64.png';
	return $icon;
}
function have_icon($user)
{
	$icon = 'icon/'.$user.'_64.png'; return (file_exists($icon)) ? ('1') : ('0');
}
function limx($anchor, $type, $begin, $limit_plus_one)
{
	if ($type == 1)
		return (($anchor > 0) ? (" AND (post_id > ".$anchor.") ORDER BY post_id ASC LIMIT $limit_plus_one") : (" ORDER BY post_id ASC LIMIT $begin, $limit_plus_one"));
	else if ($type == 2)
		return (($anchor > 0) ? (" AND (topic_id < ".$anchor.") ORDER BY topic_id DESC LIMIT $limit_plus_one") : (" ORDER BY topic_id DESC LIMIT $begin, $limit_plus_one"));
}
function post_get($type, $topic, $begin, $limit, $user, $anchor, $sid, $slevel)
{
	if (!is_numeric($anchor)) $anchor = 0;

	$limit_plus_one = $limit + 1;
	
	if (strlen($user) > 1) {
		if ($user[0] == '@') {
			$query = $GLOBALS['db']->prepare("SELECT user_id FROM users WHERE user_name = ?");
			$query->execute(array(substr($user, 1)));
			$top = $query->fetch(PDO::FETCH_ASSOC);
			$user = $top['user_id'];
		}
	}
	if (!is_numeric($user))	$user = '';
	
	if (($type == 'u') && (is_numeric($topic)))
	{
		if (!isset($_POST['par']))
		{
			$query = $GLOBALS['db']->query("SELECT user_name, user_level, user_posts, user_followers, user_following, user_hidposts, user_location, user_education, user_major, user_hobby FROM users WHERE user_id = $topic");
			$top = $query->fetch(PDO::FETCH_ASSOC);
			if ((($top['user_level'] < -99) && ($topic != $sid)) || ($query->rowCount() < 1)) {
				echo 'x002'; return;
			}
			$query = $GLOBALS['db']->query("SELECT follow_a FROM follow WHERE follow_a = ".$sid." AND follow_b = ".$topic);
			$stat = 0;
			if ($sid > 0) {
				$stat = 1;
				if ($topic == $sid) {
					$stat = 2;
					if ($slevel == -1)
						$stat = 3;
				}
			}
			echo 'user<>'.$stat.','.$top['user_name'].','.have_icon($topic).','.$top['user_followers'].','.$top['user_following'].','.$query->rowCount()
				.','.$top['user_location'].'^'.$top['user_education'].'^'.$top['user_major'].'^'.$top['user_hobby'];
		}
		else
		{
			$query = $GLOBALS['db']->query("SELECT user_posts FROM users WHERE user_id = $topic");
			$top = $query->fetch(PDO::FETCH_ASSOC);
			echo 'usex';
		}
		
		if ($begin < 0) {
			$query = $GLOBALS['db']->query("SELECT COUNT(*) AS cnt FROM posts LEFT JOIN topics ON topic_id = post_root WHERE (post_by = $topic OR post_root = ".(-$topic).")"
				." AND (topic_special is null OR topic_special <> 4 OR post_by <> topic_by OR post_by = ".$sid.")"
				." AND post_id < ".(-$begin));
			if ($query->rowCount() < 1)
			{
				$begin = 0;
			}
			else
			{
				$row = $query->fetch(PDO::FETCH_ASSOC);
				$anchor = -$begin - 1;
				$begin = $row['cnt'];
			}
		}
		else if ($begin == 0) {
			if ($sid == $topic)
				$begin = $top['user_posts'] - $limit;
			else
				$begin = $top['user_posts'] - $top['user_hidposts'] - $limit;
		}
		else
			$begin = is_numeric($begin) ? ($begin - 1) : 0;
		if ($begin < 0) $begin = 0;
		
		$query = $GLOBALS['db']->query("SELECT topic_special, topic_by, post_text, post_root, post_id, post_by, user_name FROM posts"
			.' JOIN users ON post_by = user_id'
			.' LEFT JOIN topics ON topic_id = post_root'
			." WHERE (post_by = $topic OR post_root = ".(-$topic).")"
			." AND (topic_special is null OR topic_special <> 4 OR post_by <> topic_by OR post_by = ".$sid.")"
			.limx($anchor, 1, $begin, $limit_plus_one));
		
		$upp = ($topic == $sid) ? ($top['user_posts']) : ($top['user_posts'] - $top['user_hidposts']);
		echo '<>'.get_magic_string($query, $type, $topic, $begin, $limit).','.$upp;

		$i = $begin;
		while ($row = $query->fetch(PDO::FETCH_ASSOC))
		{
			$i++; if ($i == $begin + $limit + 1) continue;
			if (($row['topic_special'] != 4) || ($sid == $topic) || ($row['post_by'] != $row['topic_by']))
				echo '<>'.$row['post_id'].','.$row['post_root'].','.$row['post_by'].','.$row['user_name'].','.have_icon($row['post_by']).','.$row['post_text'];
			else
				echo '<>';
		}
		return;
	}
	else if (($type == '') && (is_numeric($topic)))
	{
		if (!isset($_POST['par']))
		{
			$query = $GLOBALS['db']->query('SELECT topic_special, topic_title, topic_root, post_text, topic_replies, topic_by, user_name FROM topics'
				.' JOIN users ON topic_by = user_id'
				.' JOIN posts ON topic_root = post_id'
				.' WHERE topic_id = '.$topic);
			if ($query->rowCount() < 1) {
				echo 'x001'; return;
			}
			$top = $query->fetch(PDO::FETCH_ASSOC);
			if (($top['topic_special'] == 4) && ($top['topic_by'] != $sid)) {
				echo 'y001'; return;
			}
			
			echo 'post<>'.$top['topic_root'].','.$top['topic_by'].','.$top['user_name'].','.have_icon($top['topic_by']).','.$top['topic_special'].','.$top['topic_title'];
			echo '<>'.$top['post_text'];
		} 
		else 
		{
			$query = $GLOBALS['db']->query('SELECT topic_replies, topic_by FROM topics'
				.' WHERE topic_id = '.$topic);
			$top = $query->fetch(PDO::FETCH_ASSOC);
			echo 'posx';
		}
		
		if ($begin < 0) {
			$query = $GLOBALS['db']->query("SELECT COUNT(*) AS cnt FROM posts WHERE post_topic = $topic "
				.(($user > 0)?(" AND post_by = ".$user):(""))
				." AND post_id < ".(-$begin));
			if ($query->rowCount() < 1)
			{
				$begin = 0;
			}
			else
			{
				$row = $query->fetch(PDO::FETCH_ASSOC);
				$anchor = -$begin - 1;
				$begin = $row['cnt'];
			}
		}
		else if ($begin == 0) {
			if ($user > 0) {
				$query = $GLOBALS['db']->query("SELECT COUNT(*) AS cnt FROM posts WHERE post_topic = $topic AND post_by = ".$user);
				$row = $query->fetch(PDO::FETCH_ASSOC);
				if ($query->rowCount() < 1)
				{
					$begin = 0;
				}
				else
				{
					$row = $query->fetch(PDO::FETCH_ASSOC);
					$begin = $row['cnt'] - $limit;
				}
			} else {
				$begin = $top['topic_replies'] - $limit;
			}
		} else {
			$begin = $begin - 1;
		}
		if ($begin > $top['topic_replies'] - 1) {
			$begin = $top['topic_replies'] - 1;
		}
		if ($begin < 0) {
			$begin = 0;
		}

		$query = $GLOBALS['db']->query('SELECT post_text, post_id, post_by, user_name FROM posts'
			.' JOIN users ON post_by = user_id'
			." WHERE post_topic = $topic".(($user > 0)?(" AND post_by = ".$user):(""))
			.limx($anchor, 1, $begin, $limit_plus_one));
		
		echo '<>'.get_magic_string($query, $type, $topic.(($user > 0)?('_'.$user):('')), $begin, $limit).','.$top['topic_replies'].','.$top['topic_by'];
		
		$i = $begin;
		while ($row = $query->fetch(PDO::FETCH_ASSOC))
		{
			$i++; if ($i == $begin + $limit + 1) continue;
			echo '<>'.$row['post_id'].','.$row['post_by'].','.$row['user_name'].','.have_icon($row['post_by']).','
				.$row['post_text'];
		}
	}
	else
	{
		$begin = is_numeric($begin) ? ($begin - 1) : 0;
		$desc = ''; $xxxx = 'list';
		if (($type == 'p') || ($type == 'q') || ($type == 't') || ($type == 'v') || ($type == 'w'))
		{
			if (is_numeric($topic)) {
				$query = $GLOBALS['db']->query("SELECT user_name FROM users WHERE user_id = $topic");
				$xow = $query->fetch(PDO::FETCH_ASSOC);
			}
		}
		if ($type == 'p')
		{
			$desc = $xow['user_name']."'s Threads"; //DATE_FORMAT(topic_date, '%b %e') AS date
			if ($topic == $sid) $desc = 'My Threads';
			$query = $GLOBALS['db']->query("SELECT topic_special, topic_title, topic_replies, topic_id, topic_by, topic_root FROM topics"
			." WHERE topic_by = $topic ".limx($anchor, 2, $begin, $limit_plus_one));
		} 
		else if ($type == 'q')
		{
			$desc = $xow['user_name']."'s Replies"; //DATE_FORMAT(MAX(post_date), '%b %e') AS date
			if ($topic == $sid) $desc = 'My Replies';
			$query = $GLOBALS['db']->query("SELECT topic_special, topic_title, topic_replies, topic_id, topic_by, topic_root, user_name FROM topics"
			." JOIN posts ON topic_id = post_topic"
			." JOIN users ON topic_by = user_id"
			." WHERE ((post_by = $topic) AND (topic_by <> $topic)) GROUP BY topic_id ORDER BY MAX(post_id) DESC LIMIT $begin, $limit_plus_one");
		}
		else if ($type == 't')
		{
			$xxxx = 'tist';
			if (strlen($topic) == 0)
			{
				$desc = 'Lists'; 
				$query = $GLOBALS['db']->query("SELECT list_id, list_name, list_cnt, list_by, user_name FROM lists "
				." JOIN users ON list_by = user_id"
				." ORDER BY list_id DESC LIMIT $begin, $limit_plus_one");
			}
			else if (is_numeric($topic))
			{
				if ($topic > 0)
				{
					$desc = $xow['user_name']."'s Lists";
					if ($topic == $sid) $desc = 'My Lists';
					$query = $GLOBALS['db']->query("SELECT list_id, list_name, list_cnt, list_by FROM lists "
					." WHERE list_by = $topic ORDER BY list_id DESC LIMIT $begin, $limit_plus_one");
				}
				else
				{
					$topic = -$topic;
					$query = $GLOBALS['db']->query("SELECT topic_special, topic_title FROM topics WHERE topic_id = $topic");
					$xow = $query->fetch(PDO::FETCH_ASSOC);
					$desc = "Lists &#9666; ".$xow['topic_title'];
					$query = $GLOBALS['db']->query("SELECT list_id, list_name, list_cnt, list_by, user_name FROM lists "
					." JOIN list2top ON id_list = list_id"
					." JOIN users ON list_by = user_id"
					." WHERE id_topic = $topic ORDER BY list_cnt DESC LIMIT $begin, $limit_plus_one");
				}
			}
			else
			{
				$xx = substr($topic, 0, 1);
				$xa = $sid;
				$xb = substr($topic, 1);
				if ((!is_numeric($xa)) || (!is_numeric($xb))) return;
				if ($xx == 'm')
				{
					$desc = "Removing Topic from List";
					$query = $GLOBALS['db']->query("SELECT list_id, list_name, list_cnt, list_by, user_name FROM lists "
					." JOIN list2top ON id_list = list_id"
					." JOIN users ON list_by = user_id"
					." WHERE (list_by = $xa AND id_topic = $xb) ORDER BY list_id DESC LIMIT $begin, $limit_plus_one");
				}
				if ($xx == 'a')
				{
					$desc = "Adding Topic to List";
					$query = $GLOBALS['db']->query("SELECT list_id, list_name, list_cnt, list_by, user_name FROM lists "
					." JOIN users ON list_by = user_id"
					." WHERE (list_by = $xa AND list_id NOT IN (SELECT id_list AS list_id FROM list2top WHERE id_topic = $xb))"
					." ORDER BY list_id DESC LIMIT $begin, $limit_plus_one");
				}
			}
		}
		else if ($type == 's')
		{
			$xxxx = 'list';
			$query = $GLOBALS['db']->query("SELECT list_name FROM lists WHERE list_id = $topic");
			$xow = $query->fetch(PDO::FETCH_ASSOC);
			$desc = "Threads &#9656; ".$xow['list_name'];
			$query = $GLOBALS['db']->query("SELECT topic_special, topic_title, topic_replies, topic_id, topic_by, topic_root, user_name FROM topics "
			." JOIN list2top ON id_topic = topic_id"
			." JOIN users ON topic_by = user_id"
			." WHERE id_list = $topic".limx($anchor, 2, $begin, $limit_plus_one));
		}
		else if ($type == 'a')
		{
			$desc = 'Title : '.$topic;
			if ($slevel == -1) {
				echo 'x003'; return;
			} else {
				$query = $GLOBALS['db']->prepare("SELECT topic_special, topic_title, topic_replies, topic_id, topic_root, topic_by, user_name FROM topics"
				." JOIN users ON topic_by = user_id"
				." WHERE topic_title LIKE ? ".limx($anchor, 2, $begin, $limit_plus_one));
				$query->execute(array('%'.$topic.'%'));
			}
		}
		else if ($type == 'b')
		{
			$desc = 'Name : '.$topic; $xxxx = 'uist';
			if ($slevel == -1) {
				echo 'x003'; return;
			} else {
				$query = $GLOBALS['db']->prepare("SELECT user_id, user_name, user_posts, user_hidposts FROM users"
				." WHERE ((user_name LIKE ?) AND (user_level >= -99)) ORDER BY user_lastpost DESC LIMIT $begin, $limit_plus_one");
				$query->execute(array('%'.$topic.'%'));
			}
		}
		else if ($type == 'c')
		{
			$desc = 'List Name : '.$topic; $xxxx = 'tist';
			if ($slevel == -1) {
				echo 'x003'; return;
			} else {			
				$query = $GLOBALS['db']->prepare("SELECT list_id, list_name, list_cnt, list_by, user_name FROM lists"
				." JOIN users ON list_by = user_id"
				." WHERE list_name LIKE ? ORDER BY list_cnt DESC LIMIT $begin, $limit_plus_one");
				$query->execute(array('%'.$topic.'%'));
			}
		}
		else if ($type == 'u')
		{
			$desc = 'Users'; $xxxx = 'uist';
			$query = $GLOBALS['db']->query("SELECT user_id, user_name, user_posts, user_hidposts FROM users WHERE user_level >= -99 ORDER BY user_lastpost DESC LIMIT $begin, $limit_plus_one");
		}
		else if ($type == 'v')
		{
			$desc = $xow['user_name']."'s Following"; $xxxx = 'uist';
			$query = $GLOBALS['db']->query("SELECT user_id, user_name, user_posts, user_hidposts FROM follow JOIN users ON user_id = follow_b WHERE follow_a = $topic ORDER BY user_lastpost DESC LIMIT $begin, $limit_plus_one");
		}
		else if ($type == 'w')
		{
			$desc = $xow['user_name']."'s Followers"; $xxxx = 'uist';
			$query = $GLOBALS['db']->query("SELECT user_id, user_name, user_posts, user_hidposts FROM follow JOIN users ON user_id = follow_a WHERE follow_b = $topic ORDER BY user_lastpost DESC LIMIT $begin, $limit_plus_one");
		}
		else if ($type == '')
		{
			$desc = 'Threads';
			$query = $GLOBALS['db']->query("SELECT topic_special, topic_title, topic_replies, user_name, topic_id, topic_root, topic_by FROM topics"
			." JOIN users ON topic_by = user_id"
			." WHERE (topic_special <> 4 OR topic_by = ".$sid.") AND topic_class = 0"
			." ORDER BY topic_score DESC LIMIT $begin, $limit_plus_one");
		}
		else if ($type == '@')
		{
			$desc = 'Limbo';
			$query = $GLOBALS['db']->query("SELECT topic_special, topic_title, topic_replies, user_name, topic_id, topic_root, topic_by FROM topics"
			." JOIN users ON topic_by = user_id"
			." WHERE (topic_special <> 4 OR topic_by = ".$sid.") AND topic_class = 1"
			." ORDER BY topic_score DESC LIMIT $begin, $limit_plus_one");
		}
		if ($desc == '')
		{
			return;
		}
		if (isset($_POST['par'])) {
			$xxxy = $xxxx;
			$xxxy[3] = 'x';
			echo $xxxy;
		} 
		else {
			echo $xxxx.'<>'.$desc;
		}

		echo '<>'.get_magic_string($query, $type, $topic, $begin, $limit);
		
		$i = $begin;
		while($row = $query->fetch(PDO::FETCH_ASSOC))
		{
			$i++; if ($i == $begin + $limit + 1) continue;
			if (!isset($row['user_name'])) $row['user_name'] = $xow['user_name'];
			if ($xxxx == 'uist')
			{
				$upp = ($row['user_id'] == $sid) ? ($row['user_posts']) : ($row['user_posts'] - $row['user_hidposts']);
				echo '<>'.$row['user_id'].','.$row['user_name'].','.have_icon($row['user_id'])
					.','.$upp.','.$row['user_name'];
			} else if ($xxxx == 'tist') {
				echo '<>'.$row['list_id'].','.$row['list_by'].','.$row['user_name'].','.have_icon($row['list_by'])
					.','.$row['list_cnt'].','.$row['list_name'];
			} else {
				if (($row['topic_special'] == 4) && ($sid != $row['topic_by'])) {
					echo '<>';
				} else {
					echo '<>'.$row['topic_id'].','.$row['topic_by'].','.$row['user_name'].','.have_icon($row['topic_by'])
						.','.$row['topic_replies'].','.$row['topic_root'].','.$row['topic_special'].','.$row['topic_title'];
				}
			}
		}
	}
}
?>