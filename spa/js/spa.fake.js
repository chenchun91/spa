spa.fake = (function(){
    'use strict';
    var getPeopleList, fakeInSerial, makeFadeId, mockSio;
    //模拟服务器的服务端ID序号计数器
    fakeInSerial = 5;

    //创建生成模拟的服务器ID字符串的方法
    makeFadeId = function () {
        return 'id' + String( fakeInSerial++ );
    };

    getPeopleList = function () {
        return [
          { name: 'Betty', _id : 'id_01',
            css_map : { top : 20, left : 20,
              'background-color' : 'rgb( 128, 128, 128 )'
            }
          },
            { name: 'Mike', _id : 'id_02',
                css_map : { top : 60, left : 20,
                'background-color' : 'rgb( 128, 255, 128 )'
                }
            },
            { name: 'Pebble', _id : 'id_03',
                css_map : { top : 100, left : 20,
                'background-color' : 'rgb( 128, 192, 192 )'
                }
            },
            { name: 'Wilam', _id : 'id_04',
                css_map : { top : 140, left : 20,
                'background-color' : 'rgb( 192, 128, 128 )'
                }
            }
        ];
    };

    //
    mockSio = (function () {
        var on_sio, emit_sio, callback_map = {};
        //给某个信息类型注册回调函数
        on_sio = function ( msg_type, callback ) {
            callback_map[msg_type] = callback;
        };

        //模拟向服务器发送消息
        emit_sio = function (msg_type, data) {
            if( msg_type === 'adduser' && callback_map.userupdate ){
                setTimeout(function () {
                    callback_map.userupdate(
                        [{ id : makeFadeId(),
                           name : data.name,
                           css_map : data.css_map
                        }]
                    );
                },3000);
            }
        };
        return { emit : emit_sio, on : on_sio };
    }());
    return {
        getPeopleList : getPeopleList,
        mockSio : mockSio
    };
}());








