/** 封装地图相关hook */
export function useMap() {
  const map = ref(null)
  const mapView = reactive({
    center: fromLonLat([116.397128, 39.916527]), // 北京
    zoom: 4,
    minZoom: 4,
    maxZoom: 18
  })
  const mapUrl = ref(
    'http://t0.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=97546c3d85ab8620c9459aac2906743b'
  )

  const initMap = (target) => {
    const tileLayer = new TileLayer({
      opacity: 0.8, // 透明度
      source: new XYZ({
        url: mapUrl.value
      })
    })
    map.value = new Map({
      layers: [tileLayer],
      view: new View(mapView),
      target
    })
  }
  const removeMap = () => {
    if (map.value) {
      map.value.dispose()
      map.value = null
      features.value = []
    }
  }
  const circleLayer = ref()
  const noflyData = ref<NoFlyItem[]>([])
  const features = ref([])
  const addCircle = (circleData) => {
    circleData.forEach((item, index) => {
      const feature = new Feature({
        title: item.areaName || '禁飞区',
        geometry: new Circle(
          fromLonLat([item.centerLng, item.centerLat]),
          +item.radius
        )
      })
      feature.setStyle(
        new Style({
          fill: new Fill({
            color: 'rgba(126, 3, 26,0.3)'
          }),
          stroke: new Stroke({
            color: '#b1231b',
            width: 2
          })
        })
      )

      const labelStyle = new Style({
        text: new Text({
          text: String(index + 1),
          font: '12px',
          fill: new Fill({ color: '#fff' })
        }),
        image: new CircleStyle({
          radius: 10,
          fill: new Fill({ color: '#b1231b' }),
          stroke: new Stroke({ color: '#b1231b', width: 2 })
        })
      })
      const centerFeature = new Feature({
        geometry: new Point(fromLonLat([item.centerLng, item.centerLat]))
      })
      centerFeature.setStyle(labelStyle)
      features.value.push(feature, centerFeature)
    })

    const source = new VectorSource()
    source.addFeatures(features.value)
    circleLayer.value = new VectorLayer({
      opacity: 0.5
    })
    circleLayer.value.setSource(source)
    map.value.addLayer(circleLayer.value)
  }
  const addPolygon = (polygonData) => {
    polygonData.forEach((item) => {
      const coordinates = item.boundary.map(point => fromLonLat([point.lng, point.lat]))

      const polygonFeature = new Feature({
        geometry: new Polygon([coordinates])
      })

      polygonFeature.setStyle(
        new Style({
          stroke: new Stroke({
            width: 2,
            color: '#b1231b'
          }),
          fill: new Fill({
            color: 'rgba(126, 3, 26,0.3)'
          }),
          text: new Text({
            text: item.areaName,
            font: '14px',
            fill: new Fill({ color: '#fff' })
          })
        })
      )

      features.value.push(polygonFeature)
    })

    const source = new VectorSource()
    source.addFeatures(features.value)

    const polygonLayer = new VectorLayer({
      opacity: 0.5,
      zIndex: 999
    })
    polygonLayer.setSource(source)

    map.value.addLayer(polygonLayer)
  }
  const addLine = (lineData, lineLable?: { start: string, end: string }) => {
    const coordinates = lineData.map(point => fromLonLat([point[0], point[1]]))

    const lineFeature = new Feature({
      geometry: new LineString(coordinates)
    })

    lineFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: '#4474e1',
          width: 2
        })
      })
    )

    // 添加起点和终点的标识，后面处理封装优化一下
    const startLabel = new Feature({
      geometry: new Point(coordinates[0])
    })
    startLabel.setStyle(
      new Style({
        text: new Text({
          text: lineLable?.start,
          font: '12px sans-serif',
          fill: new Fill({ color: '#7c7c7c' }),
          backgroundFill: new Fill({ color: '#fff' }),
          padding: [3, 3, 3, 3]
        })
      })
    )

    const endLabel = new Feature({
      geometry: new Point(coordinates[coordinates.length - 1])
    })
    endLabel.setStyle(
      new Style({
        text: new Text({
          text: lineLable?.end,
          font: '12px sans-serif',
          fill: new Fill({ color: '#7c7c7c' }),
          backgroundFill: new Fill({ color: '#fff' }),
          padding: [3, 3, 3, 3]
        })
      })
    )

    features.value.push(lineFeature, startLabel, endLabel)

    const source = new VectorSource()
    source.addFeatures(features.value)

    const lineLayer = new VectorLayer({
      opacity: 0.5,
      zIndex: 999
    })
    lineLayer.setSource(source)

    map.value.addLayer(lineLayer)
  }
  /** 添加气象信息图片 */
const imageLayer = ref(null)
const addImg = (data) => {
  data.forEach((item) => {
    const extent = boundingExtent([
      // [item.minLng, item.maxLat], // 左上
      [item.minLng, item.minLat], // 左下
      // [item.maxLng, item.minLat], // 右下
      [item.maxLng, item.maxLat] // 右上
    ])
    const projection = new Projection({
      code: 'EPSG:4326',
      extent
    })
    const image = new ImageStatic({
      url: 'data:image/png;base64,' + item.imageCode,
      projection,
      imageExtent: extent
    })
    imageLayer.value = new ImageLayer({
      source: image,
      minResolution: 0,
      maxResolution: Infinity
    })
    map.value.addLayer(imageLayer.value)
  })
}
  const resetMapCenter = (lng: number, lat: number) => {
    mapView.center = fromLonLat([
      lng,
      lat
    ])
  }

  return {
    map,
    mapView,
    mapUrl,
    initMap,
    removeMap,
    circleLayer,
    noflyData,
    features,
    addCircle,
    addPolygon,
    addLine,
    resetMapCenter
  }
}