<?php
	require_once 'header.php';
	
	if (!isset($_SESSION['user_id'])) {
		$_SESSION['user_id'] = -1;
	}
	
	function get_icon($user)
	{
		$icon = 'icon/'.$user.'_32.png'; if (!file_exists($icon)) $icon = 'icon/0_32.png';
		return $icon;
	}
	
	echo '<script>var $user_css="';
	$shall_default = true;
	if ($_SESSION['user_id'] > 0) 
	{
		$query = $GLOBALS['db']->query("SELECT user_css FROM users WHERE user_id = ".$_SESSION['user_id']);
		$row = $query->fetch(PDO::FETCH_ASSOC);
		if ($row['user_css'] != '') { $shall_default = false; echo $row['user_css']; }
	}
	if ($shall_default)	echo '024034';
	//if ($shall_default)	echo '032034';
	echo '";</script>';
?>
<div id="magic">
	<div id="work_status" class=""><img src="loading.gif"/></div>
</div>
<div id="wrap" class="clearfix"><div id="container" class="clearfix">
<div id="panel">
	<div id="signup_panel">
		<img src="title_x.png" style="margin-bottom:22px;margin-left:1px;margin-top:-5px;" alt="Project Ivory"/>
		<input type="text" class="_user" placeholder="username" />
		<input type="text" class="_email" placeholder="email" />
		<div style="height:14px"></div>
		<input type="password" class="_pass" placeholder="password" />
		<input type="password" class="_pass_again" placeholder="password (repeat)" />
		<div style="height:14px"></div>
		<span class="msg"></span><span class="button">sign up</span>
	</div>
	<div id="signin_panel">
		<img src="title_x.png" style="margin-bottom:22px;margin-left:1px;margin-top:-5px;" alt="Project Ivory"/>
		<input type="text" class="_user" placeholder="username" />
		<input type="password" class="_pass" placeholder="password" />
		<div style="height:14px"></div>
		<span class="msg"></span><span class="button">sign in</span>
	</div>
