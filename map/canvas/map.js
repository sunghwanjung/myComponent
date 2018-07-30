function createhMap(Ele, options){
  var element =
              "<canvas class='jshCanvas' ></canvas>";


  Ele.append(element);

  var jshMap = {
    nowImageOffset : { x : 0 , y : 0 }
  };

  var innerOptions = {
    imgDraggable : false
    ,focusedOffset : { x : 0 , y : 0 }
  };

  jshMap.host = Ele;
  jshMap.canvas = jshMap.host.find("canvas");
  jshMap.canvasCtx = jshMap.canvas[0].getContext("2d");
  jshMap.img = $( new Image() );

  Ele.addClass("jshMapCanvas");

  $(window).ready(function(){
    jshMap.img[0].addEventListener("load", function(e){
      _drawMap();
    } ,false);
  });

  if(options !=null && options.imgSrc != null)
    jshMap.img.attr("src",options.imgSrc);



  function _drawMap(x,y,width,height){
    var img = jshMap.img[0];
    var ctx = jshMap.canvasCtx;

    if(x == null) x = 0;
    if(y == null) y = 0;

    _setNowImgOffset(x,y);

    if(width == null || height == null){
        ctx.drawImage( img , x, y);
    }else{
        ctx.drawImage( img , x, y, width, height);
    }
  }

  function _setFocusedOffset(x,y){
    var focusedOffset = innerOptions.focusedOffset;
    focusedOffset.x = x;
    focusedOffset.y = y;
  }

  function _setNowImgOffset(x,y){
    var nowImageOffset = jshMap.nowImageOffset;
    nowImageOffset.x = x;
    nowImageOffset.y = y;
  }

  function _addEvents(){
    jshMap.canvas.on({
      mousedown : function(e){
        innerOptions.imgDraggable = true;
        _setFocusedOffset(e.offsetX,e.offsetY);
      },
      mousemove : function(e){
        if(!innerOptions.imgDraggable)
          return;
        /*
         * 1. mousedown 시 focusedOffset을 세팅함
         * 2. drag 시  이미지의 offset - (focusedOffset - 현재 마우스 위치의 offset) 으로 수정되어야 할 x,y의 위치를 구함
         * 3. focusedOffset을 drag 된 위치의 offset으로 수정함
        */
        var img = jshMap.img[0];
        var canvas = jshMap.canvas[0];
        var movedOffset = _getMovedOffset(e.offsetX, e.offsetY);

        _setFocusedOffset(e.offsetX, e.offsetY);
        _checkOutofSize(movedOffset,img,canvas);

        jshMap.canvasCtx.clearRect(0,0, canvas.width, canvas.height);
        _drawMap(movedOffset.x,movedOffset.y,  img.width, img.height);
        _setNowImgOffset(movedOffset.x,movedOffset.y);



        function _getMovedOffset(x,y){
          var nowoffset = jshMap.nowImageOffset;
          var focusedOffset = innerOptions.focusedOffset;

          return {x : nowoffset.x - ( focusedOffset.x - x) , y : nowoffset.y - ( focusedOffset.y - y) };
        }

        function _checkOutofSize(movedOffset,img, canvas){
          //x,y가 0보다 크면 공백이 생김
          movedOffset.x = movedOffset.x > 0  ? 0 : movedOffset.x;
          movedOffset.y = movedOffset.y > 0 ? 0 : movedOffset.y;

          //x - 이미지 width가 canvas width보다 작으면 공백이 생김
          if( (img.width + movedOffset.x) < canvas.width )
            movedOffset.x = canvas.width - img.width;

          //y - 이미지 height가 canvas height보다 작으면 공백이 생김
          if( (img.height + movedOffset.y) < canvas.height )
            movedOffset.y = canvas.height - img.height;
        }
      },
      mouseup : function(e){
        innerOptions.imgDraggable = false;
      },
      mouseout : function(e){
        innerOptions.imgDraggable = false;
        _setNowImgOffset(e.offsetX,e.offsetY);
      }
    });
  }

  _addEvents();

  Ele.prop("jshMap",jshMap);
  return jshMap;
}
