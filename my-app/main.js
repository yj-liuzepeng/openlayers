// 导入所需的模块
import GeoJSON from 'ol/format/GeoJSON.js';
import Map from 'ol/Map.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';

// 创建一个矢量图层并指定数据源为远程的 GeoJSON 文件
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/ecoregions.json', // GeoJSON 数据的 URL
    format: new GeoJSON(), // 使用 GeoJSON 格式解析数据
  }),
  background: 'white', // 背景颜色
  style: {
    'fill-color': ['string', ['get', 'COLOR'], '#eeeeee'], // 定义填充颜色样式
  },
});

// 创建地图实例
const map = new Map({
  layers: [vector], // 将矢量图层添加到地图中
  target: 'map', // 地图渲染的目标元素
  view: new View({
    center: [0, 0], // 地图中心点
    zoom: 2, // 初始缩放级别
  }),
});

// 获取信息框的 DOM 元素
const info = document.getElementById('info');

let currentFeature; // 当前选中的要素

// 显示要素信息的函数
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  
  if (feature) {
    info.style.left = pixel[0] + 'px'; // 设置信息框位置
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible'; // 显示信息框
      info.innerText = feature.get('ECO_NAME'); // 设置信息框内容为要素的 ECO_NAME 属性值
    }
  } else {
    info.style.visibility = 'hidden'; // 隐藏信息框
  }
  currentFeature = feature; // 更新当前要素
};

// 监听鼠标移动事件，在移动时显示要素信息
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden'; // 隐藏信息框
    currentFeature = undefined; // 重置当前要素
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel, evt.originalEvent.target);
});

// 监听点击事件，点击时显示要素信息
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// 监听鼠标离开地图区域事件，隐藏信息框
map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined; // 重置当前要素
  info.style.visibility = 'hidden'; // 隐藏信息框
});
