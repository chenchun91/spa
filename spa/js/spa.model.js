spa.model = (function(){
    'use strict';
    var
        configMap = { anod_id : 'a0'},
        stateMap = {
            anon_user : null,        //��������person����
            cid_serial : 0,
            people_cid_map : {},    //����person����ӳ�䣬��Ϊ�ͻ���ID
            people_db : TAFFY(),     //����person�����TaffyDB���ϣ���ʼ��Ϊ�ռ���
            user : null
        },

        isFakeData = true,        //��־��ʹ��Fakeģ���ʾ�����ݶ�������ʵ����

        personProto, makeCid,clearPeopleDb, completeLogin,
        makePerson,removePerson, people, initModule;

    personProto = {
        get_is_user: function(){
            return this.cid === stateMap.user.cid;
        },
        get_is_anon : function () {
            return this.cid === stateMap.anon_user.cid;
        }
    };

    //��ӿͻ���ID����������Щ�ڿͻ��˴�����û�б��浽��˵Ķ���û�з�����ID
    makeCid = function () {
        return 'c' + String( stateMap.cid_serial++ );
    };

    //�Ƴ����г�������Ա֮���person������������û����룬��
    //ҲҪ����ǰ�û��Ƴ�
    clearPeopleDb = function () {
        var user = stateMap.user;
        stateMap.people_db = TAFFY();
        stateMap.people_cid_map = {};
        if( user ){
            stateMap.people_cid_map[user.cid] = user;
            stateMap.people_db.insert( user );
        }
    };

    //����˷��ͻ��û���ȷ����Ϣ������ʱ������û��ĵ��롣
    //��γ������µ�ǰ�û���Ϣ��Ȼ�󷢲�����ɹ���spa-login�¼�
    completeLogin = function ( user_list ) {
        var user_map = user_list[0];
        delete stateMap.people_cid_map[ user_map.cid ];
        stateMap.user.cid = user_map._id;
        stateMap.user.id = user_map._id;
        stateMap.user.css_map = user_map.css_map;
        stateMap.people_cid_map[ user_map._id ] = stateMap.user;

        $.gevent.publish( 'spa-login', [stateMap.user] );
    };

    //��Ӵ���person����ķ����������´����Ķ��󱣴浽TaffyDB�����У�Ҳ
    //ȷ������people_cid_map���������
    makePerson = function ( person_map ) {
        var
            person,
            cid = person_map.cid,
            css_map = person_map.css_map,
            id = person_map.id,
            name = person_map.name;
        /*if ( cid === undefined || ! name ) {
            throw 'client id and name required';
        }*/
        person = Object.create( personProto );
        person.cid = cid;
        person.name = name;
        person.css_map = css_map;
        if( id ){ person.id = id; }
        stateMap.people_cid_map[cid] = person;
        stateMap.people_db.insert( person );
        return person;
    };

    //������Ա���б����Ƴ�person����ķ���
    removePerson = function ( person ) {
        if( !person ){ return false; }
        //�����Ƴ������û�
        if( person.id === configMap.anod_id ){ return false;}

        stateMap.people_db({ cid: person }).remove();
        if( person.cid ){
            delete stateMap.people_cid_map[person.cid];
        }
        return true;
    };


    people = (function () {
        var get_by_cid, get_db, get_user, login, logout;
        get_by_cid = function (cid) {
            return stateMap.people_cid_map[cid];
        };
        get_db = function(){ return stateMap.people_db; };
        get_user = function(){ return stateMap.user; };

        login = function ( name ) {
            var sio = isFakeData? spa.fake.mockSio : spa.data.getSio();

            stateMap.user = makePerson({
                cid     : makeCid(),
                css_map : { top : 25, left : 25, 'background-color' : '#8f8'},
                name : name
            });
            sio.on( 'userupdate', completeLogin );

            //���˷���adduser��Ϣ��Я���û�����ϸ��Ϣ������û��͵�¼��һ����
            sio.emit('adduser', {
                cid : stateMap.user.cid,
                css_map : stateMap.user.css_map,
                name : stateMap.user.name
            });
        };

    logout = function () {
        var is_removed, user = stateMap.user;
        //when we add chat, we should leave the chatroom here
        is_removed = removePerson( user );
        stateMap.user = stateMap.anon_user;
        $.gevent.publish('spa-logout', [user]);
        return is_removed;
    };

    return {
        get_by_cid : get_by_cid,
        get_db : get_db,
        get_user : get_user,
        login : login,
        logout : logout
    };

    }());

    initModule = function () {
        var i, people_list, person_map;
        //��initModule���洴������person����ȷ�����к�����person����һ���ķ������ԣ�
        // ���ÿ��ǽ����ĸ���
        stateMap.anon_user = makePerson({
            cid : configMap.anod_id,
            id : configMap.anod_id,
            name : 'anonymous'
        });
        stateMap.user = stateMap.anon_user;

        //��ȡFakeģ���������Ա�б�������ӵ�TaffyDB���people_db����
        if( isFakeData ){
            people_list = spa.fake.getPeopleList();
            for( i = 0; i < people_list.length; i++){
                person_map = people_list[i];
                makePerson({
                    cid : person_map.id,
                    css_map : person_map.css_map,
                    id : person_map.id,
                    name : person_map.name
                });
            }
        }
    };
    return {
        initModule : initModule,
        people : people
    };
}());






















