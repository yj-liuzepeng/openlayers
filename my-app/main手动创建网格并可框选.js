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

// 创建要素图层
const vectorLayer = new VectorLayer({
  source: new VectorSource({
    features: [
      new Feature({
        geometry: new Polygon([
          [
            [119.0, 29.0],
            [119.2, 29.0],
            [119.2, 29.2],
            [119.0, 29.2], // 最左上角点
            [119.0, 29.0],
          ],
        ]),
        name: "A",
      }),
      new Feature({
        geometry: new Polygon([
          [
            [119.2, 29.0],
            [119.4, 29.0],
            [119.4, 29.2],
            [119.2, 29.2],
            [119.2, 29.0],
          ],
        ]),
        name: "B",
      }),
      new Feature({
        geometry: new Polygon([
          [
            [119.4, 29.0],
            [119.6, 29.0],
            [119.6, 29.2],
            [119.4, 29.2],
            [119.4, 29.0],
          ],
        ]),
        name: "C",
      }),
      new Feature({
        geometry: new Polygon([
          [
            [119.0, 28.8],
            [119.2, 28.8],
            [119.2, 29.0],
            [119.0, 29.0],
            [119.0, 28.8],
          ],
        ]),
        name: "D",
      }),
      new Feature({
        geometry: new Polygon([
          [
            [119.2, 28.8],
            [119.4, 28.8],
            [119.4, 29.0],
            [119.2, 29.0],
            [119.2, 28.8],
          ],
        ]),
        name: "E",
      }),
      new Feature({
        geometry: new Polygon([
          [
            [119.4, 28.8],
            [119.6, 28.8], // 最右下角点
            [119.6, 29.0],
            [119.4, 29.0],
            [119.4, 28.8],
          ],
        ]),
        name: "F",
      }),
    ],
  }),
  style: function (feature) {
    return new Style({
      stroke: new Stroke({
        width: 4,
        color: "blue",
      }),
      fill: new Fill({
        color: "yellow",
      }),
      text: new Text({
        font: "10px Microsoft YaHei",
        text: feature.get("name"), // 设置显示文本为 feature 的 name 属性
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

// 添加交互工具
map.addInteraction(dragBox);
map.addInteraction(select);
