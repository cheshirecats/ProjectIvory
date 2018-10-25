(function(){

var left_history = new History('left');
var mid_history = new History('mid');

var left_raw = [];
var mid_raw = [];
var $_GET = [];
var acc_working = false;

var $shall_focus_search = false;
var $shall_focus_post = false;
var $shall_no_scroll_update = false;

var job_free = true;
var job_list = [];

var $posting_topic = 0;

var $first_run_left = true;
var $first_run_mid = true;

var left_timer, mid_timer;

var left_start = -1;
var left_starx = -1;
var mid_start = -1;
var mid_starx = -1;

var lww = 36;
var mww = 100 - lww;
var scrollbar_t = 649;

var $left_wrap = $('#left_wrap');
var $mid_wrap = $('#mid_wrap');

var $socket;
var $socket_uid = 0;
var $socket_callback = [];
var $num_online = '...';

var t4 = 0;

function outerHTML(node) {
	return node.outerHTML || new XMLSerializer().serializeToString(node);
}

var $mid_func, $mid_title_user_inner, $item_func, $left_func, $left_create, $left_modify;
if ($CURRENT_FILE_NAME == 'index.php')
{
	if (curUser() != '1') {
		$('#t_mod_button').remove();
		$('#t_unmod_button').remove();
	}
	$mid_func = outerHTML(document.getElementById('mid_func'));
	$mid_title_user_inner = document.getElementById('mid_title_user').innerHTML;
	$item_func = outerHTML(document.getElementById('item_func'));
	$left_func = outerHTML(document.getElementById('left_func'));
	$left_create = outerHTML(document.getElementById('left_create'));
	$left_modify = outerHTML(document.getElementById('left_modify'));
	$('#cache').remove();
}

function is_good_for_live()
{
	var nav = $('#nav');
	return ((nav.attr('topic') == '') && (nav.attr('type') == '') && (nav.attr('begin') == '1') && (parseInt(nav.attr('down')) == 31));
}

function str_count(a, b)
{
	a += ""; b += "";
	if(b.length <= 0) return 0;
	var n = 0, pos = 0;
	while(true)
	{
		pos = a.indexOf(b, pos);
		if(pos >= 0) { n++; pos += b.length; } else break;
	}
	return n;
}

function str_go(s, a, b, aa, bb)
{
	var x = str_count(s, a);
	if (x <= 0) return s;
	var y = str_count(s, b);
	if (y != x) return s;
	return s.split(a).join(aa).split(b).join(bb);
}

function zeroFill(number, width) {
	var fillZeroes = '000';
	var input = number + '';
	return fillZeroes.slice(0, width - input.length) + input;
}

function session_id() {
	return document.cookie.match(/cwSession=([^;]+)/)[1];
}

function job_begin ($a) 
{
	job_list[$a] = true;
	job_free = false;
	$('#work_status').show();
}
function job_end($a) {
	job_list[$a] = false;
	for (var job in job_list) {
		if (job_list[job]) {
			return;
		}
	}
	job_free = true;
	$('#work_status').hide();
}

function pageAmt() {
	return ($(window).height() - 70);
}

function History(z) {
	this.z = z;
	this.s = [];
	this.t = 0;
	this.u = 0;
	this.p = function() {
		var ss = (this.z == 'left') ? $('#nav') : $('#post');
		var tt = (this.z == 'left') ? $('#left_sss').css('top') : $('#mid_sss').css('top');
		var uu = (this.z == 'left') ? $('#nav_wrap') : $('#text_wrap');
		tt = parseInt(tt); if (isNaN(tt)) tt = 0;
		var new_s = [ss.attr('type') + ss.attr('topic'), ss.attr('begin'), tt];
		if (this.t == 0) {
			// fresh push
			this.s.push(new_s);
			this.s[0][3] = uu.html();
		}
		else {
			if (this.s[this.t - 1][0] != new_s[0]) {
				// push in
				this.s.splice(this.t, this.s.length - this.t, new_s);
				this.s[this.t][3] = uu.html();
				for (var i = 0; i < this.t; i++) { // remove older duplicates
					//if (i < this.t - 1) continue; // just once...
					if (this.s[i][0] == new_s[0]) {
						this.s.splice(i, 1);
						this.t--;
						break;
					}
				}
			}
			else {
				// update
				this.s[this.t - 1][1] = new_s[1];
				this.s[this.t - 1][2] = new_s[2];
				this.s[this.t - 1][3] = uu.html();
				this.g(0); return;
			}
		}
		this.t++;
		this.g(2);
	};
	this.q = function(x) {
		if (typeof this.s[this.t - 1] != 'undefined')
			this.s[this.t - 1][2] = x;
	};
	this.g = function(x) {
		if (this.z == 'left')
		{			
			if (!$shall_no_scroll_update) 
				wheel1(0); 
			else
				$shall_no_scroll_update = false;
			if (x == 1) {
				var $sho = ($('#left_func').css('display') == 'block');
				$('#nav_wrap').html(this.s[this.t - 1][3]);
				if ($sho) $('#left_func').show(); else $('#left_func').hide();
				left_top(this.s[this.t - 1][2]);
			} else if (x == 2) {
				left_top(0);
			}
			updateMathEtc('nav_wrap');
			$('#left_wrap .button').removeClass('current');
			$('#left_wrap .button i').removeClass('current');
			makeScroll('#nav', updateNav, true);
			apply_status($('#nav .tup').is(':visible'), $('#n_pgup_button'));
			apply_status($('#nav .tdown').is(':visible'), $('#n_pgdn_button'));
			apply_vis($('#nav .tup').is(':visible'), $('#qab'));
			apply_vis($('#nav .tdown').is(':visible'), $('#qac'));
			apply_status(this.a(), $('#n_back_button'));
			apply_status(this.e(), $('#n_fwd_button'));
			apply_vis(this.a(), $('#qda'));
			apply_vis(this.e(), $('#qdb'));
			syncActiveTopic(false);
			fitLeftPanel();
			if (is_good_for_live()) {
				$('#num_online').show();
			} else {
				$('#num_online').hide();
			}
		} 
		else 
		{
			wheel2(0);
			if (x == 1) {
				var $sho = (($('#mid_func').css('display') == 'block') || ($('#mid_func_user').css('display') == 'block'));
				$('#text_wrap').html(this.s[this.t - 1][3]);
				if ($sho)	{
					$('#mid_func').show();
					$('#mid_func_user').show();
					$('#mid_core').show();
				} else {
					$('#mid_func').hide();
					$('#mid_func_user').hide();
					$('#mid_core').hide();
				}
				mid_top(this.s[this.t - 1][2]);
				makeHash();
			} else if (x == 2) {
				mid_top(0);
			}
			updateMathEtc('text_wrap');
			clearPost(false);
			setTitle();
			$('#mid_wrap .button').removeClass('current');
			$('#mid_wrap .button i').removeClass('current');
			makeScroll('#post', updateText, true);
			apply_status($('#post .tup').is(':visible'), $('#t_pgup_button'));
			apply_status($('#post .tdown').is(':visible'), $('#t_pgdn_button'));
			apply_vis($('#post .tup').is(':visible'), $('#qbb'));
			apply_vis($('#post .tdown').is(':visible'), $('#qbc'));
			apply_status(this.a(), $('#t_back_button'));
			apply_status(this.e(), $('#t_fwd_button'));
			apply_vis(this.a(), $('#qdc'));
			apply_vis(this.e(), $('#qdd'));
			updatePostMsg();
			cancelModifyTitle();			
			syncActiveTopic();
			fitMidPanel();
		}
	};
	this.b = function() {
		if (!this.a()) return '';
		this.t--;
		this.g(1);
	};
	this.f = function() {
		if (!this.e()) return '';
		this.t++;
		this.g(1);
	};
	this.a = function() {
		return (this.t > 1);
	};
	this.e = function() {
		return (this.t < this.s.length);
	};
}

function join() {
	var $buf = arguments[1];
	for(var i = 1; i < arguments.length; i++) {
		$buf += ' ' + arguments[i];
	}
	return $buf;
}

function focus(a) {
	setTimeout(function(){a.putCursorAtEnd()},0);
}

function stopAll(e) {
	e.stopPropagation(); e.preventDefault();
}

function getTarget(e) {
	if (e.target) if (e.target.nodeType == 3) return e.target.parentNode; else return e.target;
	if (e.srcElement) return e.srcElement;
}

function hover_1(e) {
	var $target = $(e.currentTarget);
	if (e.type == 'mouseenter') 
	{
		if ($target.hasClass('disable')) return;
		if ($target.attr('id') == 'item_edit')
			$target.addClass('curspec');
		else
			$target.addClass('current');
		$target.find('i').addClass('current');
		if ($target.hasClass('tmark')) $target.removeClass('gg');
	} 
	else
	{
		if ($target.attr('id') == 'item_edit')
			$target.removeClass('curspec');
		else
			$target.removeClass('current');
		$target.find('i').removeClass('current');
		if ($target.hasClass('tmark')) $target.addClass('gg');
	}
}
function hover_1a(e) {
	if (e.type == 'mouseenter') 
	{
		$('#left_title p').addClass('current');
	} 
	else
	{
		$('#left_title p').removeClass('current');
	}	
}
function hover_1b(e) {
	if (e.type == 'mouseenter') 
	{
		$('#mid_title p').addClass('current');
	} 
	else
	{
		$('#mid_title p').removeClass('current');
	}	
}

function hover_2(e) {
	var $target = $(e.currentTarget).parent();
	if (e.type == 'mouseenter') {
		$target.find('.tmark').removeClass('gg');
		$target.find('.trep').addClass('curalt');
		$target.append('<div id="xemp"></div>');
		$('#xemp').css('width', $target.width() + 48);
	} else {
	  $target.find('.tmark').addClass('gg');
		$target.find('.trep').removeClass('curalt');
		$('#xemp').remove();
	}
}

function hover_2a(e) {
	var $target = $(e.currentTarget).parent();
	if (e.type == 'mouseenter') {
		$target.find('.tmark').removeClass('gg');
		$target.find('.trep').addClass('current');
		$target.append('<div id="xemp"></div>');
		$('#xemp').css('width', $target.width() + 48);
	} else {
	  $target.find('.tmark').addClass('gg');
		$target.find('.trep').removeClass('current');
		$('#xemp').remove();
	}
}

function hover_3(e) {
	var $target = $(e.currentTarget);
	var id = $target.attr('id');
	if (e.type == 'mouseenter') 
	{
		if (id.substr(0, 2) == 'qc') {
			$target.css('background', '#900');
		}
		else if (id.substr(0, 2) == 'qd') {
			$target.css('background', '#060');
		}
		else if (id == 'qea') {	
			clearTimeout(left_timer);
			$('#qex').css('opacity', 0.3);
		}
		else if (id == 'qfa') {
			clearTimeout(mid_timer);
			$('#qfx').css('opacity', 0.3);
		}
		else if (id.substr(2) == 'd') {	
			$target.css('background', '#900');
		}
		else {
			$target.css('background', '#060');
		}
	} 
	else
	{
		if (id == 'qea') {
			if (left_start == -1) {
				clearTimeout(left_timer);
				left_timer = setTimeout(function() { $('#qex').css('opacity', 0) },scrollbar_t);
			}
		}
		else if (id == 'qfa') {
			if (mid_start == -1) {
				clearTimeout(mid_timer);
				mid_timer = setTimeout(function() { $('#qfx').css('opacity', 0) },scrollbar_t);
			}
		}
		else
			$target.css('background', '');
	}
}

function left_x()
{
	return -($('#left_sss').height() - $(window).height() + $('#left_panel').height() - 16);
}
function mid_x()
{
	return -($('#mid_sss').height() - $(window).height() + $('#mid_panel').height() - 16);
}
function left_y()
{
	return $('#left_sss').height() + $('#left_panel').height() - 24;
}
function mid_y()
{
	return $('#mid_sss').height() + $('#mid_panel').height() - 24;
}
function fixScrollbar(o, p)
{
	var oo = (p == 'left') ? left_y() : mid_y();
	var xx = (p == 'left') ? 0 : 1; if (t4 >= 2) xx = 1 - xx;
	if (!$left_wrap.is(':visible')) xx = 1;
	var yy = (xx == 0) ? left_timer : mid_timer;
	var x = (xx == 0) ? $('#qex') : $('#qfx');
	var o1 = - o / oo * 100;
	var o2 = Math.min(100, $(window).height() / oo * 100);
	if (o2 >= 90) { x.hide(); return; }
	if (((xx == 0) ? left_start : mid_start) == -1)
	{
		clearTimeout(yy);
		if (xx == 0)
			left_timer = setTimeout(function() { x.css('opacity', 0) },scrollbar_t);
		else
			mid_timer = setTimeout(function() { x.css('opacity', 0) },scrollbar_t);
	}
	x.show().css('opacity', 0.3);
	x.css('top', o1 + '%');
	x.css('height', o2 + '%');
}
function left_top(o)
{
	apply_vis((o != 0.1) && (left_x() != 0), $('#qad'));
	if (o == 0.1)
		o = left_x();
	if (o > 0) o = 0;
	if (o <= left_x()) {
		o = left_x();
		$('#left_panel').css('box-shadow', '0px 3px 3px rgba(65,55,45,0.3)');
	} else {
		$('#left_panel').css('box-shadow', '0px -1px 3px rgba(65,55,45,0.3)');
	}
	if (o > 0) o = 0;
	/*var ox = Math.abs(parseInt($('#left_sss').css('top')) - o);
	if (isNaN(ox)) ox = 0; ox /= 2.0; if (ox > 100) ox = 100;
	$('#left_sss').stop(true, true).animate({top:o}, ox, 'linear');*/
	$('#left_sss').css('top', o);
	left_history.q(o);
	fixScrollbar(o, 'left');
}
function mid_top(o)
{
	apply_vis((o != 0.1) && (mid_x() != 0), $('#qbd'));
	if (o == 0.1)
		o = mid_x();
	if (o > 0) o = 0;
	if (o <= mid_x()) {
		o = mid_x();
		$('#mid_panel').css('box-shadow', '0px 3px 3px rgba(65,55,45,0.3)');
	} else {
		$('#mid_panel').css('box-shadow', '0px -1px 3px rgba(65,55,45,0.3)');
	}
	if (o > 0) o = 0;
	/*var ox = Math.abs(parseInt($('#mid_sss').css('top')) - o);
	if (isNaN(ox)) ox = 0; ox /= 2.0; if (ox > 100) ox = 100;
	$('#mid_sss').stop(true, true).animate({top:o}, ox, 'linear');*/
	$('#mid_sss').css('top', o);
	mid_history.q(o);
	fixScrollbar(o, 'mid');
}

function scroll($i) {
	mid_top($i);
}
function scrollNav($i) {
	if (!$first_run_left) switchView(true);
	left_top($i);
}
function scrollEnd() {
	mid_top(0.1);
}
function scrollEndNav() {
	switchView(true);
	left_top(0.1);
}

function wheel1(d) {
	var o = parseInt($('#left_sss').css('top'));
	o += d;
	left_top(o);
}
function wheel2(d) {
	var o = parseInt($('#mid_sss').css('top'));
	o += d;
	mid_top(o);
}
function wheelx(a, d) {
	if (!$left_wrap.is(':visible')) { wheel2(d); return; }
	if (a == 1)	if (t4 < 2) wheel1(d); else wheel2(d);
	else if (t4 < 2) wheel2(d); else wheel1(d);
}
function topx(a, d) {
	if (!$left_wrap.is(':visible')) { mid_top(d); return; }
	if (a == 1) if (t4 < 2) left_top(d); else mid_top(d);
	else if (t4 < 2) mid_top(d); else left_top(d);	
}
function yx(a) {
	if (!$left_wrap.is(':visible')) return mid_y();
	if (a == 1) if (t4 < 2) return left_y(); else return mid_y();
	else if (t4 < 2) return mid_y(); else return left_y();	
}

function wheel(event) {
	var e = event || window.event;
	var d = e.wheelDelta ? e.wheelDelta / 120 : -e.detail / 3;
	if ($left_wrap.is(':visible')) 
	{
		w = Math.min(e.pageX, $('#wrap').width() - e.pageX);
		if (w <= ((t4 == '1') ? 96 : 12)) d = ((d > 0) ? (pageAmt() / 120) : (-pageAmt() / 120));
		if (t4 < 2) {
			if (e.pageX <= $mid_wrap.offset().left + 3)
				wheel1(d * 120);
			else
				wheel2(d * 120);
		} else {
			if (e.pageX <= $left_wrap.offset().left + 3)
				wheel2(d * 120);
			else
				wheel1(d * 120);
		}
	}
	else 
	{
		wheel2(d * 120);
	}
	stopAll(e);
	return;
}

function updateMidCore() {
	if (($('#mid_func').is(':visible')) || ($('#mid_func_user').is(':visible')))
		$('#mid_core').show();
	else
		$('#mid_core').hide();
}
function apply_status(x, y) {
	if (!x) {
		y.addClass('disable');
		y.removeClass('current');
		y.find('i').addClass('disable');
		y.find('i').removeClass('current');
	} else {
		y.removeClass('disable');
		y.find('i').removeClass('disable');
	}
}
function apply_vis(x, y) {
	if (!x) {
		y.hide();
		//y.addClass('trans');
	} else {
		y.show();
		//y.removeClass('trans');
	}
}

function getTextNode(t)
{
	return t.contents().filter(function () {return this.nodeType == 3});
}

$.fn.leftClick = function(e) {
	var ee = {type: 'mousedown', which: 1};
	if (typeof e != 'undefined') {
		ee.shiftKey = e.shiftKey;
	}
	$(this).trigger(ee);
};

function clearSelection() {
	var sel = window.getSelection ? window.getSelection() : document.selection;
	if (sel) {
		if (sel.removeAllRanges) {
			sel.removeAllRanges();
		} else if (sel.empty) {
			sel.empty();
		}
	}
}

function isINT(n) {
	return parseInt(n) == n;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function setMinHeight() {
	$('#left_pad').css('min-height',  ($(window).height() - 80) + 'px');
	$('#mid_pad').css('min-height', ($(window).height() - 79) + 'px');
}

function autofixBox(id)
{
	var target = document.getElementById(id);
	function fitBox()
	{
		if ($(target).val() == '') {
			if (id == 'post_text')
				target.style.height = '150px';
			else
				target.style.height = '30px';
		}
		var $new = target.scrollHeight;
		if (target.clientHeight < $new) {
			target.style.height = ($new + ((typeof $.browser.mozilla != 'undefined') ? 10 : 0)) + "px";
		}
	}
	target.oninput = fitBox;
	fitBox();
	$(window).resize(fitBox);
}

function myGet(task_name, post_msg, post_func, post_xtra) {
	post_msg.a = 'get';
	post(task_name, post_msg, function(msg) 
	{
		if (msg)
		{
			post_func(msg);
			if (post_xtra != null) post_xtra();
		}
	});
}
function post(task_name, post_msg, post_func) {
	job_begin(task_name);
	$.post('post_db.php', post_msg, function (msg)
	{
		post_func(msg);
		job_end(task_name);
	});
}

function ws_post(task_name, post_msg, post_func) {
	if ($socket.readyState != 1) {
		post_func('WebSocket server disconnected or unavailable. Try refreshing page.');
		return;
	}
	job_begin(task_name);
	post_msg.id = $socket_uid;
	$socket.send(JSON.stringify(post_msg));
	$socket_callback[$socket_uid] = function(msg) {
		post_func(msg);
		job_end(task_name);
	}
	$socket_uid++;
}

function goNav($topic, $begin) {
	if ((typeof $topic == 'undefined') && (typeof $begin == 'undefined')) {
		post('nav', {a: 'ge0'}, updateNav);
		scrollNav(0);
		return;
	}
	$shall_focus_search = $('#search_text').is(':focus');
	var $req = {};
	if (typeof $topic != 'undefined') if ($topic.length > 0) $req.n = $topic;
	if (typeof $begin != 'undefined') if ($begin.length > 0) $req.begin = $begin;
	myGet(join('nav', $topic, $begin), $req, updateNav, null);
	if (typeof $topic == 'undefined') scrollNav(0);
}

function goTopic($topic, $begin, $scroll_to_end) {
	$shall_focus_post = $('#post_text').is(':focus');

	myGet(join('topic', $topic, $begin), {n:$topic, begin:$begin}, updateText, function () {
		if (typeof $scroll_to_end != 'undefined') {
			if ($scroll_to_end) scrollEnd(); 
		}
	});
}

function refreshNav() {
	goNav($('#nav').attr('type') + $('#nav').attr('topic'), $('#nav').attr('begin'));
}
function refreshTopic() {
	
}

function updateNav(msg, partial)
{
	msg2HTML(msg);
	if (typeof partial == 'undefined') switchView(true);	
	markUp('nav');
	
	if ($shall_focus_search) {
		$shall_focus_search = false;
		focus($('#search_text'));
	}

	if (typeof partial != 'undefined') $shall_no_scroll_update = true;
	left_history.p();

	if ((typeof partial == 'undefined') && (!$first_run_left)) updateGAQ('update-nav');	
	$first_run_left = false;
}

function updateText(msg)
{
	enableHistory();
	msg2HTML(msg);
	$mid_wrap.show();
	$('#post_title').hide();
	$('#mid').show();

	markUp('mid');
	
	makeHash();
	updateMiscButton();
	updateTopicTitle();
	if ($shall_focus_post) {
		$shall_focus_post = false;
		//focus($('#post_text'));
	}

	mid_history.p();
	
	if (!$first_run_mid) updateGAQ('update-text'); 
	$first_run_mid = false;
}
		
function makeScroll(target, post_func, par) {
	function _makeScroll(direction, ctrl) {
		if ($(target).attr('type') == 'x') return;
		var $begin = 0; var $limit = 0; var $anchor = 0;
		if (direction == -1)
		{
			$begin = $(target).attr('up');
			$limit = $(target).attr('begin') - $(target).attr('up');
			$anchor = $(target + ' .item:first').attr('n');
			if ($limit == $(target).attr('down') - $(target).attr('begin')) $limit = 0;
		}
		else
		{
			$begin = $(target).attr('down');
			$anchor = $(target + ' .item:last').attr('n');
		}
		var $call = {n: $(target).attr('type') + $(target).attr('topic'), begin: $begin};
		if (par) {
			if (!ctrl) $call.par = 1;
		}
		else {
			if (ctrl) $call.par = 1;
		}
		if ($limit > 0) $call.limit = $limit;
		if ($anchor > 0) $call.r = $anchor;
		myGet(join('shift', $(target).attr('id'), direction), $call, post_func, function () { });
	}
	if ($(target).attr('up') > 0) {
		$(target + ' .item:first').before('<span class="tup">&#9650;</span>');
	}
	if ($(target).attr('down') > 0) {
		$(target + ' .item:last').before('<span class="tdown">&#9660;</span>');
	}
	$(target + ' .tup').on('mousedown', function (e, a) {_makeScroll(-1, a)});
	$(target + ' .tdown').on('mousedown', function (e, a) {_makeScroll(+1, a)});
}

function switchView(force_full) {
	if (($left_wrap.is(':visible')) && (!force_full)) {
		var a = 0;
		if ($('#post_title').is(':visible'))
			a = $mid_wrap.width() - $('#post_text').width();
		else
			a = $mid_wrap.width() - $('.pwrap p').width();
		var b = parseInt($('#user_button').css('font-size'));
		$left_wrap.hide();
		var ww = (a + b * 46);
		$mid_wrap.css('width', ww + 'px');
		$mid_wrap.css('left', '50%');
		$mid_wrap.css('margin-left', '-' + (ww/2) + 'px');
		$mid_wrap.css('padding-left', '0');
		$mid_wrap.css('padding-right', '0');
		$('#qcx, #qdx').css('left', '0');
		$('#qcx, #qdx').css('width', '100%');
		$('#qcx, #qdx').css('padding', '0 0 0 0');
		$('#qca, #qdt').hide();
		wheel1(0); wheel2(0);
	} else {
		$mid_wrap.css('width', mww + '%');
		$('#qcx, #qdx').css('width', mww + '%');
		fixPanel();
		$('#qca, #qdt').show();
		$left_wrap.show();
		wheel1(0); wheel2(0);
	}
	fitMidPanel();
}

function fitMidPanel() {
	if ($('#mid_sss').width() > 0)
		$('#mid_panel').css('width', $('#mid_sss').width());
}
function fitLeftPanel() {
	if ($('#left_sss').width() > 0)
		$('#left_panel').css('width', $('#left_sss').width());
}

function curTopic() {
	return $('#post').attr('topic').split('_')[0];
}

function goHash() {
	var words = window.location.hash.split('/');
	var $to_type = words[0];
	var $to_topic = words[1];
	var $to_reply = (words[2]) ? words[2] : 1;
	if (isINT($to_topic) && isINT($to_reply))
	{
		var $this_type = $('#post').attr('type');
		var $this_topic = $('#post').attr('topic');
		var $this_reply = $('#post').attr('begin');
		if ($to_type == '#topic')
		{
			$to_type = '';
		}
		else if ($to_type == '#user')
		{
			$to_type = 'u';
		}
		if (($this_type != $to_type) || ($to_topic != $this_topic) || ($to_reply != $this_reply))
		{
			goTopic($to_type + $to_topic, $to_reply);
			if ($to_type == 'u') return 'u';
			return true;
		}
	}
	return false;
}

function makeHash() {
	if ($('#post').length <= 0) return;
	var $this_type = $('#post').attr('type');
	if ($this_type == '')
		$this_type = 'topic';
	else if ($this_type == 'u')
		$this_type = 'user';
	var $this_topic = $('#post').attr('topic');
	var $this_reply = $('#post').attr('begin');
	if ((!$this_reply) || ($this_reply == 1))
	{
		window.location.hash = $this_type + '/' + $this_topic;
	} else {
		window.location.hash = $this_type + '/' + $this_topic + '/' + $this_reply;
	}
}
function dummyGo(e, n, $begin) {
	var $to_topic = n;
	var $to_topic_hash = $to_topic;
	var $to_type_hash = 'topic';
	if (getNavRealType() == 'u')
	{
		$to_topic = 'u' + $to_topic;
		$to_type_hash = 'user';
	}
	if (e.shiftKey)
	{
		window.open('#' + $to_type_hash + '/' + $to_topic_hash + '/' + $begin);
	}
	else
	{
		goTopic($to_topic, $begin);
	}
}
	
// current #post types: '' [topic], 'u' [user], 'x' [writing]
function getNavRealType()
{
	var $type = $('#nav').attr('type');
	if (($type == 'u') || ($type == 'v') || ($type == 'w') || ($type == 'b'))
		return 'u';
	if (($type == 't') || ($type == 'c'))
		return 't';
	return '';
}
function getRealGoal()
{
	var $type = $('#nav').attr('type');
	if ((($type == 'p') || ($type == 'q')) && ($('#post').attr('type') == 'u')) return 'u';
	return getNavRealType();
}
function matchTypeBothSide()
{
	if ($('#post').attr('type') == getNavRealType())
		return true;
	return false;
}
function sameTopic($to_topic)
{
	if ($to_topic != curTopic()) return false;
	if (!matchTypeBothSide()) return false;
	return true;
}
function syncActiveTopic(x)
{
	$('#nav .item p').removeClass('current');
	if (matchTypeBothSide())
	{
		$('#nav .item[n=' + curTopic() + '] p').addClass('current');
		if (typeof x == 'undefined')
		{
			$('#nav .item[n=' + curTopic() + '] .trep').text($('#post').attr('cnt'));
		}
	}
	$.each($('#nav .trep'), function () {
		if (parseInt($(this).text()) > 0) $(this).removeClass('white'); else $(this).addClass('white');
	});
	var $tmp = $('#left_title p').text();
	updateCreateButton();
}
function updateMathEtc(str)
{
	if (typeof MathJax != 'undefined') if (typeof MathJax.isReady != 'undefined') if (MathJax.isReady)
	{
		MathJax.Hub.Queue(['Typeset', MathJax.Hub, document.getElementById(str)]);
	}
	if (typeof prettyPrint != 'undefined') prettyPrint();
}

function markUpX($item, $type)
{
	if ($item.find($type ? '.pwrap' : 'p').height() > 25) {
		$item.find('.tmark').css('top', '17px');
		$item.find('.txa').css('top', '12px');
	} else {
		$item.find('.tmark').css('top', '');
		$item.find('.txa').css('top', '');
	}
}
function markUp($str)
{
	if ($str == 'mid') {
		markUpX($('#mid_desc'), true);
		$('#post .item').each(function (i){
			markUpX($(this), true);
		});
	} else {
		$('#nav .item').each(function (i){
			markUpX($(this), false);
		});
	}
}
function xx(s, n) 
{
	var i = -1;
	while (n-- > 0 && -1 != (i = s.indexOf(',', i + 1)));
	return s.substring(i + 1);
}
function msg2txt(str)
{
	var i = 0, j = 0, jj = 0;
	
	i = str.indexOf('http'); j = i;
	while (i >= 0) {
		j = i;
		if ((str.substr(i+4,3)=='://') || (str.substr(i+4,4)=='s://'))
		{
			if ((i == 0) || (str.charAt(i-1)==' ') || (str.substr(i-6,6)=='<br />') || (str.charAt(i-1)=='(')) {
				j = 99999999999;
				jj = str.indexOf(' ', i+4); if (jj >= 0) j = Math.min(j, jj);
				jj = str.indexOf('<br />', i+4); if (jj >= 0) j = Math.min(j, jj);
				jj = str.indexOf(')', i+4); if (jj >= 0) j = Math.min(j, jj);
				if (j == 99999999999) j = str.length;
				var x = str.charCodeAt(j - 1);
				if (((x >= 65) && (x <= 90)) || ((x >= 97) && (x <= 122)) || ((x >= 47) && (x <= 57)))
					j = j;
				else
					j--;
				if (j > i)
					str = str.substring(0, i)
						+ '<a href="' + str.substring(i, j) + '" target="_blank" class="qhref">' + str.substring(i, j) + '</a>' 
						+ str.substr(j);
			}
		}
		i = str.indexOf('http', j + 1);
	}
	
	i = str.indexOf('@'); j = i;
	while (i >= 0) {
		j = i;
		if ((i == 0) || (str.charAt(i-1)==' ') || (str.substr(i-6,6)=='<br />') || (str.charAt(i-1)=='(')) {
			j = 99999999999;
			jj = str.indexOf(' ', i+1); if (jj >= 0) j = Math.min(j, jj);
			jj = str.indexOf('<br />', i+1); if (jj >= 0) j = Math.min(j, jj);
			jj = str.indexOf(')', i+1); if (jj >= 0) j = Math.min(j, jj);
			if (j == 99999999999) j = str.length;		
			if (j > i+1) {
				str = str.substring(0, i) 
				+ '<span class="hover qname">' + str.substring(i, j) + '</span>' 
				+ str.substr(j);
			}
		}
		i = str.indexOf('@', j + 1);
	}
	
	i = str.indexOf('#'); j = i;
	while (i >= 0) {
		j = i;
		if ((i == 0) || (str.charAt(i-1)==' ') || (str.substr(i-6,6)=='<br />') || (str.charAt(i-1)=='(')) {
			j = 99999999999;
			jj = str.indexOf(' ', i+1); if (jj >= 0) j = Math.min(j, jj);
			jj = str.indexOf('<br />', i+1); if (jj >= 0) j = Math.min(j, jj);
			jj = str.indexOf(')', i+1); if (jj >= 0) j = Math.min(j, jj);
			if (j == 99999999999) j = str.length;
			var $type = 1;
			if (str.charAt(i+1) == '#') { $type = 2; }
			if (j > i + $type) {
				if (isINT(str.substring(i + $type, j)))
				{
					str = str.substring(0, i) 
					+ '<span class="hover ' + (($type == '1') ? 'qref' : 'qret') + '">' 
					+ str.substring(i, j) + '</span>' 
					+ str.substr(j);
				}
			}
		}
		i = str.indexOf('#', j + 1);
	}
	
	str = str.split('<br /><br />').join('</p><p>');
	str = str.split('\\{<br />').join('\\{').split('<br />\\}').join('\\}');
	str = str_go(str, '[b]', '[/b]', '<b>', '</b>');
	str = str_go(str, '[u]', '[/u]', '<u>', '</u>');
	str = str_go(str, '[i]', '[/i]', '<i>', '</i>');
	str = str_go(str, '[sgu]', '[/sgu]', '<span class="aaa signup_now">', '</span>');
	str = str_go(str, '\\{', '\\}', '<code class="prettyprint linenums">', '</code>');
	str = str.split('  ').join('&nbsp;&nbsp;');
	return '<p>' + str + '</p>';
	/*
	var limit = 5000;
	if (str.length > limit) {
		return '<p>' + str.substr(0, limit) + '</p><p><span class="button more" onmousedown="'
			+ "this.parentNode.nextSibling.className = ''; this.parentNode.className += ' hidden';"
			+ '">...</span></p><div class="hidden"><p>' + str.substr(limit) + '</p></div>';
	}	else {
		return '<p>' + str + '</p>';
	}*/
}
function txt2msg($txt)
{
	return htmlspecialchars_decode($txt).split('<br />').join('\n').split('<p></p>').join('\n\n');
}
function inp2mar($txt)
{
	return htmlspecialchars($txt).split('\n\n').join('<p></p>').split('\n').join('<br />');
}

function msg2HTML(str)
{
	var r = str.split('<>'); var out = ''; var x = [], y = [], z = [], zz = []; var i = 0;
	var begin = 0, up = 0, down = 0;
	
	var is_full = (r[0].substr(3, 1) != 'x');
	var is_post = (r[0].substr(0, 3) == 'pos');
	var is_user = (r[0].substr(0, 3) == 'use');
	var is_list = (r[0].substr(1, 2) == 'is');
	
	var head = is_full ? (is_post ? 3 : 2) : 1; 
	if (is_list) head = is_full ? 2 : 1;
	
	if (r[0] == 'x001')
	{
		is_full = true; is_post = true;
		out = '<div id="mid_title" class="title"><p class="hover">Non-existent Topic</p>';
	}
	else if (r[0] == 'y001')
	{
		is_full = true; is_post = true;
		out = '<div id="mid_title" class="title"><p class="hover">Hidden Topic</p>';
	}
	else if (r[0] == 'x002')
	{
		is_full = true; is_user = true;
		out = '<div id="mid_title" class="title"><p class="hover">Non-existent User</p>';
	}
	else if (r[0] == 'x003')
	{
		is_full = true; is_list = true;
		out = '<div id="left_title" class="title"><p><span class="aaa signup_now" style="font-size:17px">Sign up</span> or <span class="aaa signin_now" style="font-size:17px">sign in</span> to search.</p>';
	}
	else
	{
		if (is_post)
			y = r[head].split(',', 7);
		else if (is_user)
			y = r[head].split(',', 6);
		else if (is_list)
			y = r[head].split(',', 5);
		begin = parseInt(y[2]); up = parseInt(y[3]); down = parseInt(y[4]);

		if (is_full)
		{
			if (is_post) {
				x = r[1].split(',', 5); var $txt = xx(r[1], 5); mid_raw[-parseInt(y[1].split('_')[0])] = $txt;	mid_raw[x[0]] = r[2];
				out = '<div id="mid_title" class="title"><p class="hover">';
				out = out + $txt + '</p></div><div id="mid_desc" class="item" n='
					+ x[0] + ' by=' + x[1] + '><span class="tmark gg" title="' + x[2] + ' #' + x[0] + '" style="background-image:url('
					+ ((x[3] == '1')?('icon/' + x[1] + '_32.png'):('icon/0_32.png')) 
					+ ')"></span><span class="trep white">0</span><span class="txa">'
					+ x[2] + '</span><div class="pwrap">' + msg2txt(r[2]) + '</div></div>';
				out = out + '<div id="post" type="' + y[0] + '" topic="' + y[1] + '" begin=' + y[2] 
					+ ' up=' + y[3] + ' down=' + y[4] + ' cnt=' + y[5] + ' by=' + y[6] + ' s=' + x[4] + '>';
			} else if (is_user) {
				z = r[1].split(',', 6); zz = xx(r[1], 6).split('^', 4);
				out = '<div id="mid_title" class="title"></div>';
				out = out + '<div id="post" type="' + y[0] + '" topic="' + y[1] + '" begin=' + y[2] 
					+ ' up=' + y[3] + ' down=' + y[4] + ' cnt=' + y[5] + '>';				
			} else if (is_list) {
				out = '<div id="left_title" class="title"><p class="hover">' + r[1] + '</p></div>';
				out = out + '<div id="nav" type="' + y[0] + '" topic="' + y[1] + '" begin=' + y[2]
					+ ' up=' + y[3] + ' down=' + y[4] + '>';
			}
		}
		if (((is_user) || (is_list)) && (r.length <= head + 1))
		{
			if (r[1].indexOf('Adding Topic to List') >= 0)
				out = out + '<div class="item"><p>No more lists to add. <a href="javascript:void(0)"><u id="tmp_create">Create</u></a> new?</p></div>';
			else {
				if (is_list)
					out = out + '<div class="item"><p>None at the moment.</p></div>';
				else
					out = out + '<div class="item"><div class="pwrap"><p>None at the moment.</p></div></div>';
			}
		}
		for (i = head + 1; i < r.length; i++)
		{
			var n = i + begin - (head + 1);
			if (r[i] == '') {
				out = out + '<div class="item">'
					+ (is_list ? '' : '<span class="frep">' + n + '</span>')
					+ '<p style="color:#ddd">[Hidden]</p></div>';
				continue;
			}
			if (is_post) {
				x = r[i].split(',', 4);	var $txt = xx(r[i], 4);	mid_raw[x[0]] = $txt;
				out = out + '<div class="item" n=' + x[0] + ' by=' + x[1] + '><span class="tmark gg" title="'
					+ x[2] + ' #' + x[0] + '" style="background-image:url(' + ((x[3] == '1')?('icon/' + x[1] + '_32.png'):('icon/0_32.png')) 
					+ ')"></span><span class="trep">' + n + '</span><span class="txa">'
					+ x[2] + '</span><div class="pwrap">' + msg2txt($txt) + '</div></div>';
			} else if (is_user) {
				x = r[i].split(',', 5);	var $txt = xx(r[i], 5);	mid_raw[x[0]] = $txt;
				out = out + '<div class="item" n=' + x[0] + ' r=' + x[1]  + ' by=' + x[2]
					+ '><span class="tmark gg" title="'
					+ x[3] + ' #' + x[0] + '" style="background-image:url(' + ((x[4] == '1')?('icon/' + x[2] + '_32.png'):('icon/0_32.png'))
					+ ')"></span><span class="trep' 
					+ ((parseInt(x[1]) == 0) ? ' green' : (parseInt(x[1]) < 0 ? ((-x[1] == x[2]) ? ' red' : ' dark') : ''))
					+ '">' + n + '</span><span class="txa">'
					+ x[3] + '</span><div class="pwrap">' + msg2txt($txt) + '</div></div>';
			} else if (r[0].substr(0,3) == 'lis') {
				x = r[i].split(',', 7);	var $txt = xx(r[i], 7);	left_raw[x[0]] = $txt;
				out = out + '<div class="item" n=' + x[0] + ' by=' + x[1] + ' h=' + x[5] + ' s=' + x[6] + '><span class="tmark gg" title='
					+ x[2] + ' style="background-image:url(' + ((x[3] == '1')?('icon/' + x[1] + '_32.png'):('icon/0_32.png')) 
					+ ')"></span><span class="trep">' + x[4] + '</span><span class="txb">'
					+'</span><p>'	+ $txt + modTitle(3.14, x[6]) + '</p></div>';
			} else if (r[0].substr(0,3) == 'uis') {
				x = r[i].split(',', 4);	var $txt = xx(r[i], 4);	left_raw[x[0]] = $txt;
				out = out + '<div class="item" n=' + x[0] + '><span class="tmark gg" title='
					+ x[1] + ' style="background-image:url(' + ((x[2] == '1')?('icon/' + x[0] + '_32.png'):('icon/0_32.png'))
					+ ')"></span><span class="trep">' + x[3] + '</span><p>' + $txt + '</p></div>';
			} else if (r[0].substr(0,3) == 'tis') {
				x = r[i].split(',', 5);	var $txt = xx(r[i], 5);	left_raw[x[0]] = $txt;
				out = out + '<div class="item" n=' + x[0] + ' by=' + x[1] + '><span class="tmark gg" title='
					+ x[2] + ' style="background-image:url(' + ((x[3] == '1')?('icon/' + x[1] + '_32.png'):('icon/0_32.png')) 
					+ ')"></span><span class="trep">' + x[4] + '</span><span class="txb">'
					+ x[2] + '</span><p>'	+ $txt  + '</p></div>';
			}
		}
	}
	if (is_list)
	{
		if (is_full)
		{
			var $sho = ($('#left_func').css('display') == 'block');
			$('#nav_wrap').html(out + '</div>');
			$('#left_title').append($left_func);
			if ($sho) $('#left_func').show(); else $('#left_func').hide();
		}
		else
		{
			$('#nav .tup').remove();
			$('#nav .tdown').remove();
			if (begin < parseInt($('#nav').attr('begin')))
			{
				$('#nav').prepend(out);
				$('#nav').attr('begin', begin);
				$('#nav').attr('up', up);
			}
			else
			{
				$('#nav').append(out);
				$('#nav').attr('down', down);
			}				
		}
		$('#left_title p').attr('title', 'Click to toggle functions');
	}
	else
	{
		if (is_full)
		{
			var $sho = (($('#mid_func').css('display') == 'block') || ($('#mid_func_user').css('display') == 'block'));
			$('#text_wrap').html(out + '</div>');
			if (is_post) $($mid_func).appendTo('#mid_title');
			
			if (is_user) {
				var $lg = '<span class="hover xxc signin_now"><i class="icon-signin"></i> Sign in</span>\
<span class="hover xxc signup_now"><i class="icon-trophy"></i> Sign up</a>';
				$('#mid_title').html($mid_title_user_inner);
				$('#followers_button').text('[Followers ' + z[3] + ']');
				$('#following_button').text('[Following ' + z[4] + ']');
				$('#mid_title p').text(z[1]);
				$('#user_img').css('background-image', 'url(' + ((z[2] == '1')?('icon/' + curTopic() + '_64.png'):('icon/0_64.png')) + ')');
				getTextNode($('#user_location')).replaceWith(' ' + zz[0]);
				getTextNode($('#user_education')).replaceWith(' ' + zz[1]);
				getTextNode($('#user_major')).replaceWith(' ' + zz[2]);
				getTextNode($('#user_hobby')).replaceWith(' ' + zz[3]);
				z[0] = parseInt(z[0]); var $zz = ''; z[5] = parseInt(z[5]);
				if (z[0] > 0) 
				{
					$zz += '<div class="button xxc" id="tu_topic_button"><i class="icon-th-large"></i> Threads</div>\
<div class="button xxc" id="tu_post_button"><i class="icon-th"></i> Replies</div>\
<div class="button xxc" id="tu_list_button"><i class="icon-list"></i> Lists</div>';
					if (z[0] > 1) 
					{
						if (z[0] != 3) {
						$zz += '<a class="hover xxc" href="account.php?a=icon" target="_blank"><i class="icon-user"></i> Icon</a>\
<a class="hover xxc" href="account.php?a=email" target="_blank"><i class="icon-envelope"></i> Email</a>\
<a class="hover xxc" href="account.php?a=change" target="_blank"><i class="icon-key"></i> Password</a>\
<div class="button xxc" id="logoff_button"><i class="icon-signout"></i> Log off</div>';
						}
						else {
							$zz += $lg;
						}
					}
					else 
					{
						$zz += '<div class="button xxc" id="follow_button">'
							+ ((z[5] == 0) ? ('<i class="icon-plus-sign"></i> Follow') : ('<i class="icon-minus-sign"></i> Unfollow'))
							+ '</div>';
					}
				} 
				else 
				{
					$zz += $lg;
				}
				$('#mid_func_user').html($zz);
			}
			if ($sho)	{
				$('#mid_func').show();
				$('#mid_func_user').show();
				$('#mid_core').show();
			} else {
				$('#mid_func').hide();
				$('#mid_func_user').hide();
				$('#mid_core').hide();
			}
		}
		else
		{
			$('#post .tup').remove();
			$('#post .tdown').remove();
			if (begin < parseInt($('#post').attr('begin')))
			{
				$('#post').prepend(out);
				$('#post').attr('begin', begin);
				$('#post').attr('up', up);
			}
			else
			{
				$('#post').append(out);
				$('#post').attr('down', down);
			}
		}
		$('#mid_title p').attr('title', 'Click to toggle functions');
	}
	if (is_full) {
		setMinHeight();
	}
}
function cancelCreateList()
{
	$('#create_text').val('');
	$('#create_msg').html('');
	$('#left_create').hide();
	updateCreateButton();
}
function cancelItemFunc()
{
	$('#item_func').hide();
	$('#item_text_wrap').remove();
	$('#item_func').next().find('.pwrap').show();
}
function cancelModifyTitle()
{
	$('#title_msg').hide();
	$('#title_deco').remove();
	$('#mid_title p').show();
	getTextNode($('#t_ren_button')).replaceWith(' Rename');
}
function cancelModifyList()
{
	$('#modify_text').val('');
	$('#modify_msg').html('');
	$('#left_modify').removeClass('xyz');
	$('#modify_msg').css('margin-top', '');
	getTextNode($('#modify_delete')).replaceWith(' Delete');
}
function disableHistoryButton()
{
	$('#t_back_button').hide();
	$('#t_fwd_button').hide();
	$('#qdc').hide();
	$('#qdd').hide();
}
function enableHistory()
{
	$('#t_back_button').show();
	$('#t_fwd_button').show();
	$('#qdc').show();
	$('#qdd').show();
}

function cancelCreate()
{
	if ($('#post').attr('type') == 'x')
	{
		if ((is_guest()) && ($('#left_title p').text() == 'Limbo')) goNav();
		enableHistory();
		if (!$('#user_img').is(':visible'))
			$('#post').attr('type', '');
		else {
			$('#post').attr('type', 'u');
		}
		updatePostMsg();
		clearPost(false);
		$('#post_title').hide();
		$('#post_text').blur();
		$('#mid').show();
		$('#fullview_button_2').hide();
		$('#page_top_button').show();
		$('#mid_panel_wrap').css('top', '');
		$('#mid_panel').css('padding-top', '');
		setTitle();
	}
	updateCreateButton();
	syncActiveTopic(false);
	updateMiscButton();
	updateMidCore();
}
function updateMiscButton()
{
	$('#sage_button').show();
	$('#hide_button').hide();
	$('#lock_button').hide();
}
function updateCreateButton()
{
	getTextNode($('#create_button')).replaceWith(' Create');
	var $tmp = $('#left_title p').text();
	if (($tmp == 'Threads') || ($tmp == 'My Threads')
		|| ($tmp == 'Lists') || ($tmp == 'My Lists') || ($tmp == 'Users') || ($tmp == 'Limbo'))
		$('#create_button').show();
	else
		$('#create_button').hide();
	if (($('#post').attr('type') == 'x') || ($('#left_create').is(':visible')))
		$('#create_button').hide();
}
function updateGAQ(action)
{
	if (typeof _gaq != 'undefined') _gaq.push(['_trackPageview', '/' + action]);
}
function setTitle(str)
{
	if (typeof str != 'undefined')
		document.title = str;
	else {
		var bb = parseInt($('#post').attr('begin'));
		var cc = parseInt($('#post').attr('cnt'));
		if (bb > cc) bb = cc;
		document.title = $('#mid_title p').text() + ((cc==0)?'':(' [' + bb + '/' + cc + ']'));
	}
}
function updateNavTitle(x, y)
{
	var target = $('#nav .item[n=' + x + '] p');
	target.find('.p_spec').remove();
	if (typeof y == 'undefined') {
		modTitle(target, target.attr('s'));
	} 
	else
	{
		target.attr('s', y);
		modTitle(target, target.attr('s'));
	}
}
function modTitle(a, b)
{
	b = parseInt(b);
	var s = '';
	if (b == 2) s = ' (Locked)';
	else if (b == 4) s = ' (Hidden)';
	else if (b == 1) s = ' (Sticky)';
	s = '<span class="p_spec">' + s + '</span>';
	if (a == 3.14) return s;
	a.append(s);
}
function updateTopicTitle()
{
	$('#title_msg').hide();
	if ($('#post').attr('type') == '')
	{
		var ss = $('#post').attr('s');
		$('#mid_title .p_spec').remove();
		
		modTitle($('#mid_title p'), ss);
		
		if ($('#post').attr('topic').indexOf('_') >= 0) {
			$('#mid_title p').append('<i class="p_spec"> (Focus : ' + $('#post .item:first > .txa').text() + ')</i>');
		}
		if (curUser() == $('#post').attr('by')) {
			if (ss == 2) {
				$('#t_lock_button').html('<i class="icon-unlock"></i> Unlock');
				$('#t_lock_button').show();
				$('#t_hide_button').hide();
			}
			else if (ss == 4) {
				$('#t_hide_button').html('<i class="icon-eye-open"></i> Unhide');
				$('#t_lock_button').hide();
				$('#t_hide_button').show();
			}
			else{
				$('#t_lock_button').html('<i class="icon-lock"></i> Lock');
				$('#t_hide_button').html('<i class="icon-eye-close"></i> Hide');
				$('#t_lock_button').show();
				$('#t_hide_button').show();
			}
		} else {
			$('#t_lock_button').hide();
			$('#t_hide_button').hide();			
		}
	}
}

function refresh($topic) {
	if (typeof $topic == 'undefined')
	{
		goTopic(1, 0); // always go to 'homepage'
		$('#search_text').val(''); 
		$('#search_text').blur();
		$('#post_text').blur();
	}
	else
	{
		goTopic($topic, 0);
	}
	goNav();
	scroll(0);
}

function updatePostMsg()
{
	var m = ''; var n = ': feel free to express your opinion in a civilized way.';
	var x = $('#user_button').text().substr(1);
	if ($('#post').attr('type') == 'u')
	{
		var y = $('#mid_title p').text();
		if (x == y) {
			m = 'Talk to myself'; n = '';
		} else {
			m = 'Talk to @' + y;
		}
	} else {
		m = 'Post as ' + x;
	}

	var xx = '<span class="button" id="preview_button" style="margin:0 8px"><i class="icon-bar-chart"></i> Preview</span><div style="float:right; margin-right:36px;">';
	if (x.toLowerCase() == 'guest') {
		var yy = "Guest cannot bump threads. ";
		if ($('#post').attr('type') == 'x') yy = "Guest's thread goes to Limbo. "
		$('#post_msg').html(xx + yy + 'Online: <span class="num_online">' + $num_online + '</span> users. <span style="margin-left:16px" class="aaa signup_now">Sign up</span><span style="margin-left:24px" class="aaa signin_now">Sign in</span></div>');
	}
	else
		$('#post_msg').html(xx + 'Ctrl+Enter to quick post. Online: <span class="num_online">' + $num_online + '</span> users.</div>');

	$('#post_text').attr('placeholder', m + n);
}

function clearPost($partial) {
	if (typeof $partial == 'undefined')
	{
		$('#post_text').val('');
	}
	$('#post_title').val('');
	$('#cancel_button').hide();
	$('#post_button').show();
	updatePostMsg();
	$('#sage_button').addClass('inactive');
	$('#hide_button').addClass('inactive');
	$('#lock_button').addClass('inactive');
	$('#post_text').blur();
	$('#mid_panel_wrap').css('top', '');
	$('#mid_panel').css('padding-top', '');
}

function myTag(n) {
	if (!job_free) return;
	post(join('tagging', n), {a:'xta', n:curTopic() + '_' + n}, function(msg) 
	{
		if (msg > 0)
		{
			refreshNav();
		}
	});
}

function delayGo(e, $t, $b) {
	if (!job_free) return;
	post(join('number', $t, $b), {a:'q01', n:$t, begin:$b}, function(msg) 
	{
		if (msg > 0)
		{
			dummyGo(e, $t, -msg);
		}
	});
}

function fixPanel() {
	$('#mid_wrap').css('left', '6px');
	if (t4 < 2) {
		$left_wrap.css('margin-left', 0);
		$left_wrap.css('padding-left', ((t4 % 2 ==1)?'96px':'0'));
		$left_wrap.css('padding-right', 0);
		$mid_wrap.css('margin-left', lww + '%');
		$mid_wrap.css('padding-left', '6px');
		$mid_wrap.css('padding-right', (t4 % 2 ==1)?'108px':'12px');
		$('#qcx, #qdx').css('left', lww + '%');
		$('#qcx, #qdx').css('padding', '0 5px 0 12px');
		$('#qct, #qdt').css('left', '6px');
		$('#qct, #qdt').css('padding', '0');
	} else {
		$mid_wrap.css('margin-left', 0);
		$mid_wrap.css('padding-left', ((t4 % 2 ==1)?'96px':'0'));
		$mid_wrap.css('padding-right', 0);
		$left_wrap.css('margin-left', mww + '%');
		$left_wrap.css('padding-left', '6px');
		$left_wrap.css('padding-right', (t4 % 2 ==1)?'108px':'12px');
		$('#qcx, #qdx').css('left', '6px');
		$('#qcx, #qdx').css('padding', '0');
		$('#qct, #qdt').css('left', mww + '%');
		$('#qct, #qdt').css('padding', '0 5px 0 12px');
	}
}

function updateCSS() {
	var t1 = $('#user_css_font').children().not('.inactive').index();
	var t2 = $('#user_css_fontsz').children().not('.inactive').index();
	var t3 = $('#user_css_line').children().not('.inactive').index();
	t4 = ($('#user_css_etc td:eq(0)').hasClass('inactive') ? 0 : 1) + ($('#user_css_etc td:eq(1)').hasClass('inactive') ? 0 : 2);
	var ss = $('#user_css_font').children().not('.inactive').text();
	
	lww = $('#user_css_etc input').val();	if (lww < 5) lww = 5; if (lww > 95) lww = 95; mww = 100 - lww;
	$('#css_a').html('#left_wrap,#qct,#qdt{width:'+lww+'%} #mid_wrap,#qcx,#qdx{width:'+mww+'%}' + ((t4 >= 2) ? ('#qaa,#qab,#qac,#qad{right:0} #qba,#qbb,#qbc,#qbd{left:0}') : ('#qaa,#qab,#qac,#qad{left:0} #qba,#qbb,#qbc,#qbd{right:0}')));
	
	var tt = '';
	var st = 'sans-serif'; if (ss == 'Consolas') st = 'monospace'; if (ss == 'Cambria') st = 'serif'; 
	if (ss != 'Default') tt = 'body, input, textarea {font-family:"' + ss +  '",' + st + ' !important}';
	$('#css_0').html(tt);
	
	var u1 = $('#css_1').html();
	var u2 = u1.indexOf('line-height');
	$('#css_1').html(u1.substr(0, u2) + 'line-height:' + (t3 * 0.1 + 1.3) + '}');
	$('#css_3').html('body, input, textarea {font-size:'+ (11 + t2) +'px}');
	if (t4 % 2 == 1) {
		$('#css_2').html('#qaa,#qab,#qac,#qad,#qba,#qbb,#qbc,#qbd{width:96px}#qea{left:108px}#qfa{right:108px}');
	}
	else {
		$('#css_2').html('');
	}
	fixPanel();
	fitLeftPanel();
	fitMidPanel();
	scroll(0); scrollNav(0);
	$user_css = t1.toString() + t2.toString() + t3.toString() + t4.toString() + zeroFill(lww, 2);
}

function saveCSS() {
	if (!job_free) return;
	post('css', {a:'css', n:$user_css}, function(msg) 
	{
		$('#user_css_msg').html(msg);
	});
}

function curUser() {
	return parseInt($('#user_button').attr('n'));
}

function prepareUserCssBox(){
	$('#user_css td').addClass('inactive');
	$('#user_css_msg').removeClass('inactive');
	var t1 = parseInt($user_css.charAt(0)); if (isNaN(t1)) t1 = 0;
	var t2 = parseInt($user_css.charAt(1)); if (isNaN(t2)) t2 = 0;
	var t3 = parseInt($user_css.charAt(2)); if (isNaN(t3)) t3 = 0;
	t4 = parseInt($user_css.charAt(3)); if (isNaN(t4)) t4 = 0;
	var t5 = parseInt($user_css.substr(4,2), 10); if (isNaN(t5)) t5 = 36;
	$('#user_css_font td:eq('+t1+')').removeClass('inactive');
	$('#user_css_fontsz td:eq('+t2+')').removeClass('inactive');
	$('#user_css_line td:eq('+t3+')').removeClass('inactive');
	
	if (t4 % 2 == 1) $('#user_css_etc td:eq(0)').removeClass('inactive');
	if (t4 >= 2) $('#user_css_etc td:eq(1)').removeClass('inactive');
	
	$('#user_css_etc input').val(t5);
	
	updateCSS();
}

function myModifyList($mode) {
	if (!job_free) return;
	$('#left_modify').addClass('xyz');
	$('#modify_msg').css('margin-top', '10px');
	$('#modify_msg').html('Editing...');
	var $query = {a:'xli', n:$('#left_modify').prev().attr('n')};
	if ($mode == 1) $query.title = $('#modify_text').val();
	post('modlist', $query, function(msg)
	{
		if (msg.substr(0, 7) == 'SUCCESS')
		{
			if (msg.length > 7) {
				left_raw[$('#left_modify').prev().attr('n')] = msg.substr(7);
				$('#left_modify').prev().find('p').html(msg.substr(7));
				updateMathEtc('left_wrap');
			} else {
				left_raw[$('#left_modify').prev().attr('n')] = '';
				$('#left_modify').prev().remove();
			}
			cancelModifyList();
			$('#left_modify').hide();
			$('#left_modify').prev().show();
		}
		else
		{
			$('#modify_msg').html(msg);
		}
	});
}

function xpost($str) {
	$str.a = $_GET.a;
	$('#message').html('Connecting...');
	$.post('account_db.php', $str, function (msg)
	{
		if (msg == 'Success.')
		{
			window.location.href = 'index.php';
		}
		$('#message').html(msg);
		acc_working = false;
	});
}
function is_guest() {
	return ($('#user_button').text().substr(1).toLowerCase() == 'guest');
}
function create_button() {
	if (getNavRealType() == 'u')
	{
		$('#signin_panel').hide(); $('#signup_panel').show(); $('#panel').show();
	}
	else if (getNavRealType() == 't')
	{
		if ($('#left_create').length == 0)
			$($left_create).insertBefore($('#nav'));
		else
			$('#left_create').insertBefore($('#nav'));
		$('#left_create').show();
	}
	else
	{
		if (is_guest()) goNav('@');
		disableHistoryButton();
		$('#post').attr('type', 'x');
		clearPost(false);
		$('#mid').hide();
		$('#fullview_button_2').show();
		$('#page_top_button').hide();
		$('#mid_panel_wrap').css('top', '6px');
		$('#mid_panel').css('padding-top', '10px');
		$('#post_title').show();
		setTitle('Creating new thread');
		$('#post_text').attr('placeholder', 'Text');
		focus($('#post_text'));
		$('#cancel_button').show();
		scroll(0);
		syncActiveTopic(false);
		$('#mid_core').hide();
		$('#sage_button').hide();
		$('#hide_button').show();
		$('#lock_button').show();
	}
}
function follow_button() {
	if (!job_free) return;
	var $follow = curTopic();
	if ($('#follow_button').text().indexOf('nfollow') != -1) $follow = -$follow;
	post('follow', {a:'xfo', n:$follow}, function(msg) 
	{
		if (msg)
		{
			getTextNode($('#followers_button')).replaceWith('[Followers ' + msg + ']');
			$('#follow_button').html(($follow > 0)?('<i class="icon-minus-sign"></i> Unfollow'):('<i class="icon-plus-sign"></i> Follow'));
			$('#follow_button i').addClass('current');
			// update NAV if needed
			var $type = $('#nav').attr('type');
			var $topic = $('#nav').attr('topic');
			var $begin = $('#nav').attr('begin');
			if ((($type == 'v') && ($topic == curUser())) || (($type == 'w') && ($topic == curTopic())))
			{
				refreshNav();
			}
		}
	});
}

function t_ren_button() {
	var $nn = -parseInt(curTopic());
	if ($('#t_ren_button').text().indexOf('Rename') >= 0) {
		getTextNode($('#t_ren_button')).replaceWith(' RENAME');
		$('#mid_title p').hide();
		$('#mid_title p').after('<div id="title_deco"><div class="button" id="title_cancel"><i class="icon-ban-circle"></i> Cancel</div><div id="title_text_wrap"><input type="text" id="title_text" /></div></div>');
		$('#title_text').val(txt2msg(mid_raw[$nn]));
	} else {
		if (!job_free) return;
		$('#title_msg').show();
		$('#title_msg').html('Editing...');
		
		post('ren', {a:'xou', text:$('#title_text').val(), n:$nn}, function(msg) 
		{
			if (msg.substr(0, 7) == 'SUCCESS')
			{
				cancelModifyTitle();
				var $mm = -$nn;
				mid_raw[$nn] = msg.substr(7);
				left_raw[$mm] = msg.substr(7);
				$('#nav .item[n=' + $mm + '] p').html(msg.substr(7));
				updateNavTitle($mm);
				$('#mid_title p').html(msg.substr(7));
				updateTopicTitle();
				left_history.p();
				mid_history.p();
			}
			else
			{
				$('#title_msg').html(msg);
			}
		});
	}
}

function t_mod_button() {
	var $stt = $('#t_mod_button').text().substr(1);
	if ($stt.indexOf('!') < 0) {
		getTextNode($('#t_mod_button')).replaceWith(' !!!' + $stt.toUpperCase() + '!!!');
	} else {
		if (!job_free) return;
		$('#title_msg').show();
		$('#title_msg').html('Modding...');
		var $nn = parseInt(curTopic());
		ws_post('mod', {a:'xmo', n:$nn}, function(msg)
		{
			if (msg.substr(0, 7) == 'SUCCESS') {
				// auto refresh?
				$('#title_msg').html('Success.');
			}
			else
				$('#title_msg').html(msg);
		});
	}
}
function t_unmod_button() {
	var $stt = $('#t_unmod_button').text().substr(1);
	if ($stt.indexOf('!') < 0) {
		getTextNode($('#t_unmod_button')).replaceWith(' !!!' + $stt.toUpperCase() + '!!!');
	} else {
		if (!job_free) return;
		$('#title_msg').show();
		$('#title_msg').html('UnModding...');
		var $nn = -parseInt(curTopic());
		ws_post('mod', {a:'xmo', n:$nn}, function(msg)
		{
			if (msg.substr(0, 7) == 'SUCCESS') {
				// auto refresh?
				$('#title_msg').html('Success.');
			}
			else
				$('#title_msg').html(msg);
		});
	}
}

function t_hide_button() {
	var $stt = $('#t_hide_button').text().substr(1);
	if ($stt.indexOf('!') < 0) {
		getTextNode($('#t_hide_button')).replaceWith(' !!!' + $stt.toUpperCase() + '!!!');
	} else {
		if (!job_free) return;
		$('#title_msg').show();
		$('#title_msg').html('Hiding...');
		var $nn = parseInt(curTopic());
		if ($stt.indexOf('U') >= 0) $nn = -$nn;
		post('hide', {a:'xhi', n:$nn}, function(msg) 
		{
			if (msg.length == 2) {
				$('#post').attr('s', parseInt(msg.charAt(1)));
				updateTopicTitle();
				updateNavTitle(Math.abs($nn), parseInt(msg.charAt(1)));
				left_history.p();
				mid_history.p();
			}
			else
				$('#title_msg').html(msg);
		});
	}
}
function t_lock_button() {
	var $stt = $('#t_lock_button').text().substr(1);
	if ($stt.indexOf('!') < 0) {
		getTextNode($('#t_lock_button')).replaceWith(' !!!' + $stt.toUpperCase() + '!!!');
	} else {
		if (!job_free) return;
		$('#title_msg').show();
		$('#title_msg').html('Locking...');
		var $nn = parseInt(curTopic());
		if ($stt.indexOf('U') >= 0) $nn = -$nn;
		post('lock', {a:'xlo', n:$nn}, function(msg) 
		{
			if (msg.length == 2) {
				$('#post').attr('s', parseInt(msg.charAt(1)));
				updateTopicTitle();
				updateNavTitle(Math.abs($nn), parseInt(msg.charAt(1)));
				left_history.p();
				mid_history.p();
			}
			else
				$('#title_msg').html(msg);
		});
	}
}

function create_go() {
	if (!job_free) return;
	$('#create_msg').html('Posting...');		
	post('list', {a:'nli', title:$('#create_text').val()}, function(msg) 
	{
		if (msg.substr(0, 7) == 'SUCCESS')
		{
			cancelCreateList();
			refreshNav();
		}
		else
		{
			$('#create_msg').html(msg);
		}
	});
}

function item_jump() {
	var target = $('#item_func').next();
	if ($('#post').attr('type') == 'u')
	{
		var $xroot = parseInt(target.attr('r'));
		if ($xroot > 0) { // topic
			goTopic($xroot, '-' + target.attr('n'));
		} else if (target.attr('by') == curTopic()) { // me to other
			if (((-$xroot) != parseInt(curTopic())) && ($xroot != 0)) // not me to me, not dead
				goTopic('u' + (-$xroot), '-' + target.attr('n'));
		}
		else if ($xroot < 0) { // other to me
			goTopic('u' + target.attr('by'), '-' + target.attr('n'));
		}
	}
	else
	{
		goTopic('u' + target.attr('by'), '-' + target.attr('n'));
	}
}

function item_edit() {
	var $nn = $('#item_func').next().attr('n');
	if ($('#item_edit').text().indexOf('!') < 0) {
		getTextNode($('#item_edit')).replaceWith(' !!!EDIT!!!');
		$('#item_func').next().find('.pwrap').hide();
		$('#item_func').next().find('.pwrap').after('<div id="item_text_wrap"><textarea id="item_text"></textarea></div>');
		var rr = mid_raw[$nn]; if (typeof rr == 'undefined') rr = 'ERROR: Buffer corrupted at ' + $nn;
		$('#item_text').val(txt2msg(rr));
		autofixBox('item_text');
	} else {
		if (!job_free) return;
		$('#item_msg').show();
		$('#item_msg').html('Editing...');
		
		post('edit', {a:'xou', text:$('#item_text').val(), n:$nn}, function(msg) 
		{
			if (msg.substr(0, 7) == 'SUCCESS')
			{
				cancelItemFunc();
				mid_raw[$nn] = msg.substr(7);
				$('#item_func').next().find('.pwrap').html(msg2txt(msg.substr(7)));
				updateMathEtc('text_wrap');
				markUpX($('#item_func').next(), true);
				mid_history.p();
			}
			else
			{
				$('#item_msg').html(msg);
			}
		});
	}
}

function item_delete() {
	if ($('#item_delete').text().indexOf('!') < 0) {
		getTextNode($('#item_delete')).replaceWith(' !!!' + $('#item_delete').text().substr(1).toUpperCase() + '!!!');
		$('#item_delete').css('margin-right', '100px');
	} else {
		if (!job_free) return;
		$('#item_msg').show();
		$('#item_msg').html('Deleting...');
		
		post('del', {a:'dpo', n:$('#item_func').next().attr('n')}, function(msg) 
		{
			if (msg.substr(0, 7) == 'SUCCESS')
			{
				$('#item_func').next().remove();
				$.each($('#item_func').nextAll(), function() {
					var k = $(this).find('.trep');
					k.text(parseInt(k.text()) - 1);
				});
				var m = parseInt($('#post').attr('down'));
				if (m > 0)
					$('#post').attr('down', m - 1);
				$('#post').attr('cnt', parseInt($('#post').attr('cnt')) - 1);
				$('#item_func').hide();
				syncActiveTopic();
			}
			else
			{
				$('#item_msg').html(msg);
			}
		});
	}
}
function item_mod() {
	if (!job_free) return;
	$('#item_msg').show();
	$('#item_msg').html('Modding...');
	post('mod', {a:'mod', n:$('#item_func').next().attr('n')}, function(msg) 
	{
		if (msg.substr(0, 7) == 'SUCCESS')
		{
			$('#item_func').next().remove();
			$.each($('#item_func').nextAll(), function() {
				var k = $(this).find('.trep');
				k.text(parseInt(k.text()) - 1);
			});
			var m = parseInt($('#post').attr('down'));
			if (m > 0)
				$('#post').attr('down', m - 1);
			$('#post').attr('cnt', parseInt($('#post').attr('cnt')) - 1);
			$('#item_func').hide();
			syncActiveTopic();
		}
		else
		{
			$('#item_msg').html(msg);
		}
	});
}

function preview_button() {
	$('#mid_preview').remove();
	$('#mid_panel').prepend('<div id="mid_preview" class="pwrap xpadbox" style="background-color:#e7e7e7">' + msg2txt(inp2mar($('#post_text').val())) + '</div>');
	updateMathEtc('mid_preview');
}

function post_button() {
	if (!job_free) return;
	if ($('#post').attr('id') != 'post')
	{
		if (!$('#post_title').is(':visible'))
		{
			$('#post_msg').text('Cannot post to non-existent subjects.');
			return;
		}
		else
		{
			$posting_topic = 0;
		}
	}
	$('#post_msg').text('Posting...');
	
	if ($('#post').attr('type') == 'x')
	{
		$posting_topic = 0;
	}
	else if ($('#post').attr('type') == '')
	{
		$posting_topic = curTopic();
	}
	else if ($('#post').attr('type') == 'u') 
	{
		$posting_topic = -parseInt(curTopic());
	}
	
	var $req = {a:'new', title:$('#post_title').val(), text:$('#post_text').val(), n:$posting_topic};
	if ($('#nav').attr('type') == '@')
		$req.a = 'ne1';
	if ($('#sage_button').is(':visible') && (!$('#sage_button').hasClass('inactive')))
		$req.s = '0';
	if ($('#lock_button').is(':visible') && (!$('#lock_button').hasClass('inactive')))
		$req.s = '1';
	if ($('#hide_button').is(':visible') && (!$('#hide_button').hasClass('inactive')))
		$req.s = '2';

	ws_post('post', $req, function(msg)
	{
		if (msg.substr(0, 7) == 'SUCCESS')
		{
			clearPost();
			$('#post_msg').text('Success.');
			if ($posting_topic == 0)
			{
				if ($req.a == 'ne1') goNav('@');
				goTopic(msg.substr(7), 0); scroll(0);
			}
			else if ($posting_topic > 0)
			{
				if ($('#nav').attr('type') == '@') goNav('@');
				goTopic($posting_topic, 0, true);
			}
			else
			{
				var $uuser = -parseInt($posting_topic);
				goTopic('u' + $uuser, 0, true);
			}
		}
		else
		{
			$('#post_msg').html(msg);
		}
	});
}

function search_button()
{
	if (job_free)
	{
		if (!$('#search_text').val())
			goNav(getNavRealType());
		else {
			var t = getNavRealType();
			var u = 'a';
			if (t == 'u') u = 'b';
			if (t == 't') u = 'c';
			goNav(u + $('#search_text').val());
		}
	}
}

function htmlspecialchars_decode(string) {
	return string.toString().replace(/&lt;/g, '<').replace(/&gt;/g, '>')
		.replace(/&#0*39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'); 
}
function htmlspecialchars(string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;").replace(/'/g, "&#039;");	
}

(function($)
{
	jQuery.fn.putCursorAtEnd = function()
	{
		return this.each(function()
		{
			$(this).focus();
			if (this.setSelectionRange)
			{
				var len = $(this).val().length * 2;
				this.setSelectionRange(len, len);
			}
			else
			{
				$(this).val($(this).val());
			}
			this.scrollTop = 999999;
		});
	};
})(jQuery);

$(document).ready(function () {

if (!window.WebSocket) {
	$('#wrap').hide();
	$('#bad_ie').show();
}

$(document).on('mouseenter mouseleave', '.button, .hover, .tmark, .aaa, .tup, .tdown', hover_1);

document.location.search.replace(/\??(?:([^=]+)=([^&]*)&?)/g, function () {
	function decode(s) {
		return decodeURIComponent(s.split('+').join(' '));
	}
	$_GET[decode(arguments[1])] = decode(arguments[2]);
});

//======================================================================== index.php

if ($CURRENT_FILE_NAME == 'index.php')
{

var $user_css_orig = $user_css;

$(window).resize(function(){
	setMinHeight();
	fitMidPanel();
	fitLeftPanel();
});

if (goHash())
	goNav();
else
	refresh();
	
prepareUserCssBox();

$(window).on('hashchange', function() {
	goHash();
});

$socket = new WebSocket('ws://127.0.0.1:8080/' + session_id());
function ws_heartbeat() {
	if ($socket.readyState == 1) {
		$socket.send('.');
	} else if ($socket.readyState == 3) {
		//$socket = new WebSocket('ws://127.0.0.1:8080/' + session_id());
	}
	setTimeout(ws_heartbeat, 60000);
}
setTimeout(ws_heartbeat, 60000);
$socket.onerror = function(e) {
	$socket.close();
	$num_online = 'err';
	$('.num_online').text('err');
};
$socket.onclose = function(e) {
	$num_online = 'err';
	$('.num_online').text('err');	
};
$socket.onmessage = function(e) {
	var x = e.data.indexOf(',');
	var n = e.data.substr(0, x);
	var d = e.data.substr(x+1);
  if (n == '-1') {
		updateNav(d, true);
	} else if (n == '-2') {
		if (is_good_for_live()) updateNav(d, true);
	} else if (n == '-3') {
		$num_online = parseInt(d);
		$('.num_online').text($num_online);
	}
  else {
    $socket_callback[n](d);
	}
};

$(document).on('mouseenter mouseleave', '#qca', hover_1a);
$(document).on('mouseenter mouseleave', '#qcb', hover_1b);
$(document).on('mouseenter mouseleave', '#nav .item p', hover_2);
$(document).on('mouseenter mouseleave', '#nav .trep', hover_2a);
$(document).on('mouseenter mouseleave', '#qaa, #qab, #qac, #qad, #qba, #qbb, #qbc, #qbd, #qca, #qcb, #qda, #qdb, #qdc, #qdd, #qea, #qfa', hover_3);

document.addEventListener('mousewheel', wheel, false);
document.addEventListener('DOMMouseScroll', wheel, false);

$(document).on('touchstart', function(e) {
	e = e.originalEvent.touches[0];
	var sY = e.pageY;
	$(document).on('touchmove',function(ev) {
    ev.preventDefault();
    ev = ev.originalEvent.touches[0];
		ev.wheelDelta = ev.pageY - sY;
		wheel(ev);
	});
	$(document).on('touchend',function(ev)
	{
    $(document).off('touchmove touchend');
	});
});

$('#qea').mousedown(function (e) {
	if (e.which != 1) return;
	var id = $(getTarget(e)).attr('id');
	var y = e.pageY;
	if (id == 'qea') {
		if (y > $('#qex').offset().top + $('#qex').height() * 0.5)
			wheelx(1, -pageAmt());
		else
			wheelx(1, pageAmt());
	} else {
		left_start = e.pageY;
		left_starx = parseInt($('#qex').offset().top) - parseInt($('#qea').offset().top) - 11;
	}
	stopAll(e);
});
$('#qfa').mousedown(function (e) {
	if (e.which != 1) return;
	var id = $(getTarget(e)).attr('id');
	var y = e.pageY;
	if (id == 'qfa') {
		if (y > $('#qfx').offset().top + $('#qfx').height() * 0.5)
			wheelx(2, -pageAmt());
		else
			wheelx(2, pageAmt());
	} else {
		mid_start = e.pageY;
		mid_starx = parseInt($('#qfx').offset().top) - parseInt($('#qfa').offset().top) - 11;
	}
	stopAll(e);
});
$(document).mousemove(function (e) {
	if (left_start != -1) {
		topx(1, -(e.pageY - left_start + left_starx) * yx(1) / (parseInt($('#qea').height())));
	}
	if (mid_start != -1) {
		topx(2, -(e.pageY - mid_start + mid_starx) * yx(2) / (parseInt($('#qfa').height())));
	}
});
$(document).mouseup(function (e) {
	if (e.which != 1) return;
	if (left_start != -1) {
		left_start = -1;
		clearTimeout(left_timer);
		left_timer = setTimeout(function() { $('#qex').css('opacity', 0) },scrollbar_t);	
	}
	if (mid_start != -1) {
		mid_start = -1;
		if (mid_timer) clearTimeout(mid_timer);
		setTimeout(function() { $('#qfx').css('opacity', 0) },scrollbar_t);	
	}
});

$('#text_wrap').mousedown(function (e) {
	if (e.which != 1) return;
	var target = getTarget(e);	var done = true;
	if (target.tagName == 'STRIKE') target = target.parentNode;
	var $class = target.className;
	
	if ($class.indexOf('tmark') != -1) {
		target = $(target).parent();
		var $prevID = target.prev().attr('id');
		if (typeof $prevID == 'undefined')
			$prevID = '';
		else if (!target.prev().is(':visible'))
			$prevID = '';
		if ($prevID != 'item_func') {
			$('#item_func').next().find('.pwrap').show();
			
			if ($('#item_func').length == 0)
				target.before($($item_func));
			else
				target.before($('#item_func'));
			
			if ($('#post').attr('topic').indexOf('_') >= 0) {
				$('#item_focus').hide(); $('#item_defocus').show();
			} else if ($('#post').attr('type') == 'u') {
				$('#item_focus').hide(); $('#item_defocus').hide();
			} else {
				$('#item_focus').show(); $('#item_defocus').hide();
			}
			
			getTextNode($('#item_edit')).replaceWith(' Edit');
			if (target.attr('id') == 'mid_desc')
				$('#item_delete').hide();
			else
			{
				$('#item_delete').show();
				getTextNode($('#item_delete')).replaceWith(' Delete');
			}
			$('#item_delete').css('margin-right', '-8px');
			$('#item_aut').text(target.find('.tmark').attr('title').split(' ')[0]);
			$('#item_func .item_num').text(target.attr('n'));
			$('#item_msg').hide();
			$('#item_msg').html('');
			$('#item_text_wrap').remove();
			var $owner = parseInt(($('#post').attr('type') == 'u') ? curTopic() : $('#post').attr('by'));
			var $curr = curUser();
			apply_status($owner == $curr || target.attr('by') == $curr || $curr == '1', $('#item_delete'));
			$('#item_func').show();
		} else {
			cancelItemFunc();
		}
	} 
	else if ($class.indexOf('qname') != -1) 
	{
		goTopic($('#post').attr('type') + curTopic() + '_' + $(target).text(), 0);
	}
	else if ($class.indexOf('qret') != -1)
	{
		goTopic($(target).text().substr(2), 0, 0);
	}
	else if ($class.indexOf('qref') != -1) 
	{
		var nn = $(target).text().substr(1);
		var tt = $(target).parent().find('#q_' + nn);
		if (tt.length > 0) {
			tt.remove();
		} else {
			if (nn in mid_raw)	{
				$(target).after('<div class="qrx" id="q_' + nn + '">' + msg2txt(mid_raw[nn]) + '</div>');
				updateMathEtc('q_' + nn);
			}
			else if (job_free)
			{
				post('qrx', {a:'qrx', n:nn}, function(msg) 
				{
					if (msg != '') {
						mid_raw[nn] = msg;
						$(target).after('<div class="qrx" id="q_' + nn + '">' + msg2txt(msg) + '</div>');
						updateMathEtc('q_' + nn);
					} else {
						$(target).after('<div class="qrx" id="q_' + nn + '"><p style="color:#bbb">Post does not exist.</p></div>');
					}
				});
			}
		}
	}
	else {
		done = false;
	}
	
	if (done) { stopAll(e); clearSelection(); }
});

$('#nav_wrap').mousedown(function (e) {
	if (e.which != 1) return;
	var target = getTarget(e);	var done = true;
	if (target.className.indexOf('p_spec') >= 0) target = target.parentNode;
	var $class = target.className;
	var $tp = $(target).parent();

	if ((target.tagName == 'P') && (target.parentNode.className.indexOf('item') != -1) && ($tp.attr('n').length > 0)) 
	{ // coz could be "none at the moment"
		if (getNavRealType() == 't') {
			if ($('#nav').attr('topic').substr(0, 1) == 'a')
				myTag($tp.attr('n'));
			else if ($('#nav').attr('topic').substr(0, 1) == 'm')
				myTag(-$tp.attr('n'));
			else
				goNav('s' + $tp.attr('n'));
		} 
		else {
			if ($('#nav').attr('type') == 'q')
				delayGo(e, $tp.attr('n'), $('#nav').attr('topic')); // go correct position in reply
			else
				dummyGo(e, $tp.attr('n'), 0);
		}
	}
	else if ($class.indexOf('trep') != -1) {
		if (getNavRealType() == 't') {
			if ($('#left_modify').is(':visible')) {
				$('#left_modify').hide();
				$('#left_modify').prev().show();
			}
			cancelModifyList();
			$tp.hide();
			if ($('#left_modify').length == 0)
				$tp.after($($left_modify));
			else
				$tp.after($('#left_modify'));
			$('#modify_text').val(txt2msg(left_raw[$tp.attr('n')]));
			$('#left_modify').show();
		}
		else {
			if ($('#nav').attr('type') == 'q')
				delayGo(e, $tp.attr('n'), -parseInt($('#nav').attr('topic')));
			else
				dummyGo(e, $tp.attr('n'), 1);
		}
	}
	else if ($class.indexOf('tmark') != -1) {
		if (getNavRealType() == 'u')
			goTopic('u' + $tp.attr('n'), 0);
		else if (getNavRealType() == 't')
			goTopic('u' + $tp.attr('by'), 0);
		else
			goTopic('u' + $tp.attr('by'), 0);	//goTopic('u' + $tp.attr('by'), '-' + $tp.attr('h'));
	}
	else {
		done = false;
	}
	
	if (done) { $('#post_text').blur(); stopAll(e); clearSelection(); }
});

$('#user_css td').mousedown(function (e) {
	if (e.which != 1) return;
	if (this.tagName == 'INPUT') return;
	var i = $(this).parent().children().index($(this));
	var s = $(this).parent().attr('id');
	if (s != 'user_css_func')
	{
		if (s == 'user_css_etc') {
			if ($(this).index() == 2) return;
			$(this).toggleClass('inactive');
		} else {
			$(this).parent().find('td').addClass('inactive');
			$(this).removeClass('inactive');
		}
		$('#user_css_msg').html('');
		updateCSS();
		stopAll(e);
	} else {
		updateCSS();
	}
});

$(document).mousedown(function (e) {
	if (e.which != 1) return;
	if (e.clientX >= $(window).width()) return;
	if (e.clientY >= $(window).height()) return;
	var target = getTarget(e);	var done = true; var true_target = target;
	var $class = target.className;
	// deal with silly bubble order
	if (target.parentNode)
	{
		if (target.parentNode.className.indexOf('button') != -1)
			target = target.parentNode;
		else if (target.parentNode.parentNode)
			if (target.parentNode.parentNode.className.indexOf('button') != -1)
				target = target.parentNode.parentNode;
		if (target.className.indexOf('p_spec') != -1)
			target = target.parentNode;
	}

	var $id = target.id; var $tagName = target.tagName;
	
	if ($class.indexOf('disable') >= 0) {
		// nothing
	}
	else if ($class.indexOf('signup_now') >= 0) {
		$('#signin_panel').hide(); $('#signup_panel').show(); $('#panel').show(); focus($('#signup_panel input').eq(0));
	}
	else if ($class.indexOf('signin_now') >= 0) {
		$('#signup_panel').hide(); $('#signin_panel').show(); $('#panel').show(); focus($('#signin_panel input').eq(0));
	}
	else if (($id == 'n_pgup_button') || ($id == 'qab')) {
		switchView(true);
		$('#nav .tup').trigger('mousedown', e.shiftKey);
	}
	else if (($id == 'n_pgdn_button') || ($id == 'qac')) {
		switchView(true);
		$('#nav .tdown').trigger('mousedown', e.shiftKey);
	}
	else if (($id == 't_pgup_button') || ($id == 'qbb')) {
		$('#post .tup').trigger('mousedown', e.shiftKey);
	}
	else if (($id == 't_pgdn_button') || ($id == 'qbc')) {
		$('#post .tdown').trigger('mousedown', e.shiftKey);
	}
	else if (($id == 'fullview_button') || ($id == 'fullview_button_2')) {
		switchView(false);
	}
	else if ($id == 'user_img') {
		goTopic('u' + curTopic(), 0); goNav('u');
	} 
	else if ($id == 'following_button') {
		goNav('v' + curTopic()); 
	} 
	else if ($id == 'followers_button') {
		goNav('w' + curTopic());
	} 
	else if ($id == 'follow_button') {
		follow_button();
	} 
	else if ((target.parentNode.id == 'left_title') && ($tagName == 'P')) {
		$('#left_func').toggle();
	}
	else if ((target.parentNode.id == 'mid_title') && ($tagName == 'P')) {
		if ($('#post').attr('type') == '') {
			$('#mid_func').toggle();
			updateMidCore();
			updateTopicTitle();
		}
		else if ($('#post').attr('type') == 'u') {
			$('#mid_func_user').toggle();
			updateMidCore();
			getTextNode($('#logoff_button')).replaceWith(' Log off');
		}
	}
	else if ($id == 'n_topic_button') {
		goNav();
	}
	else if ($id == 'n_b_button') {
		goNav('@');
	}
	else if ($id == 'n_user_button') {
		goNav('u');
	}
	else if ($id == 'n_list_button') {
		goNav('t');
	}
	else if ($id == 'logoff_button') {
		if ($('#logoff_button').text().indexOf('Log') >= 0) {
			getTextNode($('#logoff_button')).replaceWith(' !!!LOG OFF!!!');
		} else {
			getTextNode($('#logoff_button')).replaceWith(' Logging out...');
			window.location.href = 'account.php?a=logoff';
		}
	}
	else if (($id == 'n_back_button') || ($id == 'qda')) {
		left_history.b();
	}
	else if (($id == 'n_fwd_button') || ($id == 'qdb')) {
		left_history.f();
	}
	else if (($id == 't_back_button') || ($id == 'qdc')) {
		mid_history.b();
	}
	else if (($id == 't_fwd_button') || ($id == 'qdd')) {
		mid_history.f();
	}
	else if ($id == 't_list_button') {
		goNav('t' + '-' + curTopic());
	}
	else if ($id == 't_add_button') {
		if ($('#nav').attr('type') == 's') //bug: owner of this list could be diff, but anyway
			myTag($('#nav').attr('topic'));
		else
			goNav('ta' + curTopic());
	}
	else if ($id == 't_min_button') {
		if ($('#nav').attr('type') == 's') //bug: owner of this list could be diff, but anyway
			myTag(-$('#nav').attr('topic'));
		else
			goNav('tm' + curTopic());
	}
	else if ($id == 't_ref_button') {
		goTopic($('#post').attr('type') + curTopic(), 0);
	}
	else if ($id == 'n_ref_button') {
		goNav($('#nav').attr('type') + $('#nav').attr('topic'), 0)
		left_top(0);
	}
	else if ($id == 'title_cancel') {
		cancelModifyTitle();
	}
	else if ($id == 't_ren_button') {
		t_ren_button();
	}
	else if ($id == 't_hide_button') {
		t_hide_button();
	}
	else if ($id == 't_lock_button') {
		t_lock_button();
	}
	else if ($id == 't_mod_button') {
		t_mod_button();
	}
	else if ($id == 't_unmod_button') {
		t_unmod_button();
	}
	else if ($id == 'refresh_button') {
		if (curUser() > 0) {
			goTopic('u' + curUser(), 0); goNav();
		}
		else
			refresh();		
	} 
	else if ($id == 'qbd') {
		scrollEnd();
	} 
	else if ($id == 'qba') {
		$('#fullview_button').leftClick();
	}
	else if ($id == 'qad') {
		scrollEndNav();
	} 
	else if ($id == 'qaa') {
		$('#n_ref_button').leftClick();
	}
	else if ($id == 'page_top_button') {
		scroll(0);
	}
	else if ($id == 'qca') {
		if (parseInt($('#left_sss').css('top')) < 0)
			scrollNav(0);
		else
			$('#left_title p').leftClick();
	}
	else if ($id == 'qcb') {
		if (parseInt($('#mid_sss').css('top')) < 0)
			scroll(0);
		else
			$('#mid_title p').leftClick();
	}
	else if ($id == 'search_button') {
		search_button();
	} 
	else if ($id == 'u_topic_button') {
		goNav('p' + curUser());
	} 
	else if ($id == 'u_post_button') {
		goNav('q' + curUser());
	}
	else if ($id == 'u_list_button') {
		goNav('t' + curUser());
	}
	else if ($id == 'tu_topic_button') {
		goNav('p' + curTopic());
	} 
	else if ($id == 'tu_post_button') {
		goNav('q' + curTopic());
	}
	else if ($id == 'tu_list_button') {
		goNav('t' + curTopic());
	}
	else if ($id == 'u_setup_button') {
		var aa = parseInt($('#left_sss').css('top'));
		if ((aa != 0) && (aa == left_x())) {
			var a1 = $('#left_panel').height();
			$('#setup').toggle();
			var a2 = $('#left_panel').height();
			wheel1(a1 - a2);
		} else {
			$('#setup').toggle();
		}
		if ($('#setup').is(':visible'))
			$('#u_setup_button i').addClass('active');
		else
			$('#u_setup_button i').removeClass('active');
		wheel1(0);
	}
	else if ($id == 'user_button') {
		if (curUser() > 0)
			goTopic('u' + curUser(), 0);
		else {
			goTopic('u' + curTopic(), 0); goNav('u');
		}
	}
	else if ($id == 'user_xyz') {
		$('#user_button').leftClick(e);
	}
	else if ($id == 'sage_button') {
		if ($('#sage_button').hasClass('inactive'))
			$('#sage_button').removeClass('inactive');
		else
			$('#sage_button').addClass('inactive');
	}
	else if ($id == 'hide_button') {
		if ($('#hide_button').hasClass('inactive')) {
			$('#hide_button').removeClass('inactive');
			$('#lock_button').addClass('inactive');
		}
		else
			$('#hide_button').addClass('inactive');
	}
	else if ($id == 'lock_button') {
		if ($('#lock_button').hasClass('inactive')) {
			$('#lock_button').removeClass('inactive');
			$('#hide_button').addClass('inactive');
		}
		else if ($('#hide_button').hasClass('inactive'))
			$('#lock_button').addClass('inactive');
	}
	else if ($id == 'tmp_create') {
		goNav('t');
	}
	else if ($id == 'create_button') {
		create_button();
	}
	else if ($id == 'create_go') {
		create_go();
	}
	else if ($id == 'cancel_button') {
		cancelCreate();
		scroll(0);
	}
	else if ($id == 'create_cancel') {
		cancelCreateList();
	}
	else if ($id == 'preview_button') {
		preview_button();
	}
	else if ($id == 'item_jump') {
		item_jump();
	}
	else if ($id == 'item_focus') {
		goTopic($('#post').attr('type') + curTopic() + '_' + $('#item_func').next().attr('by'), -parseInt($('#item_func').next().attr('n')));
	}
	else if ($id == 'item_defocus') {
		goTopic($('#post').attr('type') + curTopic(), -parseInt($('#item_func').next().attr('n')));
	}
	else if ($id == 'item_edit') {
		item_edit();
	}
	else if ($id == 'item_reply') {
		if ($('#post').attr('type') != 'u') {
			var $aa = $('#post_text');
			var $ab = $aa.val();
			var $ac = '@' + $('#item_aut').text() + ' ';
			if ($ab.length > 0) {
				if ($ab != $ac) {
					$aa.val($ab + '\n' + $ac);
				}
			} else {
				$aa.val($ac);
			}
		} else {
			item_jump();
		}
		setTimeout(function(){$('#post_text').putCursorAtEnd()},0);
	}
	else if ($id == 'item_shift') {
		goTopic($('#post').attr('type') + curTopic(), -parseInt($('#item_func').next().attr('n')));
	}
	else if ($id == 'item_ref') {
		var $aa = $('#post_text');
		var $ab = $aa.val();
		var $ac = '#' + $('#item_func').next().attr('n') + ' ';
		if ($ab.length > 0) {
			if ($ab != $ac) {
				$aa.val($ab + '\n' + $ac);
			}
		} else {
			$aa.val($ac);
		}
		setTimeout(function(){$('#post_text').putCursorAtEnd()},0);		
	}
	else if ($id == 'modify_cancel') {
		cancelModifyList();
		$('#left_modify').hide();
		$('#left_modify').prev().show();
	}
	else if ($id == 'modify_go') {
		myModifyList(1);
	}
	else if ($id == 'modify_delete') {
		if ($(target).text().indexOf('!') < 0) {
			getTextNode($(target)).replaceWith(' !!!DELETE!!!');
		} else {
			myModifyList(0);
		}
	}
	else if ($id == 'item_delete') {
		item_delete();
	}
	else if ($id == 'item_mod') {
		item_mod();
	}
	else if ($id == 'post_button') {
		post_button();
	}
	else if ($id == 'user_css_save') {
		saveCSS();
	}
	else if ((($id == 'user_location') || ($id == 'user_education') || ($id == 'user_major') || ($id == 'user_hobby'))
					&& (curUser() == curTopic())) {
		if ((true_target.tagName != 'SPAN') && (true_target.tagName != 'INPUT'))
		{
			if ($(target).find('input').length == 0) {
				var $q1 = $id.charAt(5).toUpperCase() + $id.substr(6);
				$(target).find('i').after('<input type="text" style="margin-left:8px" placeholder="' + $q1 + '"></input>');
				$(target).find('input').val(getTextNode($(target)).text().substr(1));
				$(target).find('input').nextAll().remove();
				getTextNode($(target)).replaceWith(' ');
			}
			else {
				var $q2 = 'xx' + $id.charAt(5);
				post($q2, {a:$q2, title:$(target).find('input').val()}, function(msg) {
					$(target).html(outerHTML($(target).find('i')[0]) + ' ' + msg);
				});
			}
		}
		else
		{
			done = false;
		}
	}
	else if (($id == 'mid_func') || ($id == 'left_func') || ($id == 'setup') || ($id == 'mid_func_user') || ($id == 'mid_core')
		|| ($id == 'mid_title') || ($id == 'item_func') || ($id == 'left_modify')) {
		// prevent ugly selections
	}
	else {
		done = false;
	}
	if (done) { stopAll(e); clearSelection(); return; }
});

$(document).keydown(function (e) {
	var target = getTarget(e);

	if (e.keyCode == 13) {
		if (((e.ctrlKey)||(e.metaKey)) && (target.id == 'post_text') && ($('#post_button').is(':visible')))
		{
			stopAll(e);	$('#post_button').leftClick(e);
		}
		if (target.id == 'search_text')
		{
			stopAll(e); $('#search_button').leftClick(e);
		}
	}

	if ((e.ctrlKey) || (e.altKey) || (e.metaKey)) return;
	if ((target.tagName !== 'TEXTAREA') && (target.tagName !== 'INPUT') && (job_free)) {
		switch (String.fromCharCode(e.keyCode)) {
			case 'K':
			case '&': // up arrow
				stopAll(e);
				wheelx(2, 46);
			break;
			case 'J':
			case '(': // down arrow
				stopAll(e);
				wheelx(2, -46);
			break;
			case 'H':
			case '%': // left arrow
				stopAll(e);
				wheelx(2, pageAmt());
			break;
			case 'L':
			case "'": // right arrow
				stopAll(e);
				wheelx(2, -pageAmt());
			break;
			case '!': // pgup
				stopAll(e);
				wheel2(pageAmt());
			break;
			case '"': // pgdn
			case ' ':
				stopAll(e);
				wheel2(-pageAmt());
			break;
			case String.fromCharCode(35): // end
				stopAll(e);
				mid_top(0.1);
			break;
			case String.fromCharCode(36): // home
				stopAll(e);
				mid_top(0);
			break;
			case String.fromCharCode(8): // backspace
				stopAll(e);
				mid_history.b();
			break;
			case 'R':
				stopAll(e);
				$('#fullview_button').leftClick(e);
			break;
			case 'W':
				stopAll(e);
				wheelx(1, 46);
			break;
			case 'S':
				stopAll(e);
				wheelx(1, -46);
			break;
			case 'A':
				stopAll(e);
				wheelx(1, pageAmt());
			break;
			case 'D':
				stopAll(e);
				wheelx(1, -pageAmt());
			break;
		}
	}
});

$('#post_text').focus(function () {
	if ($('#post').attr('type') != 'x')
	{
		var aa = parseInt($('#mid_sss').css('top'));
		if ((aa != 0) && (aa == mid_x())) {
			var a1 = $('#mid_panel').height();
			$('#post_text').height(250);
			$('#post_wwww').show();
			var a2 = $('#mid_panel').height();
			wheel2(a1 - a2);
		} else {
			$('#post_text').height(250);
			$('#post_wwww').show();
		}
	} else {
		$('#post_text').height($(window).height() - 110);
		$('#post_wwww').show();		
	}
	clearSelection();
	updatePostMsg();
});
$('#post_text').blur(function () {
	$('#mid_preview').remove();
	if ($('#post').attr('type') != 'x')
	{
		var aa = parseInt($('#mid_sss').css('top'));
		if ((aa != 0) && (aa == mid_x())) {
			var a1 = $('#mid_panel').height();
			$('#post_text').height(30);
			$('#post_wwww').hide();
			var a2 = $('#mid_panel').height();
			wheel2(a1 - a2);
		} else {
			$('#post_text').height(30);
			$('#post_wwww').hide();
		}
		$('#mid_panel_wrap').css('top', '');
		$('#mid_panel').css('padding-top', '');
	}
	$('#post_msg').html('');
});

(function () {
	var head = document.getElementsByTagName('head')[0], script;
	script = document.createElement('script');
	script.type = 'text/x-mathjax-config';
	script[(window.opera ? 'innerHTML' : 'text')] =
	'MathJax.Hub.Config({\n' +
	'jax: ["input/TeX","output/SVG"],\n' +
	'extensions: ["tex2jax.js","MathMenu.js","MathZoom.js"],\n' +
	'TeX: { extensions: ["AMSmath.js","AMSsymbols.js","noErrors.js","noUndefined.js"] },\n' +
	'tex2jax: { inlineMath: [["\\\\(","\\\\)"]] }\n' +
	'});';
	head.appendChild(script);
	
	script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js';
	head.appendChild(script);
})();

$('#panel').mousedown(function (e) {
	if (e.which != 1) return;
	var target = getTarget(e);
	var $class = target.className;
	var $pid = target.parentNode.id;
	if (($class.indexOf('button') >= 0) && ($pid == 'signup_panel')) {
		var $t = $('#signup_panel');
		if ($t.find('._pass').val() != $t.find('._pass_again').val())
		{
			$t.find('.msg').html('Passwords do not match when repeated.');
		} 
		else 
		{
			$t.find('.msg').text('Connecting...');
			$.post('account_db.php', 
				{a:'register', user:$t.find('._user').val(), pass:$t.find('._pass').val(), mail:$t.find('._email').val()}
				, function (msg)
				{
					if (msg == 'Success.')
					{
						document.location.reload(true);
					}
					$t.find('.msg').html(msg);
				}
			);
		}
	}
	else if (($class.indexOf('button') >= 0) && ($pid == 'signin_panel')) {
		var $t = $('#signin_panel');
		$t.find('.msg').text('Connecting...');
		$.post('account_db.php', 
			{a:'login', user:$t.find('._user').val(), pass:$t.find('._pass').val()}
			, function (msg)
			{
				if (msg == 'Success.')
				{
					document.location.reload(true);
				}
				$t.find('.msg').html(msg);
			}
		);
	}
	else if ($(target).closest('[id*="_panel"]').length == 0) {
		$('#panel').hide();
	}
});
$('#panel').keydown(function (e) {
	if (e.keyCode == 13) {
		if ($('#signup_panel').is(':visible'))
		{
			stopAll(e);
			$('#signup_panel .button').leftClick(e);
		}
		else if ($('#signin_panel').is(':visible'))
		{
			stopAll(e);
			$('#signin_panel .button').leftClick(e);
		}
	}
});
function get_panel_msg() {
	if ($('#signin_panel').is(':visible'))
		return '<a href="account.php?a=forgot" style="color:#999">Forgot account?</a>';
	return '';
}
function clear_panel_msg(e) {
	$(getTarget(e)).parent().find('.msg').html(get_panel_msg());
}
for (var i = 0; i < $('#panel input').length; i++) {
	$('#panel input').get(i).oninput = clear_panel_msg;
}
$('#panel input').focus(clear_panel_msg);

}

//======================================================================== account.php

else if ($CURRENT_FILE_NAME == 'account.php')
{
$(document).keydown(function (e) {
	if (e.keyCode == 13) {
		stopAll(e);
		$('#login_button').leftClick(e);
	}
});

function clear_msg() {
	$('#message').html('');
}
for (var i = 0; i < $('input').length; i++) {
	$('input').get(i).oninput = clear_msg;
}
$('input').focus(clear_msg);

$('#upload_button').mousedown(function (e)
{
	$('#upload_dummy').contents().find('html').html('Connecting...');
});

$('#login_button').mousedown(function (e)
{
	stopAll(e); if (acc_working) return false;

	acc_working = true; $('#message').empty();	$('input').blur();
	
	switch ($_GET['a'])
	{
		case 'login':
			xpost({user:$('#login_user').val(), pass:$('#login_pass').val()});
		break;
		case 'register':
			if ($('#login_pass').val() != $('#login_pass_again').val())
			{
				$('#message').html('Passwords do not match when repeated.');
				acc_working = false; return;
			}
			xpost({user:$('#login_user').val(), pass:$('#login_pass').val(), mail:$('#login_email').val()});
		break;
		case 'change':
			if ($('#new_pass').val() != $('#new_pass_again').val())
			{
				$('#message').html('Passwords do not match when repeated.');
				acc_working = false; return;
			}
			xpost({user:$('#login_user').val(), pass:$('#login_pass').val(), new_user:$('#new_user').val(), new_pass:$('#new_pass').val()});
		break;
		case 'email':
			if ($('#new_email').val() != $('#new_email_again').val())
			{
				$('#message').html('Emails do not match when repeated.');
				acc_working = false; return;
			}
			xpost({user:$('#login_user').val(), pass:$('#login_pass').val(), mail:$('#new_email').val()});
		break;
		case 'forgot':
			xpost({mail:$('#login_email').val()});
		break;
		case 'reset':
			if ($('#new_pass').val() != $('#new_pass_again').val())
			{
				$('#message').html('Passwords do not match when repeated.');
				acc_working = false; return;
			}
			xpost({user:$_GET['c'], magic:$_GET['b'], new_pass:$('#new_pass').val()});
		break;
	}
});
}});
})();
