/*
* spa.util_b.js
* js browser utilities
* */
spa.util_b = (function () {
   'use strict';
    //-------------BEGIN MODULE SCOPE VARIABLES-----------
    var
        configMap = {         //����ģ�������
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
    configMap.encode_noamp_map = $.extend(      //����һ���޸ĺ�����õĸ��������ڱ���ʵ��
        {}, configMap.html_encode_map
    );
    delete  configMap.html_encode_map['&'];   //��Ҫɾ��&����
    //-------------END MODULE SCOPE VARIABLES-------------

    //-----------BEGIN UTILITY METHODS-------------
    //����ͱ���html�е������ַ�
    //����decodenHtml�������������ʵ�壨��&amp��ת������ʾ�ַ���&��
    decodeHtml = function (str) {
        return $('<div/>').html(str || '').text();
    };

    //���������ת��Ϊhtml����ֵ
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

    //������emΪ��λ�����ش�С
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















