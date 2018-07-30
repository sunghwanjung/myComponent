function createhMap(Ele, options){
  var element =
              "<div>" +
                "<img ondragstart='return false'>" +
              "</div>";


  Ele.append(element);

  var jshMap = {
    nowImageOffset : { x : 0 , y : 0 },
    width : 500,
    height : 500,
    canCreateMark : false,
    markList : {},
    triggerEvent : true,
    markMove : false
  };

  var innerOptions = {
    imgDraggable : false,
    markDraggable : false,
    focusedOffset : { x : 0 , y : 0 },
    markFocusedOffset : { x : 0 , y: 0 },
    events : ["rclick", "markclick"],
    nowDraggingMark : null,
    mouseOnMark : false
  };

  _setProp(jshMap, options);


  /* 외부 공개 함수 */

  jshMap.destroy = function(){
    jshMap.mdiddleDiv.off().remove();
    jshMap.backImg.off().remove();

    var markList = jshMap.markList;
    for(var key in markList){
      markList[key].ele.off().remove();
    }

    jshMap.host.off().remove();
  }

  jshMap.getMarkEle = function(key){
    return jshMap.markList[key].ele;
  }

  jshMap.getMarkOption = function(key){
    return jshMap.markList[key];
  }

  jshMap.getMarkStandardOptionText = function(){
    var result = '{';
    var markList = jshMap.markList;
    var keys = Object.keys(markList);

    for(var i = 0, len = keys.length; i < len; i++){
      var key = keys[i];
      var mark = markList[key];
      result += '"' + key + '":{';
      result += '"left":"' + mark.left + '","top":"' + mark.top + '","text":"' + mark.text + '"}';

      if(i + 1 != len){
        result += ', \n';
      }
    }

    return result + '}';
  }

  /* 외부 공개 함수 */


  /* 내부 함수 */

  function _checkOutofSize(movedOffset){
    var img = jshMap.backImg[0];
    var host = jshMap.host[0];
    var hostWidth = parseFloat( host.style.width);
    var hostHeight = parseFloat( host.style.height);

    //x,y가 0보다 크면 공백이 생김
    movedOffset.x = movedOffset.x > 0 ? 0 : movedOffset.x;
    movedOffset.y = movedOffset.y > 0 ? 0 : movedOffset.y;

    //x - 이미지 width가 div width보다 작으면 공백이 생김
    if( (img.width + movedOffset.x) < hostWidth )
      movedOffset.x = hostWidth - img.width;

    //y - 이미지 height가 div height보다 작으면 공백이 생김
    if( (img.height + movedOffset.y) < hostHeight )
      movedOffset.y = hostHeight - img.height;
  }

  //map 컴포넌트에서 마우스가 빠져나갔는지 확인
  function _checkMouseOut(pageX,pageY){
    var host = jshMap.host;
    var offset = host.offset();
    var xStart = offset.left;
    var xEnd = xStart + host.width();
    var yStart = offset.top;
    var yEnd = yStart + host.height();

    if(xStart <= pageX && xEnd >= pageX && yStart <= pageY && yEnd >= pageY){
      return false;
    }else{
      return true;
    }

  }

  function _createMark(options, key){
    var ele;

    if(options == null) options = {text : "테스트"};

    /*
      mark ele를 생성하는 함수가 개별로 선언이 되어있는지 확인.
      mark생성 함수는 항상 jQuery 객체를 반납받도록 만든다.
    */
    if(options.createFunc != null && typeof options.createFunc == "function"){
        ele = options.createFunc(options);
    }else{
        ele = jshMap._createMark(options);
    }

    options.ele = ele;
    if(options.left == null) options.left = 0;
    if(options.top == null) options.top = 0;

    ele.css({
      position : "absolute",
      left : options.left,
      top : options.top
    }).attr("markKey", key);

    //추가된 mark 내부의 모든 element에 markKey를 추가
    ele.find("*", function(){
      this.setAttribute("markKey", key);
    });

    ele.on(_getMoveMarkEvent());

    jshMap.mdiddleDiv.append(ele);
  }

  function _getMovedOffset(x,y){
    var nowoffset = jshMap.nowImageOffset;
    var focusedOffset = innerOptions.focusedOffset;
    return {x : nowoffset.x - ( focusedOffset.x - x) , y : nowoffset.y - ( focusedOffset.y - y) };
  }

  function _getMarkMovedOffset(x,y){
    var markFocusedOffset = innerOptions.markFocusedOffset;
    return {x :  x - markFocusedOffset.x , y :  y - markFocusedOffset.y };
  }

  function _getMoveMarkEvent(){
    var events = {};

    /* mouseup, mouseout, mousemove 이벤트는 mark element에서 직접 처리하지 않고 host element에서 처리한다
    */
    events.mousedown = function(e){
      if(jshMap.markMove){
        innerOptions.markDraggable = true;
        _setMarkFocusedOffset(e.pageX,e.pageY);
        innerOptions.nowDraggingMark = _getMarkParent(this);
      }
    }

    events.mouseenter = function(e){
      innerOptions.mouseOnMark = true;
    }

    events.mouseout = function(e){
      e.stopPropagation();
      innerOptions.mouseOnMark = false;
    //  innerOptions.markDraggable = false;
    }

    return events;
  }

  //선택된 html element가 mark의 최상위 element 인지 확인.
  //mark element는 모두 attribute로 markKey를 가지고 있다.
  function _getMarkParent(target){
    if(target.getAttribute("markKey") == null) return null;

    if(target.parentElement.getAttribute("markKey") != null){
      return _getMarkParent(target.parentElement);
    }
    return target;
  }

  function _setMarkFocusedOffset(x,y){
    var markFocusedOffset = innerOptions.markFocusedOffset;
    markFocusedOffset.x = x;
    markFocusedOffset.y = y;
  }

  function _setNowImgOffset(x,y){
    var nowImageOffset = jshMap.nowImageOffset;
    nowImageOffset.x = x;
    nowImageOffset.y = y;
  }

  function _moveMark(e){
    // 선택된게 mark의 최상위 개체란걸 확인해야함
    if(!jshMap.markMove || !innerOptions.markDraggable) return;

    var target = innerOptions.nowDraggingMark;

    var movedOffset = _getMarkMovedOffset(e.pageX, e.pageY);
    var left = parseFloat( target.style.left ) + movedOffset.x +  "px";
    var top =  parseFloat( target.style.top )  + movedOffset.y + "px";
    $(target).css({"left" : left, "top" :  top});

    var options = jshMap.getMarkOption(target.getAttribute("markKey"));

    options.left = left;
    options.top = top;

    _setMarkFocusedOffset(e.pageX,e.pageY);
  }

  function _setFocusedOffset(x,y){
    var focusedOffset = innerOptions.focusedOffset;
    focusedOffset.x = x;
    focusedOffset.y = y;
  }

  function _setProp(compOptions, options){
    var keys = Object.keys(options);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      compOptions[key] = options[key];
    }
  }

  function _triggerEvent(event, args){
    if(!jshMap.triggerEvent)
      return;

    var event = $.Event(innerOptions.events[event]);
    event.args = args;

    jshMap.host.trigger(event);
  }

  /* 내부 함수 종료 */





  /* 이빈트, 클래스 추가 로직 */
  function _init(){
    jshMap.host = Ele;
    jshMap.mdiddleDiv = jshMap.host.children().eq(0);
    jshMap.backImg = jshMap.mdiddleDiv.children().eq(0);


    jshMap.host = Ele;
    jshMap.img = $( new Image() );

    //mark를 만드는 공통 로직. 반드시 jQuery 객체를 반납해야 한다.
    var createMarkFunc = jshMap["_createMark"];
    if(createMarkFunc == null || typeof createMarkFunc != "function"){
      jshMap["_createMark"] = function(options){
        var append = "<div style='width:50px;height:50px;border:solid red 2px;'> " + options.text + " </div>";
        return $(append);
      }
    }

    if(options != null ){
      if(options.imgSrc != null)
        jshMap.backImg.attr("src",options.imgSrc);

      if(options.markList != null){
        for(var key in options.markList){
          _createMark(options.markList[key], key);
        }
      }

    }
  }

  function _addClassAndStyle(){
    jshMap.host.addClass("jshmap");
    jshMap.mdiddleDiv.addClass("jshmap-middle-div");
    jshMap.backImg.addClass("jhmap-img");
    jshMap.host.css({
        width : jshMap.width ,
        height : jshMap.height
    })
  }

  function _addEvents(){
    jshMap.host.on({
      mousedown : function(e){
        if(!jshMap.markMove || !e.target.getAttribute("markKey")){ //mark가 이동 가능하면서 mark 엘리먼트를 클릭했을 경우가 아닐 때만
          innerOptions.imgDraggable = true;
          _setFocusedOffset(e.pageX,e.pageY);
        }
      },
      mousemove : function(e){
        _moveMark(e);

        if(!innerOptions.imgDraggable)
          return;

        /*
         * 1. mousedown 시 focusedOffset을 세팅함
         * 2. drag 시  이미지의 offset - (focusedOffset - 현재 마우스 위치의 offset) 으로 수정되어야 할 x,y의 위치를 구함
         * 3. focusedOffset을 drag 된 위치의 offset으로 수정함

        */
        var middelDiv = jshMap.mdiddleDiv;
        var movedOffset = _getMovedOffset(e.pageX, e.pageY);

        _setFocusedOffset(e.pageX,e.pageY);

        _checkOutofSize(movedOffset);

        middelDiv.css({left : movedOffset.x , top :  movedOffset.y})

        _setNowImgOffset(movedOffset.x,movedOffset.y);
      },
      mouseup : function(e){
        innerOptions.imgDraggable = false;
        innerOptions.markDraggable = false;
        innerOptions.nowDraggingMark = null;
      },
      mouseout : function(e){
        if(_checkMouseOut(e.pageX, e.pageY) || !innerOptions.mouseOnMark  ){
          innerOptions.imgDraggable = false;
        }

        if(_checkMouseOut(e.pageX, e.pageY)){//mark element로 이동해서 mouseout 아웃이 된건지 확인
          innerOptions.markDraggable = false;
          innerOptions.nowDraggingMark = null;
        }
      },
      click : function(e){
        var markKey = e.target.getAttribute("markKey");
        if(markKey != null){
          _triggerEvent(1, {"markKey" : markKey, "mouse" : "left"});//markclick
          return false;
        }
      },
      contextmenu : function(e){
        var markKey = e.target.getAttribute("markKey");

        if(markKey != null){ //mark element를 클릭한게 아니면 host의 우클릭 이벤트를 일으키기
          _triggerEvent(1, {"markKey" : markKey, "mouse" : "right"});//markclick
          return false;
        }

        if(jshMap.canCreateMark){
          _createMarkByClick();
        }

        _triggerEvent(0);//rclick event
        return false;

        function _createMarkByClick(){
          var keys = Object.keys(jshMap.markList);
          var key = (keys.length + 1) + "";

          var offset = jshMap.nowImageOffset;
          var focused = {x : e.pageX , y : e.pageY}
          var hostoffset = jshMap.host.offset();
          var x = (offset.x * -1 + focused.x - hostoffset.left) + "px";
          var y = (offset.y * -1 + focused.y - hostoffset.top) + "px";
          var createOptions = { left : x, top : y,  text : "테스트" };
          _createMark(createOptions, key);

          jshMap.markList[key] = createOptions;

          //마우스 동작으로 생성된 마크는 더블클릭으로 삭제하는 이벤트 추가
          createOptions.ele.on({
            dblclick : function(){
              $(this).off().remove();
              delete jshMap.markList[key];
            }
          });
        }
      }
    });
  }
  _init();
  _addClassAndStyle();
  _addEvents();

  /* 이빈트, 클래스 추가  종료*/

  jshMap.host.prop("jshMap",jshMap);
  return jshMap;
}
