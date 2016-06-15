/*
*spa.shell.js
*Shell module for SPA
*/

spa.shell = (function(){
	//-----BEGIN MODULE SCOPE VARIABLES--------
	//把静态配置值放在configMap中
	var configMap = {
			anchor_schema_map :{                //定义给uriAnchor使用的映射，用于验证
				chat: { opened: true, closed: true }
			},
			main_html:String()
				+ '<div class="spa-shell-head"> '
					+'<div class="spa-shell-head-logo"></div>'
					+'<div class="spa-shell-head-acct"></div>'
					+'<div class="spa-shell-head-search"></div>'
				+'</div>'
				+'<div class="spa-shell-main">'
					+'<div class="spa-shell-main-nav"></div>'
					+'<div class="spa-shell-main-content"></div>'
				+'</div>'
				+'<div class="spa-shell-foot"></div>'
				+'<div class="spa-shell-modal"></div>'
	},
	//将在整个模块中共享的动态信息放在变量中, 在这里面列出所有会用到的键是一种很好的方法
	stateMap = {
		anchor_map: {}          //将当前锚的值保存在表示模块状态的映射中
	},
	jqueryMap = {},              //将jQuery集合缓存在jqueryMap中

	copyAnchorMap, setJqueryMap,
	changeAnchorPart, onHashchange,
	setChatAnchor, initModule;
	//-------END MODULE SCOPE VARIABLES-------

	//-------BEGIN UTILITY METHODS------
	//使用jQuery的extend工具方法来复制对象
	copyAnchorMap = function(){
		return $.extend( true, {}, stateMap.anchor_map );
	};
	//-------END UTILITY METHODS--------

	//-----------BEGIN DOM METHOD---------
	//将创建和操作页面元素的函数放在DOM Methods区块中
	 //缓存jQuery集合，几乎完美编写的每个shell和功能都应该有这个函数。缓存的用途是
	 //可以大大地减少jQuery对文档的遍历次数，提高性能
	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {             //将聊天滑块的jQuery集合缓存到jqueryMap中
			$container: $container
		};
	};

	//对锚进行原子更新，接收一个映射，是想更新的内容，只会更新锚组件中这个指定键所对应的值
	//arguments
	// * arg_map - The map describeing what pert of the URIanchor
	//    we want changed.
	//Returns:
	// *true - the Anchor portion of the URI was update
	// *false - could not be updated.
	changeAnchorPart = function( arg_map ){
		var
			anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep;
		//Begin merge changes into anchor map
		KEYVAL:
		for( key_name in arg_map){
			if( arg_map.hasOwnProperty( key_name )){
				if( key_name.indexOf('_') === 0 ){
					continue KEYVAL;
				}
				//update independent key value
				anchor_map_revise[key_name] = arg_map[key_name];
				//update matching dependent value
				key_name_dep = '_' + key_name;
				if( arg_map[key_name_dep] ){
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				}else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}
		//end merge changes into anchor map

		//如果不能通过模式验证就不设置锚，当发生这样的情况时把锚组件回滚到他之前的状态
		//begin attempt to update URI; revert if not successful
		try{
			$.uriAnchor.setAnchor( anchor_map_revise );
		}
		catch (error){
			//replace URI with existing state
			$.uriAnchor.setAnchor( stateMap.anchor_map, null, true );
			bool_return = false;
		}

		return bool_return;
	};
	//--------END DOM METHOD-------

	//---------BEGIN EVENT HANDLERS-----------
	/*onClickChat = function(event) {
		toggleChat( stateMap.is_chat_retracted );
		changeAnchorPart({
			chat: ( stateMap.is_chat_retracted ? 'open' : 'closed')
		});
		return false;
	};*/

	//使用uriAnchor插件来将锚转换为映射，与之前的状态比较，以便确定要采取的动作
	//如果提议的锚变化是无效的，则将锚重置为之前的值
	onHashchange = function(evnet){
		var

			anchor_map_proposed,
			is_ok = true,
			_s_chat_previous, _s_chat_proposed,
			s_char_proposed,
			anchor_map_previous = copyAnchorMap();

		//attemp to parse anchor
		try{ anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
		catch(error) {
			$.uriAnchor.setAnchor( anchor_map_previous, null, true );
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;

		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;

		if( ! anchor_map_previous
		   || _s_chat_previous !== _s_chat_proposed
		 ){
			s_chat_proposed = anchor_map_proposed.chat;
			switch( s_chat_proposed ){
				case 'opened':
					is_ok = spa.chat.setSliderPosition( 'opened' );
				break;
				case 'closed':
					is_ok = spa.chat.setSliderPosition('closed');
				break;
				default:
					spa.chat.setSliderPosition('closed');
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor( anchor_map_proposed, null, true );
			}
		}
		//当返回false时（意味着更改位置的请求被拒绝），做出恰当的反应，要么退回到之前位置的锚值，
		//或者如果之前的不存在则使用默认的
		if( ! is_ok ){
			if( anchor_map_previous ){
				$.uriAnchor.setAnchor( anchor_map_previous, null, true );
				stateMap.anchor_map = anchor_map_previous;
			}else {
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor( anchor_map_proposed,null ,true );
			}
		}
		return false;
	};
	//----------END EVENT HANDLERS--------------

	//----------BEGIN CALLBACK-----------
	//给Chat提供请求更改URI的方法
	//Arguments:
	// *position_type - may be 'closed' or 'open'
	//Returns:
	// *true - requested anchor part was updated
	// *false - was not updated
	setChatAnchor = function ( position_type) {
		return changeAnchorPart({ chat: position_type });
	};

	//----------END CALLBACK-------------
	//---------BEGIN PUBLIC METHOD-------------
	initModule = function($container){
		stateMap.$container = $container;
		$container.html( configMap.main_html );
		setJqueryMap();
		$.uriAnchor.configModule({
			schema_map : configMap.anchor_schema_map
		});

		spa.chat.configModule({
			set_chat_anchor: setChatAnchor,
			chat_model: spa.model.chat,
			people_model: spa.model.people
		});
		spa.chat.initModule( jqueryMap.$container );

		/*stateMap_is_chat_retracted = true;
		jqueryMap.$chat
			.attr("title",configMap.chat_retracted_title)
			.click(onClickChat);*/
		$(window)
			.bind( 'hashchange', onHashchange)
			.trigger( 'hashchange' );
	};

	return {initModule : initModule };
	//---------END PUBLIC METHOD--------
  }());







