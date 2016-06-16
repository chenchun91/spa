/*
* spa.util_b.js
* js browser utilities
* */
spa.util_b = (function () {
   'use strict';
    //-------------BEGIN MODULE SCOPE VARIABLES-----------
    var
        configMap = {         //保存模块的配资
            regex_encode_html : /[&"'><]/g,
            regex_encode_noamp : /["'><]/g,
            html_encode_map : {
                '&' : '&#38',
                '"' : '&#34',
                '>' : '&#62',
                "'" : '&#39',
                '<' : '&#60'
            }
        },
        decodeHtml, encodeHtml, getEmsize;
    configMap.encode_noamp_map = $.extend(      //创建一份修改后的配置的副本，用于编码实体
        {}, configMap.html_encode_map
    );
    delete  configMap.html_encode_map['&'];   //但要删除&符号
    //-------------END MODULE SCOPE VARIABLES-------------

    //-----------BEGIN UTILITY METHODS-------------
    //解码和编码html中的特殊字符
    //创建decodenHtml方法，把浏览器实体（如&amp）转换成显示字符（&）
    decodeHtml = function (str) {
        return $('<div/>').html(str || '').text();
    };

    //把特殊符号转换为html编码值
    //THis is single pass encoder for html entities and handles an
    //arbitrary number of characters
    encodeHtml = function ( input_arg_str, exclude_map ) {
        var
            inpt_str = String( input_arg_str),
            regex, lookup_map;
        if( exclude_map ){
            lookup_map = configMap.encode_noamp_map;
            regex = configMap.regex_encode_html;
        }else {
            lookup_map = configMap.html_encode_map;
            regex = configMap.regex_encode_html;
        }
        return input_str.replace(regex,
            function (match, name) {
                return lookup_map[match] || '';
            }
        );
    };

    //计算以em为单位的像素大小
    getEmsize = function ( elem ) {
        return Number(
            getComputedStyle( elem, '').fontSize.match(/\d*\.?\d*/)[0]
        );
    };
    return {
        decodeHtml : decodeHtml,
        encodeHtml : encodeHtml,
        getEmSize : getEmsize
    };
    //-----------END UTILITY METHODS---------------
}());















