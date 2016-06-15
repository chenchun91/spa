
/*
*spa.chat.js
*Chat feature module for SPA
*/
spa.chat = function () {
	//-----------	begin module scope variables-------
	var
		configMap = {               //把静态配置值放在configMap中
			main_html: String()
			+ '<div class="spa-chat">'
			  + '<div class="spa-chat-head">'
			    + '<div class="spa-chat-head-toggle">+</div>'
			    + '<div class="spa-chat-head-title">'
					+ 'Chat'
				+ '</div>'
			  + '</div>'
			  + '<div class="spa-chat-closer">x</div>'
			  + '<div class="spa-chat-sizer">'
			    + '<div class="spa-chat-msgs"></div>'
			    + '<div class="spa-chat-box">'
			      + '<input type="text"/>'
			      + '<div>send</div>'
			    +'</div>'
			  +'</div>'
			+ '</div>',
			settable_map: {             //把chart所有配置放在这个模块里
				slider_open_time: true,
				slider_close_time: true,
				slider_opened_em: true,
				slider_closed_em: true,
				slider_opened_title: true,
				slider_closed_title: true,

				chat_model: true,
				poeple_model: true,
				set_chat_anchor: true
			},

			slider_open_time: 250,
			slider_close_time: 250,
			slider_opened_em: 16,
			slider_closed_em: 2,
			slider_opened_title: 'CLick to close',
			slider_closed_title: 'Click to open',

			chat_model: null,
			poeple_model: null,
			set_chat_anchor: null
		},
		//将在整个模块中共享的动态信息放在变量中, 在这里面列出所有会用到的键是一种很好的方法
		stateMap = {
			$append_target: null,
			position_type: 'closed',
			px_per_em: 0,
			slider_hidden_px: 0,
			slider_closed_px: 0,
			slider_opened_px: 0
		},
		jqueryMap = {},         //将jQuery集合缓存在jqueryMap中
		setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
		onClickToggle, configModule, initModule, removeSlider, handleResize
		;
	//------------end module scope variables----------

	//------------BEGIN UTILITY METHODS-----------
	//把em显示单位转化为像素，这样可以使用jQuery的方法度量
	getEmSize = function (elem) {
		return Number(
			getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
		);
	};
	//------------END UTILITY MOTHODS------------

	//	-----------BEGIN DOM METHODS-----------
	//将创建和操作页面元素的函数放在DOM Methods区块中
	//缓存jQuery集合，几乎我们编写的每个shell和功能都应该有这个函数。缓存的用途是
	//可以大大地减少jQuery对文档的遍历次数，提高性能
	setJqueryMap = function () {
		var
			$append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');

		jqueryMap = {             //将聊天滑块的jQuery集合缓存到jqueryMap中
			$slider: $slider,
			$head: $slider.find('.spa-chat-head'),
			$toggle: $slider.find('.spa-chat-head-toggle'),
			$title: $slider.find('.spa-chat-head-title'),
			$sizer: $slider.find('.spa-chat-sizer'),
			$msgs: $slider.find('.spa-chat-msgs'),
			$box: $slider.find('.spa-chat-box'),
			$input: $slider.find('.spa-chat-input input[type=text]')
		};
	};

	//计算由该模块管理的元素的像素尺寸

	setPxSizes = function () {
		var px_per_em, opened_height_em;
		px_per_em = getEmSize(jqueryMap.$slider.get(0));
		opened_height_em = configMap.slider_opened_em;
		stateMap.px_per_em = px_per_em;
		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;
		jqueryMap.$sizer.css({
			height: ( opened_height_em - 2 ) * px_per_em
		});
	};

	//purpose: Move the chat slider to the requested position
	//Arguments:
	// *position_type - emun('closed', 'opened', 'hidden')
	// *callback - optional callback to run end at the end of slider animation.
	// The callback receives a jQuery collection representing the slider div as
	// its single argument.
	//Action: This method moves the slider into the requested position.If the requested
	//position is the current position ,it returns true without taking further action
	//Returns:
	// *true - the requested position was achieved
	// *false - was not achieved

	setSliderPosition = function (position_type, callback) {
		var
			height_px, animate_time, slider_title, toggle_text;
		//return true if the slider already in requested position
		if (stateMap.position_type === position_type) {
			return true;
		}
		//prepare animate parameters
		switch (position_type) {
			case 'opened':
				height_px = stateMap.slider_opened_px;
				animate_time = configMap.slider_open_time;
				slider_title = configMap.slider_opened_title;
				toggle_text = '=';
				break;
			case 'hidden':
				height_px = 0;
				animate_time = configMap.slider_open_time;
				slider_title = '';
				toggle_text = '+';
				break;
			case 'closed':
				height_px = stateMap.slider_closed_px;
				animate_time = configMap.slider_close_time;
				slider_title = configMap.slider_closed_title;
				toggle_text = '+';
				break;
			default :
				return false;
		}
		//animate slider position change
		stateMap.position_type = '';
		jqueryMap.$slider.animate(
			{height: height_px},
			animate_time,
			function () {
				jqueryMap.$toggle.prop('title', slider_title);
				jqueryMap.$toggle.text(toggle_text);
				stateMap.position_type = position_type;
				if (callback) {
					callback(jqueryMap.slider);
				}
			}
		);
		return true;
	};
	//------------END DOM METHODS------------

	//------------BEGIN EVENT HANDLERS-------
	onClickToggle = function (event) {
		var set_chat_anchor = configMap.set_chat_anchor;
		if (stateMap.position_type === 'opened') {
			set_chat_anchor('closed');
		} else if (stateMap.position_type === 'closed') {
			set_chat_anchor('opened');
		}
		return false;
	};
	//------------END EVENT HANDLERS---------

	//	-----------BEGIN PUBLIC METHODS---------
	//每当功能模块接收设置（setting）时，我们总是使用相同的方法名和
	//同一个spa.util.setConfigMap工具方法
	//Purpose: Configure the module prior to initialization
	//Arguments:
	// *set_chat_anchor - a callback to modify the URI anchor to indicate
	//  opened or closed state.This callback must return false if the requested
	//  state can not be met.
	// *chat_model - provides methods to interact with our instant messaging
	// *people_model - provides methods to manage the list of people the model maintains
	// *slider_* setting.Allthese are optional scalars.
	//   See mapConfig.settable_map for a full list
	//Action:
	//  The internal configuration data structure(configMap) is updated with provided arguments.
	//  No other actions are taken.
	configModule = function (input_map) {
		spa.util.setConfigMap({
			input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};

	//几乎所有的模块都有这个方法，有它开始执行模块
	//Purpose: Directs Chat to offer its capability to the user
	//Arguments:
	// *$append_target - A jQuery collection that should represent
	initModule = function ($append_target) {
		$append_target.append(configMap.main_html);
		stateMap.$append_target = $append_target;
		setJqueryMap();
		setPxSizes();

		jqueryMap.$toggle.prop('title', configMap.slider_closed_title);
		jqueryMap.$head.click(onClickToggle);
		stateMap.position_type = 'closed';

		return true;
	};

	//Purpose:
	// *removes chatSlider DOM element
	// *reverts to initial state
	// *removes pointers to callbacks and other data
	removeSlider = function () {
		if(jqueryMap.$slider){
			jqueryMap.$slider.remove();
			jqueryMap = {};
		}
		stateMap.$append_target = null;
		stateMap.position_type = 'closed';
		configMap.chat_model = null;
		configMap.people_model = null;
		configMap.set_chat_anchor = null;

		return true;
	};
	return {
		setSliderPosition: setSliderPosition,
		configModule: configModule,
		initModule: initModule,
		removeSlider: removeSlider
	};
	//------------END PUBLIC METHODS----------

}();



