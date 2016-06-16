spa.model = (function(){
    'use strict';
    var
        configMap = { anod_id : 'a0'},
        stateMap = {
            anon_user : null,        //保存匿名person对象
            cid_serial : 0,
            people_cid_map : {},    //保存person对象映射，键为客户端ID
            people_db : TAFFY(),     //保存person对象的TaffyDB集合，初始化为空集合
            user : null
        },

        isFakeData = true,        //标志着使用Fake模块的示例数据而不是真实数据

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

    //添加客户端ID生成器，那些在客户端创建还没有保存到后端的对象没有服务器ID
    makeCid = function () {
        return 'c' + String( stateMap.cid_serial++ );
    };

    //移除所有除匿名人员之外的person对象，如果已有用户登入，则
    //也要将当前用户移除
    clearPeopleDb = function () {
        var user = stateMap.user;
        stateMap.people_db = TAFFY();
        stateMap.people_cid_map = {};
        if( user ){
            stateMap.people_cid_map[user.cid] = user;
            stateMap.people_db.insert( user );
        }
    };

    //当后端发送回用户的确认信息和数据时，完成用户的登入。
    //这段程序会更新当前用户信息，然后发布登入成功的spa-login事件
    completeLogin = function ( user_list ) {
        var user_map = user_list[0];
        delete stateMap.people_cid_map[ user_map.cid ];
        stateMap.user.cid = user_map._id;
        stateMap.user.id = user_map._id;
        stateMap.user.css_map = user_map.css_map;
        stateMap.people_cid_map[ user_map._id ] = stateMap.user;

        $.gevent.publish( 'spa-login', [stateMap.user] );
    };

    //添加创建person对象的方法，并将新创建的对象保存到TaffyDB集合中，也
    //确保更新people_cid_map里面的索引
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

    //创建人员从列表中移除person对象的方法
    removePerson = function ( person ) {
        if( !person ){ return false; }
        //不能移除匿名用户
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

            //向后端发送adduser消息，携带用户的详细信息，添加用户和登录是一回事
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
        //在initModule里面创建匿名person对象，确保他有和其他person对象一样的方法属性，
        // 不用考虑将来的更改
        stateMap.anon_user = makePerson({
            cid : configMap.anod_id,
            id : configMap.anod_id,
            name : 'anonymous'
        });
        stateMap.user = stateMap.anon_user;

        //获取Fake模块的在线人员列表，把它添加到TaffyDB结合people_db里面
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






















