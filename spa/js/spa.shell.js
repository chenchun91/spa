/*
*spa.shell.js
*Shell module for SPA
*/

spa.shell = (function(){
	//-----BEGIN MODULE SCOPE VARIABLES--------
	//�Ѿ�̬����ֵ����configMap��
	var configMap = {
			anchor_schema_map :{                //�����uriAnchorʹ�õ�ӳ�䣬������֤
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
	//��������ģ���й���Ķ�̬��Ϣ���ڱ�����, ���������г����л��õ��ļ���һ�ֺܺõķ���
	stateMap = {
		anchor_map: {}          //����ǰê��ֵ�����ڱ�ʾģ��״̬��ӳ����
	},
	jqueryMap = {},              //��jQuery���ϻ�����jqueryMap��

	copyAnchorMap, setJqueryMap,
	changeAnchorPart, onHashchange,
	setChatAnchor, initModule;
	//-------END MODULE SCOPE VARIABLES-------

	//-------BEGIN UTILITY METHODS------
	//ʹ��jQuery��extend���߷��������ƶ���
	copyAnchorMap = function(){
		return $.extend( true, {}, stateMap.anchor_map );
	};
	//-------END UTILITY METHODS--------

	//-----------BEGIN DOM METHOD---------
	//�������Ͳ���ҳ��Ԫ�صĺ�������DOM Methods������
	 //����jQuery���ϣ�����������д��ÿ��shell�͹��ܶ�Ӧ��������������������;��
	 //���Դ��ؼ���jQuery���ĵ��ı����������������
	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {             //�����컬���jQuery���ϻ��浽jqueryMap��
			$container: $container
		};
	};

	//��ê����ԭ�Ӹ��£�����һ��ӳ�䣬������µ����ݣ�ֻ�����ê��������ָ��������Ӧ��ֵ
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

		//�������ͨ��ģʽ��֤�Ͳ�����ê�����������������ʱ��ê����ع�����֮ǰ��״̬
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

	//ʹ��uriAnchor�������êת��Ϊӳ�䣬��֮ǰ��״̬�Ƚϣ��Ա�ȷ��Ҫ��ȡ�Ķ���
	//��������ê�仯����Ч�ģ���ê����Ϊ֮ǰ��ֵ
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
		//������falseʱ����ζ�Ÿ���λ�õ����󱻾ܾ���������ǡ���ķ�Ӧ��Ҫô�˻ص�֮ǰλ�õ�êֵ��
		//�������֮ǰ�Ĳ�������ʹ��Ĭ�ϵ�
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
	//��Chat�ṩ�������URI�ķ���
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







