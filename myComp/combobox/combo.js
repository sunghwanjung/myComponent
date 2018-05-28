function xgCombo(element, options) {
  var innerHtml = '<div class="xg-combo-inputSection">' +
    '<input type="text" class="xg-combo-input">' +
    '<div class="xg-combo-listbutton"></div>' +
    '</div>' +
    '<div class="xg-combo-list" style="display: none;" status="hide">' +
    '<ul class="xg-combo-items">' +
    '</ul>' +
    '</div>';
  /*			<li class="xg-combo-item">테스트1</li>
  <li class="xg-combo-item">테스트2</li>
  <li class="xg-combo-item">테스트3</li>  리스트 구조  */

  element.append(innerHtml);

  var xgComboProp = {
    checkBoxes: false,
    checkBoxWidth: 20,
    listBoxRendered: false, //콤보박스 리스트를 오픈하기 전에는 렌더링이 되었는지 체크한다
    maxWidth: 0,
    valueParam: "value",
    displayParam: "text",
    codeParam: "value",
    index: null,
    autoWidth: true,
    autoHeight: true
  };

  if (options != null) {
    var keys = Object.keys(options);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      xgComboProp[key] = options[key];
    }
  }

  //내부 엘리먼트 캐시
  element.addClass("xg-combobox");
  xgComboProp.host = element;
  xgComboProp.combolist = element.find(".xg-combo-list");
  xgComboProp.comboinput = element.find(".xg-combo-input");
  xgComboProp.lsitbutton = element.find(".xg-combo-listbutton");
  xgComboProp.comboitems = element.find(".xg-combo-items");


  //combo에서  사용할 function

  //콤보 리스트박스를 표시하는 함수
  xgComboProp.showlist = function () {
    if (xgComboProp.combolist.attr("status") == "show") return;

    if (!xgComboProp.listBoxRendered) {//item이 렌더링되지 않았을 시 렌더링한다
      xgComboProp.addItem();
      xgComboProp.listBoxRendered = true;
    }

    xgComboProp.combolist.attr("status", "show");
    xgComboProp.combolist.slideDown(200);
    xgComboProp.host.trigger("listOpened");
  }

  //콤보 리스트박스를 숨기는 함수
  xgComboProp.hidelist = function () {
    if (xgComboProp.combolist.attr("status") == "hide") return;

    xgComboProp.combolist.attr("status", "hide");
    xgComboProp.combolist.slideUp(200);
    xgComboProp.host.trigger("listClosed");
  }

  //array로 담겨온 source를 참조해서 리스트박스 아이템을 추가하는 함수
  xgComboProp.addItem = function (source) {
    if (source == null) {
      source = xgComboProp.source;
    } else {
      xgComboProp.source = source;
    }

    var item = $(xgComboProp.getItemHtmls(source));

    xgComboProp.comboitems.html("").append(item);
    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();
  }

  //단일로 담겨온 source를 참조해서  리스트박스의 특정 인덱스에 아이템을 추가하는 함수
  xgComboProp.insertAt = function (source, index) {
    if (!xgComboProp.listBoxRendered) {//리스트가 렌더링되지 않았으면 source에만 추가해 둔다
      if (index == null) {
        xgComboProp.source.push(source);
      } else {
        xgComboProp.source.splice(Number(index), 0, source)
      }
      return;
    }

    var item = $(xgComboProp.getItemHtmls(source));
    if (index == null) {
      xgComboProp.comboitems.append(item);
      xgComboProp.source.push(source);
    } else {
      var childrens = xgComboProp.comboitems.children();
      xgComboProp.comboitems[0].insertBefore(item[0], childrens[index]);
      xgComboProp.source.splice(Number(index), 0, source)
    }
    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();
  }

  //리스트박스의 특정 인덱스에 아이템을 제거하는 함수
  xgComboProp.removeAt = function (index) {

    if (!xgComboProp.listBoxRendered) {//리스트가 렌더링되지 않았으면 source에만 추가해 둔다
      xgComboProp.source.splice(Number(index), 1);
      return;
    }

    xgComboProp.comboitems.children().eq(index).remove();
    xgComboProp.source.splice(Number(index), 1);
    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();
  }

  //items안에 추가할 item의 html 생성하면서 내부 길이도 계산
  xgComboProp.getItemHtmls = function (source) {
    var result = "",
      displayParam = xgComboProp.displayParam,
      span = $("<span style='display : none'></span>").appendTo("body");
    //body에 추가된 span에 text를 넣고 직접 width를 구한다
    if (!xgComboProp.checkBoxes) {
      if (source.constructor == Array) {
        for (var i = 0, len = source.length; i < len; i++) {
          var nowSource = source[i];
          result += '<li class="xg-combo-item" style="width : ' + _getWidth(nowSource[displayParam]) + 'px;">' + nowSource[displayParam] + '</li>';
        }
      } else if (source.constructor == Object) {
        result += '<li class="xg-combo-item" style="width : ' + _getWidth(source[displayParam]) + ';">' + source[displayParam] + '</li>';
      }
    } else {
      if (source.constructor == Array) {
        for (var i = 0, len = source.length; i < len; i++) {
          var nowSource = source[i];
          result += '<li class="xg-combo-item" style="width : ' + _getWidth(nowSource[displayParam]) + 'px;">' +
            '<input type="checkbox">' + nowSource[displayParam] + '</li>';
        }
      } else if (source.constructor == Object) {
        result += '<li class="xg-combo-item" style="width : ' + _getWidth(source[displayParam]) + 'px;">' +
          '<input type="checkbox">' + source[displayParam] + '</li>';
      }
    }

    span.remove();

    function _getWidth(text) {
      span.html(text);
      var width = span.width();

      if (xgComboProp.checkBoxes) {
        width += xgComboProp.checkBoxWidth;
      }
      return width;
    }

    return result;
  }

  /*
  * 콤보박스 리스트아이템들의 width를 확인해서 가장 긴 길이를 maxWidth에 세팅하는 함수
  * host의 width보다 짧을 경우 host의 width를 세팅한다
  */
  xgComboProp.setMaxWidthFromItems = function () {
    var childrens = xgComboProp.comboitems.children(),
      maxWidth = 0;

    for (var i = 0, len = childrens.length; i < len; i++) {
      var nowWidth = parseFloat(childrens[i].style.width);
      if (maxWidth < nowWidth) {
        maxWidth = nowWidth;
      }
    }
    var hostWidth = parseFloat(xgComboProp.host[0].style.width);
    if (maxWidth < hostWidth) {
      maxWidth = hostWidth - 20;
    }

    xgComboProp.maxWidth = maxWidth;
  }

  xgComboProp.setSize = function () {
    if (xgComboProp.autoWidth) {
      xgComboProp.combolist.width(xgComboProp.maxWidth + 20); //20을 더 더해야 스크롤이 안나옴
    }

    if (xgComboProp.autoHeight) {

    }
  }

  //index 또는 text를 넘겨서 두번째 인자로 넘긴 키에 해당하는 값을 넘겨받는다.
  xgComboProp.getValueByType = function (value, type) {
    var source = xgComboProp.source,
      result;

    if (typeof value != "undefined" && !isNaN(value)) {//index가 넘어온 경우
      result = source[value][type];
    } else {
      for (var i = 0, len = source.length; i < len; i++) {//text가 넘어온 경우
        var nowSource = source[i];
        if (nowSource.text == value) {
          result = source[i][type];
          break;
        }
      }
    }

    return result;
  }

  xgComboProp.getValue = function (value) {
    return xgComboProp.getValueByType(value, xgComboProp.valueParam);
  }

  xgComboProp.getText = function (value) {
    return xgComboProp.getValueByType(value, xgComboProp.displayParam);
  }

  xgComboProp.getChecked = function (type) {
    var checkboxes = xgComboProp.comboitems.find("input"),
      source = xgComboProp.source,
      result = "";

    for (var i = 0, len = checkboxes.length; i < len; i++) {
      if (checkboxes[i].checked) {
        result += source[i][type] + ",";
      }
    }

    return result.substring(0, result.length - 1);
  }

  xgComboProp.getCheckedValue = function () {
    return xgComboProp.getChecked(xgComboProp.valueParam);
  }

  xgComboProp.getCheckedText = function () {
    return xgComboProp.getChecked(xgComboProp.displayParam);
  }

  xgComboProp.getIndexByLiElement = function (target) {
    var childrens = xgComboProp.comboitems.children();

    for (var i = 0, len = childrens.length; i < len; i++) {
      if (childrens[i] == target) {
        break;
      }
    }
    return i;
  }

  xgComboProp.destroy = function () {
    var element = xgComboProp.host;
    element.unbind();
    xgComboProp.combolist.unbind();
    xgComboProp.comboinput.unbind();
    xgComboProp.lsitbutton.unbind();
    xgComboProp.comboitems.unbind();

    delete element[0].xgComboProp;
    element.remove();
  }

  //combo에서  사용할 function 종료


  //엘리먼트에 이벤르를 추가하는 함수
  function addEvent() {
    xgComboProp.host.on("focusout", function () {
      xgComboProp.hidelist();
    });

    xgComboProp.lsitbutton.on("click", function () {
      var status = xgComboProp.combolist.attr("status");
      if (status == "hide") {
        xgComboProp.showlist()
      } else if (status == "show") {
        xgComboProp.hidelist()
      }
    });

    //comboitems를 클릭 시 값을 세팅하거나 선택 클래스를 추가하거나 제거하는 이벤트
    xgComboProp.comboitems.on("click", function (evt) {
      var target = evt.target;

      if (!xgComboProp.checkBoxes) {
        var childrens = $(this).children();
        for (var i = 0, len = childrens.length; i < len; i++) {
          if (childrens[i] == evt.target) {
            break;
          }
        }

        var selectedValue = xgComboProp.getText(i);
        xgComboProp.comboinput[0].value = selectedValue;
        xgComboProp.hidelist();

        if (xgComboProp.nowClickedTarget != null) {
          xgComboProp.nowClickedTarget.removeClass("xg-combo-item-selected");
        }
        xgComboProp.nowClickedTarget = $(target).addClass("xg-combo-item-selected");

        var event = $.Event("select");
        var index = xgComboProp.getIndexByLiElement(target);
        event.args = {};
        event.args.index = index;
        event.args.item = xgComboProp.source[index];
        xgComboProp.host.trigger(event);

      } else {
        var check;
        if (target.tagName == "LI") {
          check = target.children[0].checked;
          if (check) {
            target.children[0].checked = false;
            check = false;
          } else {
            target.children[0].checked = true;
            check = true;
          }
        } else {
          check = target.checked;
          target = target.parentElement[0];
        }

        xgComboProp.comboinput[0].value = xgComboProp.getCheckedText();

        var event = $.Event("checkChange");
        event.args = {};

        var index = xgComboProp.getIndexByLiElement(target);
        event.args.index = index;
        event.args.item = xgComboProp.source[index];
        event.args.checked = check;

        xgComboProp.host.trigger(event);
      }
    });

  }

  addEvent();

  element[0].xgComboProp = xgComboProp;

  return xgComboProp;
}
