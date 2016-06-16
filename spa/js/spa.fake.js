spa.fake = (function(){
    'use strict';
    var getPeopleList, fakeInSerial, makeFadeId, mockSio;
    //ģ��������ķ����ID��ż�����
    fakeInSerial = 5;

    //��������ģ��ķ�����ID�ַ����ķ���
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
        //��ĳ����Ϣ����ע��ص�����
        on_sio = function ( msg_type, callback ) {
            callback_map[msg_type] = callback;
        };

        //ģ���������������Ϣ
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








