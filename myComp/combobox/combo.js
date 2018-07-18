function xgCombo(element, options) {
  if(element.length == 0){
    console.log("jQuery 객체에 문제가 있습니다");
    return
  }

  if(element[0].xgComboProp){
    return;
  }
  var innerHtml = '<div class="xg-combo-inputSection">' +
    '<input type="text" class="xg-combo-input">' +
    '<div class="xg-combo-listbutton"></div>' +
    '</div>' +
    '<div class="xg-combo-list" tabindex="-1" style="display: none;" status="hide">' +
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
    valueParam: "value",
    displayParam: "text",
    autoWidth: true,
    //autoHeight: true,
    multipleItem : false,
    multiItemTextOrder : null,
    index : -1,
    indexes : [],
    triggerEvent : true, //val 함수로 set을 할 때 이벤트를 일으킬 지 정하는 옵션
    getNomalItemHtml : function(nowSource){/*일반 콤보박스의 아이템 내부를 만드는 함수. 외부에서 함수를 수정해서 combobox 모양을 변경 가능    */
      var displayParam = xgComboProp.displayParam;
      return nowSource[displayParam];
    },
    getMultilItemHtml : function(nowSource){ /*멀티 콤보박스의 아이템 내부를 만드는 함수. 외부에서 함수를 수정해서 combobox 모양을 변경 가능   */
      var text = "";
      var order = xgComboProp.multiItemTextOrder == null ? Object.keys(nowSource) : xgComboProp.multiItemTextOrder;
      for(var z = 0, len2 = order.length; z < len2; z++){
        text += "<span class='xg-combo-item-span'>" + nowSource[order[z]] + "</span>";
      }
      return text;
    }
  };

  var innerOptions = {
    events : ['change', 'select', 'checkChange', 'listOpened', 'listClosed'],
    disabled : [],
    listBoxRendered: false, //콤보박스 리스트를 오픈하기 전에는 렌더링이 되었는지 체크한다
    maxWidth: 0,
  }

  if (options != null) {
    _setProp(options);
  }

  //내부 엘리먼트 캐시
  element.addClass("xg-combobox");
  xgComboProp.host = element;
  xgComboProp.combolist = element.find(".xg-combo-list");
  xgComboProp.comboinput = element.find(".xg-combo-input");
  xgComboProp.lsitbutton = element.find(".xg-combo-listbutton");
  xgComboProp.comboitems = element.find(".xg-combo-items");


  //combo에서  사용할 function

  xgComboProp.setProp = function(options){
    _setProp(options);
  }

  //콤보 리스트박스를 표시하는 함수
  xgComboProp.showlist = function () {
    if (xgComboProp.combolist.attr("status") == "show") return;

    if (!innerOptions.listBoxRendered) {//item이 렌더링되지 않았을 시 렌더링한다
      xgComboProp.createItems();
      if(xgComboProp.nowSelectedTarget != null)
        _addClassToSelectedItem(_getEleByIndex(xgComboProp.index));//선택된 엘리먼트에 클래스 추가
    }

    xgComboProp.combolist.attr("status", "show");
    xgComboProp.comboitems.css("overflow","hidden");
    xgComboProp.combolist.slideDown(200, function(){ xgComboProp.comboitems.css("overflow","auto"); });

    _triggerEvent(3);

    xgComboProp.combolist.focus();
  }

  //콤보 리스트박스를 숨기는 함수
  xgComboProp.hidelist = function () {
    if (xgComboProp.combolist.attr("status") == "hide") return;

    xgComboProp.combolist.attr("status", "hide");
    xgComboProp.comboitems.css("overflow","hidden");
    xgComboProp.combolist.slideUp(200);
    _triggerEvent(4);
  }

  //array로 담겨온 source를 참조해서 리스트박스 아이템을 추가하는 함수
  xgComboProp.createItems = function (source) {
    if (source == null) {
      source = xgComboProp.source;
    } else {
      xgComboProp.source = source;
    }

    var item = $(_getItemHtmls(source));

    xgComboProp.comboitems.html("").append(item);
    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();

    if(!innerOptions.listBoxRendered){//첫 렌더링 일 경우 추가 처리
      innerOptions.listBoxRendered = true;

      var disabled = innerOptions.disabled;

      if(disabled.length > 0){
        for(var i = 0, len = disabled.length; i < len; i++){
          if(disabled[i]) xgComboProp.disableAt(i);
        }
      }

    }
  }

  //단일로 담겨온 source를 참조해서  리스트박스의 특정 인덱스에 아이템을 추가하는 함수
  xgComboProp.insertAt = function (source, index) {
    if (!innerOptions.listBoxRendered) {//리스트가 렌더링되지 않았으면 source에만 추가해 둔다
      if (index == null) {
        xgComboProp.source.push(source);
      } else {
        xgComboProp.source.splice(Number(index), 0, source)
      }
      return;
    }

    var item = $(_getItemHtmls(source));
    if (index == null || index >= xgComboProp.source.length) {//index가 null이거나 세딩퇸 source의 length보다 길 경우
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

  xgComboProp.updateAt = function (newSource, index) {
    var nowSource = xgComboProp.source[index];

    for(var key in nowSource){
      nowSource[key] = newSource[key];
    }

    if (!innerOptions.listBoxRendered) {//리스트가 렌더링되지 않았으면 source만 변경하고 끝낸다
      return;
    }

    var item = $(_getItemHtmls(newSource));
    var parentUL = xgComboProp.comboitems[0];
    var childs = parentUL.children;
    if (index >= xgComboProp.source.length) {//index가 null이거나 세딩퇸 source의 length보다 길 경우
      childs[childs.length-1].remove();
      xgComboProp.comboitems.append(item);
    } else {
      var nowchild = childs[index];
      parentUL.insertBefore(item[0], nowchild.nextElementSibling);
      nowchild.remove();
    }

    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();
  }

  xgComboProp.removeByValue = function (value) {
    var index = xgComboProp.getIndexByValue();
    if (index != null)
      xgComboProp.removeAt(index);
  }

  //리스트박스의 특정 인덱스에 아이템을 제거하는 함수
  xgComboProp.removeAt = function (index) {
    if(xgComboProp.source == null || xgComboProp.source.length == 0)
      return;

    if (!innerOptions.listBoxRendered) {//리스트가 렌더링되지 않았으면 source 데이터만 처리한다
      xgComboProp.source.splice(Number(index), 1);
      return;
    }

    xgComboProp.comboitems.children().eq(index).remove();
    xgComboProp.source.splice(Number(index), 1);
    xgComboProp.setMaxWidthFromItems();
    xgComboProp.setSize();
  }

  xgComboProp.enableByValue = function(value){
    var index = xgComboProp.getIndexByValue(value);
    xgComboProp.enableAt(index);
  }

  xgComboProp.enableAt = function (index) {
    if(!innerOptions.listBoxRendered){//렌더가 안되었을 경우 처리
      var disabled = innerOptions.disabled;

      if(!_checkSource()){
        console.log("enableAt : source가 세팅되지 않았습니다");
        return;
      }

      if(disabled.length > 0)
        disabled[index] = false;

      return;
    }

    xgComboProp.comboitems.children().eq(index).removeClass("xg-combo-item-disabled");
  }

  xgComboProp.disableByValue = function (value){
    var index = xgComboProp.getIndexByValue(value);
    xgComboProp.disableAt(index);
  }

  xgComboProp.disableAt = function (index) {

    if(!innerOptions.listBoxRendered){//렌더가 안되었을 경우 처리
      var disabled = innerOptions.disabled;

      if(!_checkSource()){
        console.log("disableAt : source가 세팅되지 않았습니다");
        return;
      }

      if(disabled.length == 0){
        for(var i = 0, len = xgComboProp.source.length; i < len; i++){
          disabled.push(false);
        }
      }

      disabled[index] = true;
      return;
    }

    xgComboProp.comboitems.children().eq(index).addClass("xg-combo-item-disabled");
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

    innerOptions.maxWidth = maxWidth;
  }

  xgComboProp.setSize = function () {
    if (xgComboProp.autoWidth) {
      xgComboProp.combolist.width(innerOptions.maxWidth + 20); //20을 더 더해야 스크롤이 안나옴
    }

    if (xgComboProp.autoHeight) {
      //Todo autoHeight 일때 로직 구현하기
    }
  }

  xgComboProp.val = function(value){
    var prop = xgComboProp;

    if(!xgComboProp.checkBoxes){
      return _nonCheckBox();
    }else{
      return _checkBox();
    }

    function _checkBox(){
      if(value == null){ //get
        indexes = xgComboProp.indexes;
        var result = "";

        for(var i = 0,len=indexes.length; i<len; i++){
          result += xgComboProp.getValueByIndex(indexes[i]);

          if(i+1 != len) result += ",";
        }

        return result;
      }else{ //set
        var index = xgComboProp.getIndexByValue(value);
        xgComboProp.setIndex(index);
      }
    }

    function _nonCheckBox(){
      if(value == null){ //get
        return prop.source[prop.index][prop.valueParam];
      }else{ //set
        var index = xgComboProp.getIndexByValue(value);
        if(index == null) return;
        xgComboProp.setIndex(index);
      }
    }
  }

  xgComboProp.setIndex = function(index){
    var oldIndex = xgComboProp.index;
    if(index == oldIndex) return;

    var selectedValue = xgComboProp.getText(index);
    xgComboProp.comboinput[0].value = selectedValue;
    _setIndex(index);
    _addClassToSelectedItem(_getEleByIndex(index));//선택된 엘리먼트에 클래스 추가

    if(xgComboProp.triggerEvent){
      _triggerEvent(0, {oldIndex : oldIndex, newIndex : index});
    }
    //Todo setIndex 이후 로직 만들어야 함
  }

  xgComboProp.getIndex = function(){
    if(xgComboProp.checkBoxes){
      return xgComboProp.indexes.join(",");
    }else{
      return xgComboProp.index;
    }
  }

  xgComboProp.getValueByIndex = function (index) {
    var prop = xgComboProp;
    if(index == null || isNaN(index))
      return;

    return prop.source[index][prop.valueParam];
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

   xgComboProp.getValue = function (index) {
     return xgComboProp.getValueByType(index, xgComboProp.valueParam);
   }

  //value는 index 또는 value 값
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

  xgComboProp.getIndexByValue = function (value) {
    var source = xgComboProp.source;

    if(source == null || source.length == 0) return;

    var valuePram = xgComboProp.valueParam;
    for(var i = 0, len = source.length; i < len; i++){
      var nowValue = source[i][valuePram];
      if(nowValue == value && typeof nowValue == typeof value) return i;
    }
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


  //내부에서 사용하는 함수

  //엘리먼트에 이벤트를 추가하는 함수
  function _addEvent() {
    xgComboProp.combolist.on("focusout", function () {
      //xgComboProp.hidelist();
    });

    xgComboProp.lsitbutton.on("click", function () {
      var status = xgComboProp.combolist.attr("status");
      if (status == "hide") {
        xgComboProp.showlist();
      } else if (status == "show") {
        xgComboProp.hidelist();
      }
    });

    //comboitems를 클릭 시 값을 세팅하거나 선택 클래스를 추가하거나 제거하는 이벤트
    xgComboProp.comboitems.on("click", function (evt) {
      if(evt.target.tagName=="UL") return; //disabled 클래스가 추가된 LI를 클릭하면 UL을 반납할때가 많음

      var thisEle = $(this);
      var target = evt.target;
      var LiEle = _getParentLi(target);//클릭된게 LI가 아닐경우 LI를 찾아서 반납
      var index = xgComboProp.getIndexByLiElement(LiEle);

       if(_checkItemDisabled(index)) return;

      if (!xgComboProp.checkBoxes) {
        _nonCheckBox();
      } else {
        _checkBox();
      }


      function _getParentLi(targetEle){
        if(targetEle.tagName != "LI"){
          return _getParentLi(target.parentElement);
        }
        return targetEle;
      }

      function _nonCheckBox(){
        var childrens = thisEle.children();
        var oldIndex = xgComboProp.index;
        for (var i = 0, len = childrens.length; i < len; i++) {
          if (childrens[i] == LiEle) {
            _setIndex(i);
            break;
          }
        }

        var selectedValue = xgComboProp.getText(i);
        xgComboProp.comboinput[0].value = selectedValue;
        //xgComboProp.hidelist();

        _addClassToSelectedItem($(LiEle));

        _triggerEvent(1, {newIndex:index , oldIndex : oldIndex, item: xgComboProp.source[index]} );
      }

      function _checkBox(){
        var check;
        if (target.tagName != "INPUT") {//체크박스가 아닌 엘리먼트를 클릭한 경우
          var checkbox = LiEle.children[0];
          check = checkbox.checked ? false : true;//현재 체크 상태의 반대로
          checkbox.checked = check;

        } else {//체크박스를 클릭한 경우
          check = target.checked;
        }
        _setIndexes(index,check);
        xgComboProp.comboinput[0].value = xgComboProp.getCheckedText();

        _triggerEvent(2, {index : index, item : xgComboProp.source[index], checked : check});
      }
    });
  }

  function _checkItemDisabled(index){
    if(xgComboProp.comboitems.children().eq(index).hasClass("xg-combo-item-disabled")){
      return true;
    }else{
      return false;
    }

  }

  function _checkSource(){
    if(xgComboProp.source == null || xgComboProp.source.length == 0){
      return false;
    }

    return true;
  }

  function _setIndex(index){
    xgComboProp.index = index;
  }

  function _setIndexes(index,check){
      var indexes = xgComboProp.indexes;
    if(check){
      indexes.push(index);
      indexes.sort();
    }else{
      for(var i = 0,len=indexes.length; i<len; i++){
        if(indexes[i] == index) indexes.splice(i,1);
      }
    }
  }

  function _getEleByIndex(index){
    var items = xgComboProp.comboitems;
    return items.children().eq(index);
  }

  //selected된 엘리먼트에 클래스를 추가
  function _addClassToSelectedItem(Ele){
    if (xgComboProp.nowSelectedTarget != null) {
      xgComboProp.nowSelectedTarget.removeClass("xg-combo-item-selected");
    }
    xgComboProp.nowSelectedTarget = Ele.addClass("xg-combo-item-selected");
  }

  //event : innerOptions의 events의 배열 index가
  //args : 이벤트 객체에 추가할 Object
  function _triggerEvent(event,args){
    if(!xgComboProp.triggerEvent)
      return;

    var event = $.Event(innerOptions.events[event]);
    event.args = args;

    xgComboProp.host.trigger(event);
  }

  //items안에 추가할 item의 html 생성하면서 내부 길이도 계산
  function _getItemHtmls (source) {
    var result = "",
        span = $("<span style='display : none'></span>").appendTo("body");
    //body에 추가된 span에 text를 넣고 직접 width를 구한다
    if (xgComboProp.multipleItem) {
      result = _getMultiHtmlText(source);
    } else {
      result = _getHtmlText(source);
    }

    span.remove();

    /*item 하나에 하나의 텍스트 이상을 사용할 경우*/
    function _getMultiHtmlText(source){
      var result = "";
      if(source.constructor == Object){
        source = [source];
      }

      for (var i = 0, len = source.length; i < len; i++) {
        var nowSource = source[i];
        var input = !xgComboProp.checkBoxes ? '' : '<input type="checkbox">';
        var text = xgComboProp.getMultilItemHtml(nowSource);

        result += '<li class="xg-combo-item" style="width : ' + _getWidth(text) + 'px;">' + input + text + '</li>';
      }
      return result;
    }

    function _getHtmlText(source){
      var result = "";
      if (source.constructor == Object) {
        source = [source];
      }

      var inputText = !xgComboProp.checkBoxes ? '' : '<input type="checkbox">'; //체크박스가 true일 경우와 false일 경우 처리
      for (var i = 0, len = source.length; i < len; i++) {
        var nowSource = source[i];
        var itemHtml = xgComboProp.getNomalItemHtml(nowSource);
        result += '<li class="xg-combo-item" style="width : '  +
                  _getWidth(itemHtml) + 'px;">' +
                  inputText +
                  itemHtml + '</li>';
      }
      return result;
    }

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

  function _setProp(options){
    var keys = Object.keys(options);
    for (var i = 0, len = keys.length; i < len; i++) {
      var key = keys[i];
      xgComboProp[key] = options[key];
    }
  }

  //내부에서 사용하는 함수 종료
  _addEvent();

  element[0].xgComboProp = xgComboProp;

  return xgComboProp;
}
