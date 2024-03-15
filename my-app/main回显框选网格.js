import "./style.css";
import { Map, View, Feature } from "ol";
import { Polygon } from "ol/geom";
import { Select, DragBox } from "ol/interaction";
import { never, always } from "ol/events/condition";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { Vector as VectorSource } from "ol/source";
import { Vector as VectorLayer } from "ol/layer";
import { Fill, Style, Text, Stroke } from "ol/style";

/**
 * 根据起始点、终止点和步长生成网格
 * @param {Array<number>} startPosition - 左上角经纬度 [经度, 纬度]
 * @param {Array<number>} endPosition - 右下角经纬度 [经度, 纬度]
 * @param {number} lonStep - 经度步长
 * @param {number} latStep - 纬度步长
 * @returns {Array<Feature>} 生成的网格要素数组
 */
const generateGrid = (startPosition, endPosition, lonStep, latStep) => {
  const features = [];
  let idCounter = 1; // 用于给每个长方形赋予一个简单的数字ID，从1开始

  for (let lon = startPosition[0]; lon < endPosition[0]; lon += lonStep) {
    for (let lat = startPosition[1]; lat > endPosition[1]; lat -= latStep) {
      const squareCoords = [
        [
          [lon, lat],
          [lon + lonStep, lat],
          [lon + lonStep, lat - latStep],
          [lon, lat - latStep],
          [lon, lat], // 闭合长方形
        ],
      ];

      const feature = new Feature({
        geometry: new Polygon(squareCoords),
        name: idCounter.toString(), // 将ID转换为字符串作为name
      });

      features.push(feature);
      idCounter++; // 更新ID计数器
    }
  }

  return features;
};

// 使用 generateGrid 函数生成网格并创建 VectorLayer
const vectorSource = new VectorSource({
  features: generateGrid([119.0, 29.2], [119.8, 28.2], 0.4, 0.2),
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    // 同原始代码中的样式设置
    return new Style({
      stroke: new Stroke({
        width: 4,
        color: "red",
      }),
      fill: new Fill({
        color: "yellow",
      }),
      text: new Text({
        font: "10px Microsoft YaHei",
        text: feature.get("name"),
        overflow: true,
        textAlign: "center",
        textBaseline: "middle",
        fill: new Fill({
          color: "#0e84ba",
        }),
        offsetX: 0,
      }),
    });
  },
});

// 创建地图
const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    projection: "EPSG:4326",
    center: [119.2, 29.2],
    zoom: 10,
  }),
});
map.addLayer(vectorLayer);

// 创建选择工具，用于盛放矩形框内的要素
const select = new Select({
  condition: never,
  style: function (feature) {
    return new Style({
      stroke: new Stroke({
        width: 4,
        color: "red",
      }),
      fill: new Fill({
        color: "green",
      }),
      text: new Text({
        font: "10px Microsoft YaHei",
        text: "选中" + feature.get("name"),
        overflow: true,
        textAlign: "center",
        textBaseline: "middle",
        fill: new Fill({
          color: "#ffffff",
        }),
        offsetX: 0,
      }),
    });
  },
});

// 创建绘制工具
const dragBox = new DragBox({
  condition: always,
});

// 开始绘制，清除已有要素
dragBox.on("boxstart", function () {
  select.getFeatures().clear();
});

// 结束绘制
dragBox.on("boxend", function () {
  // 获取被选择的要素
  const extent = dragBox.getGeometry().getExtent();
  vectorLayer
    .getSource()
    .forEachFeatureIntersectingExtent(extent, function (feature) {
      select.getFeatures().push(feature);
    });

  // 遍历被选中的要素
  const selected = [];
  const selectedFeatures = select.getFeatures();
  for (let i = 0; i < selectedFeatures.getLength(); i++) {
    const feature = selectedFeatures.item(i);
    const name = feature.get("name");
    selected.push(name);
  }
  // 输出查询结果
  const msg = selected.join("、");
  document.getElementById("msg").innerText = "被选中的要素：" + msg;
});

// 根据传入的selected数组，数组每一项是feature网格的name
const showSelectedGrids = (selected) => {
   select.getFeatures().clear();
   // 遍历所有要素，根据name属性进行选择
   vectorLayer.getSource().forEachFeature(function (feature) {
     const name = feature.get("name");
     if (selected.includes(name)) {
        select.getFeatures().push(feature);
     }
   });
     // 输出查询结果
  const msg = selected.join("、");
  document.getElementById("msg").innerText = "被选中的要素：" + msg;
  
}

// 监听地图的点击事件，点击时清除框选
map.on("singleclick", function () {
  select.getFeatures().clear();
  document.getElementById("msg").innerText = "";
});

// 添加交互工具
map.addInteraction(dragBox);
map.addInteraction(select);

setTimeout(() => {
  showSelectedGrids(['1','7','2','8'])
}, 1000);
