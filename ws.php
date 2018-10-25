<?php
	$NO_NEED_FOR_SESSION = true;
	date_default_timezone_set("America/New_York");
	
	require_once 'connect.php';
	require_once 'post_func.php';
	require_once 'account_func.php';
	require __DIR__ . '/vendor/autoload.php';
	
	use Ratchet\MessageComponentInterface;
	use Ratchet\ConnectionInterface;
	use Ratchet\Server\IoServer;
	use Ratchet\Http\HttpServer;
	use Ratchet\WebSocket\WsServer;	

	$GLOBALS['mcache']->set('pivory.threads.list', '');
	$GLOBALS['sessionPrefix'] = (get_class($GLOBALS['mcache']) == 'Memcache') ? '' : 'memc.sess.key.';

	$GLOBALS['dddd'] = new DateTime();
	$GLOBALS['job_last_usr_count'] = 0;
	$GLOBALS['job_new_thread'] = new \SplObjectStorage;
	$GLOBALS['clients'] = new \SplObjectStorage;
	
	function debug($msg) {
		//print($msg);
	}

	function fetchses($conn) {
		$return_data = array();

		$id = substr($conn->httpRequest->getUri()->getPath(), 1);
		$session_data = $GLOBALS['mcache']->get($GLOBALS['sessionPrefix'].$id);
		debug($id.' sess '.$session_data);
		$offset = 0;
		while ($offset < strlen($session_data)) {
			if (!strstr(substr($session_data, $offset), "|")) {
				throw new Exception("invalid data, remaining: " . substr($session_data, $offset));
			}
			$pos = strpos($session_data, "|", $offset);
			$num = $pos - $offset;
			$varname = substr($session_data, $offset, $num);
			$offset += $num + 1;
			$data = unserialize(substr($session_data, $offset));
			$return_data[$varname] = $data;
			$offset += strlen(serialize($data));
		}
		return $return_data;
	}
	
	function process(ConnectionInterface $conn, $msg, &$succ) 
	{
		$query = $GLOBALS['db']->query('SELECT 1');
		if (!$query) connect_db();
		if ((($msg['a'] == 'new') || ($msg['a'] == 'ne1')) && (is_numeric($msg['n']))) {
			$ses = fetchses($conn);
			if (!isset($ses['user_id'])) return info_Log();
			if ($ses['user_id'] <= 0) return info_Log();
			if (($ses['user_level'] == -1) && (isset($msg['s']))) return info_Log();
			
			$mm = verifyText($msg['text']);	if ($mm != '') return $mm;
			$msg['text'] = mynl2br(htmlspecialchars($msg['text']));
			
			$is_hidden_post = false;
			$topic_class = 0; if ($msg['a'] == 'ne1') $topic_class = 1;
			if ($msg['n'] == 0)
			{
				if ($ses['user_level'] == -1) $topic_class = 1;
				$mm = verifyTitle($msg['title']);	if ($mm != '') return $mm;

				$query = $GLOBALS['db']->prepare("INSERT INTO posts(post_text,post_date,post_by,post_topic,post_root,post_ip) VALUES(?,NOW(),?,NULL,NULL,'".$conn->remoteAddress."')");
				$query->execute(array($msg['text'], $ses['user_id']));
				if ($query->rowCount() < 1)
				{
					return 'Cannot add post.';
				}
				$topic_root = $GLOBALS['db']->lastInsertId();

				$topic_special = 0;
				if (isset($msg['s'])) if (($msg['s'] == '1') || ($msg['s'] == '2')) {
					$topic_special += 2 * (int)($msg['s']);
				}
				if ($topic_special == 4) $is_hidden_post = true;
				
				$query = $GLOBALS['db']->prepare("INSERT INTO topics(topic_title,topic_root,topic_date,topic_by,topic_score,topic_special,topic_class)"
					."VALUES(?,?,NOW(),?,UNIX_TIMESTAMP(NOW()) - ". (($ses['user_level'] >= 999999) ? ('0') : (($ses['user_level'] >= 0) ? ('3600') : ('86400'))).",?,?)");
				$query->execute(array($msg['title'], $topic_root, $ses['user_id'], $topic_special, $topic_class));
				
				if ($query->rowCount() < 1)
				{
					return 'Cannot add post.';
				}
				$msg['n'] = $GLOBALS['db']->lastInsertId();
				
				$GLOBALS['db']->query("UPDATE posts SET post_root = ".$msg['n']." WHERE post_id = ".$topic_root);
			}
			else
			{
				$already_replied = true;
				if ($ses['user_level'] >= 999999) 
				{
					$already_replied = false;
				}
				else if ($msg['n'] > 0)
				{
					$query = $GLOBALS['db']->query('SELECT post_id FROM posts WHERE (post_root = '.$msg['n'].' AND post_by = '.$ses['user_id'].') LIMIT 1');
					if ($query->rowCount() <= 0) $already_replied = false;
				}
				if ($msg['n'] < 0)
				{
					$query = $GLOBALS['db']->query("SELECT * FROM follow WHERE follow_b = ".$ses['user_id']." AND follow_a = ".(-$msg['n']));
					if (($query->rowCount() <= 0) && ($ses['user_id'] != 1) && ($ses['user_id'] != -$msg['n']))
						return "Currently you can post on the walls of your followers.";
				}
				else {
					$query = $GLOBALS['db']->query("SELECT topic_class, topic_by, topic_special FROM topics WHERE topic_id=".$msg['n']);
					$top = $query->fetch(PDO::FETCH_ASSOC);
					if (($top['topic_special'] >= 2) && ($top['topic_by'] != $ses['user_id'])) // both lock and hidden
						return "Currently the topic is locked (only its author can reply).";
					if ($top['topic_special'] == 4)
						$is_hidden_post = true;
				}
				$query = $GLOBALS['db']->prepare("INSERT INTO posts(post_text,post_date,post_by,post_topic,post_root,post_ip) VALUES(?,NOW(),?,?,?,'".$conn->remoteAddress."')");
				$ttopic = ($msg['n'] > 0) ? ($msg['n']) : (NULL);
				$query->execute(array($msg['text'], $ses['user_id'], $ttopic, $msg['n']));
				if ($query->rowCount() < 1)
				{
					return 'Cannot add post.';
				}
				if ($msg['n'] > 0)
				{
					$GLOBALS['db']->query('UPDATE topics SET topic_replies = topic_replies + 1 WHERE topic_id = '.$msg['n']);
					$shall_bump = true;
					if (isset($msg['s'])) $shall_bump = false;
					if (($ses['user_level'] < 0) && ($top['topic_class'] == 0)) $shall_bump = false;
					if ($shall_bump)
					{
						if (!$already_replied)
						{
							if ($ses['user_level'] >= 999999)
								$GLOBALS['db']->query("UPDATE topics SET topic_score = UNIX_TIMESTAMP(NOW()) WHERE ((topic_id = ".$msg['n'].") AND (topic_special <> 1))");
							else
								$GLOBALS['db']->query("UPDATE topics SET topic_score = GREATEST((topic_score  + UNIX_TIMESTAMP(NOW())) / 2, UNIX_TIMESTAMP(NOW()) - 3600) WHERE ((topic_id = ".$msg['n'].") AND (topic_special <> 1))");
						}
						else
						{
							$GLOBALS['db']->query("UPDATE topics SET topic_score = GREATEST(topic_score, UNIX_TIMESTAMP(NOW()) - 7200) WHERE ((topic_id = ".$msg['n'].") AND (topic_special <> 1))");
						}
					}
				}
				else if ($ses['user_id'] != -$msg['n'])
				{
					$GLOBALS['db']->query("UPDATE users SET user_posts = user_posts + 1 WHERE user_id = ".(-$msg['n']));
				}
			}
			$GLOBALS['db']->query("UPDATE users SET user_posts = user_posts + 1, user_lastpost = NOW() WHERE user_id = ".$ses['user_id']);
			
			if ($is_hidden_post)
				$GLOBALS['db']->query("UPDATE users SET user_hidposts = user_hidposts + 1 WHERE user_id = ".$ses['user_id']);

			if ($topic_class == 0) {
				if ($msg['n'] >= 0) { // not to users
					ob_start();
					post_get('', '', '', 30, '', 0, -1, -1);
					$threads_list = ob_get_contents();
					ob_end_clean();
					$GLOBALS['mcache']->set('pivory.threads.list', $threads_list);
					$succ = 1; // send global msg to everyone
				}
			} else {
				$succ = -1; // send only to OP
			}
			return 'SUCCESS'.$msg['n'];
		}
		else if (($msg['a'] == 'xmo') && (is_numeric($msg['n']))) {
			$ses = fetchses($conn);
			if (!isset($ses['user_id'])) return info_Log();
			if ($ses['user_id'] <= 0) return info_Log();
			if ($ses['user_level'] < 999999) return "Access denied.";
			if ($msg['n'] > 0)
				$query = $GLOBALS['db']->query('UPDATE topics SET topic_class = 1 WHERE topic_id = '.$msg['n']);
			else
				$query = $GLOBALS['db']->query('UPDATE topics SET topic_class = 0 WHERE topic_id = '.(-$msg['n']));

			ob_start();
			post_get('', '', '', 30, '', 0, -1, -1);
			$threads_list = ob_get_contents();
			ob_end_clean();
			$GLOBALS['mcache']->set('pivory.threads.list', $threads_list);

			$succ = 2; // send not to OP. only to everyone else. otherwise OP got a refreshing NAV bad for work
			if ($query->rowCount() < 1) return 'Error.';
			return 'SUCCESS';
		}
	}
	
	class WS_SERVER implements MessageComponentInterface {

		public function __construct() {
		}

		public function onOpen(ConnectionInterface $conn) {
			debug('open');
			$ses = fetchses($conn);
			if (isset($ses['user_level'])) {
				$GLOBALS['clients']->attach($conn, $GLOBALS['dddd']->getTimestamp());
			}
		}

		public function onClose(ConnectionInterface $conn) {
			debug('close');
			$GLOBALS['clients']->detach($conn);
		}

		public function onError(ConnectionInterface $conn, \Exception $e) {
			debug('err '.e);
			$conn->close();
		}
		
		public function onMessage(ConnectionInterface $conn, $msg) {
			debug('msg '.$msg);
			if (!$GLOBALS['clients']->contains($conn)) return;
			if ($msg == '.') {
				$GLOBALS['clients'][$conn] = $GLOBALS['dddd']->getTimestamp();
				return;
			}
			$msg = json_decode($msg, true);
			$succ = 0;
			$conn->send($msg['id'].','.process($conn, $msg, $succ));
			if ($succ > 0) $GLOBALS['job_new_thread']->attach($conn, $succ);
		}
	}

	$loop = React\EventLoop\Factory::create();
	$socket = new React\Socket\Server('0.0.0.0:8080', $loop); 

	$loop->addPeriodicTimer(1, function () {
		// kill hanging
		$now = $GLOBALS['dddd']->getTimestamp();
		foreach ($GLOBALS['clients'] as $client) {
			if ($now - $GLOBALS['clients'][$client] > 130) {
				$client->close();
			}
		}
		// send client count
		$cur_cnt = $GLOBALS['clients']->count();
		if ($cur_cnt != $GLOBALS['job_last_usr_count']) {
			foreach ($GLOBALS['clients'] as $client) {
				$client->send('-3,'.$cur_cnt);
			}
		}
		$GLOBALS['job_last_usr_count'] = $cur_cnt;
		// send new thread
		if ($GLOBALS['job_new_thread']->count() > 0) {
			foreach ($GLOBALS['clients'] as $client) {
				$tttt = -2;
				if ($GLOBALS['job_new_thread']->contains($client)) {
					if ($GLOBALS['job_new_thread'][$client] == 1) $tttt = -1;
					$GLOBALS['job_new_thread']->detach($client);
				}
				$client->send($tttt.','.$GLOBALS['mcache']->get('pivory.threads.list'));
			}
		}
	});

	$GLOBALS['server'] = new IoServer(new HttpServer(new WsServer(new WS_SERVER())), $socket, $loop);
	$GLOBALS['server']->run();
?>