</div>
<div id="cache" style="display:none">
	<div id="mid_func">
		<div class="button xxb" id="t_list_button"><i class="icon-list"></i> Lists</div>
		<div class="button xxb" id="t_add_button"><i class="icon-plus-sign"></i> List+</div>
		<div class="button xxb" id="t_min_button"><i class="icon-minus-sign"></i> List-</div>
		<div class="button xxb" id="t_ren_button"><i class="icon-edit"></i> Rename</div>
		<span class="button xxb" id="t_lock_button"><i class="icon-lock"></i> Lock</span>
		<span class="button xxb" id="t_hide_button"><i class="icon-eye-close"></i> Hide</span>
		<span class="button xxb" id="t_mod_button"><i class="icon-briefcase"></i> Mod</span>
		<span class="button xxb" id="t_unmod_button"><i class="icon-briefcase"></i> UnMod</span>
		<span id="title_msg"></span>
	</div>
	<div id="mid_title_user">
		<div style="position:absolute;top:-2px;right:35px;">
			<span class="button" id="followers_button"></span>
			<span style="display:inline-block;width:12px"></span>
			<span class="button" id="following_button"></span>
		</div>
		<p style="position:relative;top:-13px;height:28px;text-indent:78px;" class="hover"></p>
		<div style="position:relative;top:0px;height:31px;margin-left:78px;margin-right:220px;">
			<div class="button" style="padding:6px 0px;margin-right:8px" id="user_location"><i class="icon-globe"></i> </div>
			<div class="button" style="padding:6px 0px;margin-right:8px" id="user_education"><i class="icon-star"></i> </div>
			<div class="button" style="padding:6px 0px;margin-right:8px" id="user_major"><i class="icon-book"></i> </div>
			<div class="button" style="padding:6px 0px;margin-right:8px" id="user_hobby"><i class="icon-heart-empty"></i> </div>
		</div>
		<div id="user_img" class="icon"></div>
		<div id="mid_func_user"></div>
	</div>
	<div id="item_func">
		<div class="button xxf" id="item_ref">Reply: <span class="item_num"></span></div>
		<div class="button xxf" id="item_jump">Jump</div>
		<div class="button xxf" id="item_focus">Focus</div>
		<div class="button xxf" id="item_defocus">Defocus</div>
		<div class="button xxf" id="item_shift">Shift</div>
		<div class="button xxf" id="item_reply">Refer: <span id="item_aut"></span></div>
		<div class="button xxf" id="item_delete"> </div>
		<div class="button xxf" id="item_edit"> </div>
		<!--<div class="button xxf" id="item_mod">Meow</div>-->
		<div id="item_msg"></div>
	</div>
	<div id="left_func">
		<div class="button xxb" id="n_topic_button"><i class="icon-th-large"></i> Threads</div>
		<div class="button xxb" id="n_list_button"><i class="icon-list"></i> Lists</div>
		<div class="button xxb" id="n_user_button"><i class="icon-user"></i> Users</div>
		<div class="button xxb" id="n_b_button"><i class="icon-fire"></i> Limbo</div>
		<div class="button xyb" id="n_ref_button" style="margin-right:-21px"><i class="icon-refresh"></i></div>
		<div class="button xyb" id="n_fwd_button"><i class="icon-circle-arrow-right"></i></div>
		<div class="button xyb" id="n_back_button"><i class="icon-circle-arrow-left"></i></div>
		<div class="button xyb" id="n_pgdn_button"><i class="icon-circle-arrow-down"></i></div>
		<div class="button xyb" id="n_pgup_button"><i class="icon-circle-arrow-up"></i></div>
	</div>
	<div id="left_create" class="item clearfix">
		<input type="text" id="create_text" style="width:100%;"/>
		<div class="button" id="create_go" style="margin-top:10px;float:left"><i class="icon-plus-sign"></i> Post</div>
		<div class="button" id="create_cancel" style="margin-top:10px;left:12px;float:left"><i class="icon-ban-circle"></i> Cancel</div>
		<div id="create_msg"></div>
	</div>
	<div id="left_modify" class="item clearfix">
		<input type="text" id="modify_text" style="width:100%;"/>
		<div class="button" id="modify_cancel" style="margin-top:10px;float:right"><i class="icon-ban-circle"></i> Cancel</div>
		<div class="button" id="modify_go" style="margin-top:10px;float:left"><i class="icon-edit"></i> Edit</div>
		<div class="button" id="modify_delete" style="margin-top:10px;left:12px;float:left"><i class="icon-remove-sign"></i> Delete</div>
		<div id="modify_msg"></div>
	</div>
</div>
<div id="qaa" title="Refresh"></div><div id="qab" title="Prev 30 items"></div><div id="qac" title="Next 30 items"></div><div id="qad" title="To bottom"></div>
<div id="qba" title="Reading mode"></div><div id="qbb" title="Prev 30 items"></div><div id="qbc" title="Next 30 items"></div><div id="qbd" title="To bottom"></div>
<div id="qct"><div id="qca" title="To top / Toggle functions"></div></div><div id="qcx"><div id="qcb" title="To top / Toggle functions"></div></div>
<div id="qdt"><div id="qda" title="Back"></div><div id="qdb" title="Forward"></div></div><div id="qdx"><div id="qdc" title="Back"></div><div id="qdd" title="Forward"></div></div>
<div id="qea"><div id="qex"></div></div><div id="qfa"><div id="qfx"></div></div>
<div id="left_wrap" class="clearfix"><div id="left_sss" class="clearfix">
	<div id="left" class="box clearfix"><div id="left_pad" class="padbox">
		<div style="position:absolute;right:0px;top:13px;padding:0px 0px 8px 8px;z-index:111;">
			<div class="button" id="refresh_button"><i class="icon-home"></i> Home</div>
			<div class="button" id="create_button"><i class="icon-pencil"></i> Create</div>
			<div id="num_online" title="# online users" style="display:inline;position:relative;top:-15px;margin-right:12px;"><i class="icon-user"></i> <span class="num_online">...</span></div>
		</div>
		<div id="nav_wrap">
		</div>
	</div></div>
	<div id="left_panel" class="xbox clearfix"><div class="xpadbox clearfix" id="left_panel_pad">
		<div style="padding:0px 0px 0px 98px;right:0px;position:absolute;width:100%"><div class="button" id="search_button"><i class="icon-search"></i></div><input type="text" id="search_text"/></div>
		<div style="height:1px"></div>
		<div class="button" id="u_topic_button" title="My Topics"><i class="icon-th-large"></i></div>
		<div class="button" id="u_post_button" title="My Replies"><i class="icon-th"></i></div>
		<div class="button" id="u_list_button" title="My Lists"><i class="icon-list"></i></div>
		<div class="button" id="u_setup_button" title="My Settings"><i class="icon-wrench"></i></div>
		<div id="setup">
			<table id="user_css">
				<tr id="user_css_font"><td>Default</td><td>Cambria</td><td>Verdana</td><td>Corbel</td><td>Consolas</td></tr>
				<tr id="user_css_fontsz"><td>11px</td><td>12px</td><td>13px</td><td>14px</td><td>15px</td><td>16px</td></tr>
				<tr id="user_css_line"><td>1.3</td><td>1.4</td><td>1.5</td><td>1.6</td><td>1.7</td><td>1.8</td></tr>
				<tr id="user_css_etc"><td>Wide-Corner</td><td>Pane-Switch</td><td><input type="text" style="height:28px;width:34px"/></td></tr>
				<tr id="user_css_func"><td id="user_css_save" class="hover">Save</td><td id="user_css_msg" colspan="2"><td></tr>
			</table>
		</div>
	</div></div>
