require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/GraphicsLayer",
  "esri/geometry/Mesh",
  "esri/geometry/Point",
  "esri/Graphic",
  "esri/widgets/Slice",
  "esri/analysis/SlicePlane",
  "esri/widgets/LayerList",
  "esri/core/Collection",
  "esri/core/reactiveUtils",
], function (
  Map,
  SceneView,
  GraphicsLayer,
  Mesh,
  Point,
  Graphic,
  Slice,
  SlicePlane,
  LayerList,
  Collection,
  reactiveUtils
) {
  const sketchLayer = new GraphicsLayer({
    elevationInfo: {
      mode: "absolute-height",
    },
    title: "Sketched geometries",
  });
  const map = new Map({
    basemap: "streets-navigation-vector",
    ground: "world-elevation",
  });

  //camera (độ zoom, tọa độ, góc nhìn) cho view 3D
  let cameraPosition = {
    position: [106.8008663430442, 10.863971396764873, 300],
    heading: 0,
    tilt: 50,
  };

  // hiển thị view 3D
  const sceneView = new SceneView({
    container: null,
    map: map,
    viewingMode: "global",
    camera: cameraPosition,
    qualityProfile: "high",
  });

  // 2D
  const view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: cameraPosition,
  });

  const plane = new SlicePlane({
    position: {
      latitude: 10.867532728640802,
      longitude: 106.80084488537197,
      z: 50,
    },
    tilt: 32.62,
    width: 100,
    height: 100,
    heading: 0.46,
  });
  let sliceWidget = null;
  let doorsLayer = null;
  let sliceTiltEnabled = true;
  const excludedLayers = [];

  sketchLayer.when(() => {
    // Iterate through the flat array of sublayers and extract the ones
    // that should be excluded from the slice widget

    setSliceWidget();
  });

  function setSliceWidget() {
    sliceWidget = new Slice({
      view: view,
      container: "sliceContainer",
    });
    sliceWidget.viewModel.excludedLayers.addMany(excludedLayers);
    sliceTiltEnabled = true;
    sliceWidget.viewModel.tiltEnabled = sliceTiltEnabled;
    sliceWidget.viewModel.shape = plane;
    reactiveUtils.watch(
      () => sliceWidget.viewModel.state,
      (state) => {}
    );
  }

  // const house = new Point({
  //   x: 106.80084488537197,
  //   y: 10.867532728640802,
  //   z: 20.2,
  // });

  // Mesh.createFromGLTF(house, "./GIS-LAB2 Rooms/A2-1.glb")
  //   .then(function (geometry) {
  //     geometry.scale(50, { origin: house });
  //     geometry.rotate(0, 0, 300);
  //     const graphic = new Graphic({
  //       geometry,
  //       symbol: {
  //         type: "mesh-3d",
  //         symbolLayers: [
  //           {
  //             type: "fill",
  //             size: 10000,
  //           },
  //         ],
  //       },
  //     });
  //     sketchLayer.add(graphic);
  //   })
  //   .catch(console.error);

  fetch("./rooms_final.json")
  .then(res => res.json())
  .then(async (rooms) => {

    for (const room of rooms) {

      const pos = new Point({
        x: room.arcgis.lon,    
        y: room.arcgis.lat,      
        z: room.arcgis.z
      });

      try {
        const mesh = await Mesh.createFromGLTF(
          pos,
          "./model/" + room.model
        );

        const graphic = new Graphic({
          geometry: mesh,
          symbol: {
            type: "mesh-3d",
            symbolLayers: [{ type: "fill" }]
          },
          attributes: {
            name: room.name,
            model: room.model,
          },
          popupTemplate: {
            title: "{name}",
            content: "Model: {model}"
          }
        });

        sketchLayer.add(graphic);
      }
      catch (err) {
        console.error("Error loading", room.model, err);
      }
    }
  });


  map.add(sketchLayer);

  // xử lý event khi chuyển đổi 2D <-> 3D
  document.getElementById("toggleBtn").addEventListener("click", function () {
    if (view.container) {
      // đổi sang 3D
      view.container = null; // xóa view
      sceneView.container = "viewDiv"; // gán view mới
      sceneView.goTo(cameraPosition, { animate: false });
      this.innerText = "Đổi sang 2D";
    } else {
      //đổi sang 2D
      cameraPosition = sceneView.camera.clone();
      sceneView.container = null;
      view.container = "viewDiv";
      this.innerText = "Đổi sang 3D";
    }
  });

  // đổi basemap
  window.changeBasemap = function (basemap) {
    map.basemap = basemap;
  };
});
