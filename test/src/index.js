import "./scss/index.scss";
import En from "./images/EN.png";
require('./utils/jquery')
// import html from './index.tpl'
function refreshFn(callback) {
  var startY, endY;
  var refreshText = document.getElementById("refreshText");
  var wrap = document.querySelector('.wrapper')
  // 监听触摸事件
  wrap.addEventListener("touchstart", handleTouchStart, false);
  wrap.addEventListener("touchmove", handleTouchMove, false);
  wrap.addEventListener("touchend", handleTouchEnd, false);
  let request = false;
  function handleTouchStart(event) {
    request = false;
    startY = event.touches[0].clientY;
  }
  function handleTouchMove(event) {
    endY = event.touches[0].clientY;
    var distance = endY - startY;
    // 如果下拉距离超过100px，则执行刷新操作
    if (distance > 100) {
      if (request) return false;
      request = true;
      refreshText.style="display: block";
      refreshText.innerText = "正在刷新...";
      // 执行刷新逻辑，例如重新加载数据
      callback && callback()
    }
  }
  function handleTouchEnd() {
    // 清空下拉刷新提示
    request = false;
    refreshText.style="display: none";
    // refreshText.innerText = "下拉刷新";
  }
}
refreshFn(() => {
  console.log(process.env.NODE_ENV, 'production')
  $.ajax({
    method: 'GET',
    url: '/api/v1/blogs',
    success: function (res) {
      console.log(res)
    },
  })

})

