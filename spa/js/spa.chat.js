
/*
*spa.chat.js
*Chat feature module for SPA
*/
spa.chat = function () {
	//-----------	begin module scope variables-------
	var
		configMap = {               //�Ѿ�̬����ֵ����configMap��
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
			settable_map: {             //��chart�������÷������ģ����
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
		//��������ģ���й���Ķ�̬��Ϣ���ڱ�����, ���������г����л��õ��ļ���һ�ֺܺõķ���
		stateMap = {
			$append_target: null,
			position_type: 'closed',
			px_per_em: 0,
			slider_hidden_px: 0,
			slider_closed_px: 0,
			slider_opened_px: 0
		},
		jqueryMap = {},         //��jQuery���ϻ�����jqueryMap��
		setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
		onClickToggle, configModule, initModule, removeSlider, handleResize
		;
	//------------end module scope variables----------

	//------------BEGIN UTILITY METHODS-----------
	//��em��ʾ��λת��Ϊ���أ���������ʹ��jQuery�ķ�������
	getEmSize = function (elem) {
		return Number(
			getComputedStyle( elem, '' ).fontSize.match(/\d*\.?\d*/)[0]
		);
	};
	//------------END UTILITY MOTHODS------------

	//	-----------BEGIN DOM METHODS-----------
	//�������Ͳ���ҳ��Ԫ�صĺ�������DOM Methods������
	//����jQuery���ϣ��������Ǳ�д��ÿ��shell�͹��ܶ�Ӧ��������������������;��
	//���Դ��ؼ���jQuery���ĵ��ı����������������
	setJqueryMap = function () {
		var
			$append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');

		jqueryMap = {             //�����컬���jQuery���ϻ��浽jqueryMap��
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

	//�����ɸ�ģ������Ԫ�ص����سߴ�

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
	//ÿ������ģ��������ã�setting��ʱ����������ʹ����ͬ�ķ�������
	//ͬһ��spa.util.setConfigMap���߷���
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

	//�������е�ģ�鶼�����������������ʼִ��ģ��
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