</div></div>
<div id="mid_wrap" class="cleafix"><div id="mid_sss" class="clearfix">
	<div id="mid" class="box clearfix"><div id="mid_pad" class="padbox">
		<div class="button" id="fullview_button" title="Click to toggle reading mode"><i class="icon-fullscreen"></i></div>
		<div id="mid_core">
			<div class="button xyb" id="t_ref_button" style="margin-right:-8px"><i class="icon-refresh"></i></div>
			<div class="button xyb" id="t_fwd_button"><i class="icon-circle-arrow-right"></i></div>
			<div class="button xyb" id="t_back_button"><i class="icon-circle-arrow-left"></i></div>
			<div class="button xyb" id="t_pgdn_button"><i class="icon-circle-arrow-down"></i></div>
			<div class="button xyb" id="t_pgup_button"><i class="icon-circle-arrow-up"></i></div>
			<div class="button xyb" id="user_button" n="<?php echo $_SESSION['user_id'].'"><i class="icon-user"></i> '.$_SESSION['user_name']; ?></div>
		</div>
		<div id="text_wrap">
		</div>
	</div></div>
	<div id="mid_panel_wrap"><div id="mid_panel" class="xbox clearfix"><div id="mid_ppp" class="xpadbox clearfix">
		<span class="tcon" id="user_xyz" title="<?php echo $_SESSION['user_name'].'" style="background-image:url('.get_icon($_SESSION['user_id']); ?>)"></span>
		<div id="post_wrap"><input type="text" id="post_title" placeholder="Title" />
		<textarea id="post_text" placeholder="Text"></textarea></div>
		<div class="button" id="page_top_button" title="Click to go top"><i class="icon-chevron-up"></i></div>
		<div class="button" id="fullview_button_2" style="display:none" title="Click to toggle reading mode"><i class="icon-fullscreen"></i></div>
		<div id="post_wwww" style="display:none; margin-top:19px; margin-bottom:10px;margin-left:42px;">
			<span title="Reply without bumping?"><i id="sage_button" class="redd butto inactive icon-legal"></i></span>
			<span title="Only visible to you? (changeable later)"><i id="hide_button" class="redd butto inactive icon-eye-close"></i></span>
			<span title="Only repliable by you? (changeable later)"><i id="lock_button" class="redd butto inactive icon-lock"></i></span>
			<div class="button" id="post_button"><i class="icon-flag"></i> Post</div>
			<div class="button" id="cancel_button"><i class="icon-ban-circle"></i> Cancel</div>
			<div id="post_msg"></div>
		</div>
	</div></div></div>
</div></div>
<?php
	require_once 'footer.php'; 
?>