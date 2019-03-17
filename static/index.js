
Vue.component('emissions-slider', {
  props: ['name', 'value', 'scale'],
  data: function () {
    return {
      'slider_value': 100
    }
  },
  methods: {
    update() {
      let result = this.scale * (this.slider_value / 100)
      this.$emit('input', result);
    }
  },
  template: `
        <div>
          <p>
            <h3>{{name}}</h3>
            <div class="slidercontainer">
              <input class="slider" type="range" ref="slider" v-model="slider_value" @input="update" min="0" max="200"></input>
            </div>
          </p>
          <div class="slider-value">{{slider_value}}%</div>
        </div>`,
})

var options = {
  title: {
    text: 'Global Average Temperature',
    color: "#fffff",
    x: -20 //center
  },
  xAxis: {
    crosshair: true
  },
  yAxis: {
    title: {
      text: 'Temperature (°C)'
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  tooltip: {
    valueSuffix: '°C'
  },
  series: [{
    name: 'Global Mean Temperature',
    data: [],
    pointStart: 1765
  }]
}

var app = new Vue({
  el: '#app',
  data: {
    sliders: [],
    simulated: false,
    chartOptions: options
  },
  beforeMount() {
    let self = this;
    fetch('/static/config.json')
      .then(function (response) {
        return response.json();
      }).then(function (json) {
        let sliders = json.sliders;
        console.log(sliders);
        for (let slider of sliders) {
          slider['value'] = slider.scale;
          self.sliders.push(slider)
        }
      })
  },
  methods: {
    simulate() {
      let self = this;
      self.simulated = false;
      var totalCarbon = this.sliders.map(s => s.value).reduce((a, b) => a + b);
      fetch('/api/simulation?fossil_gtc_carbon=' + totalCarbon).then(function (resp) {
        return resp.json();
      }).then(function (body) {
        console.log(body);
        self.chartOptions.series[0].data = body.temperatures;
        //self.chartOptions.series[0].pointStart = body.start_year;
        self.simulated = true;

      })
    }
  }
});

var latLng2tile = function (lat, lon, zoom) {
  var eLng = (lon + 180) / 360 * Math.pow(2, zoom);
  var eLat = (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom);
  //x coord in image tile of lat/lng
  var xInd = Math.round((eLng - Math.floor(eLng)) * 256);
  //y coord in image tile of lat/lng
  var yInd = Math.round((eLat - Math.floor(eLat)) * 256);
  //flattened index for clamped array in imagedata
  var fInd = yInd * 256 + xInd;
  //for calling tile from array
  var eLng = Math.floor(eLng);
  var eLat = Math.floor(eLat);
  return { "tileCall": "" + zoom + "/" + eLng + "/" + eLat, "tileX": eLng, "tileY": eLat, "pX": xInd, "pY": yInd, "arrInd": fInd }
};

mapboxgl.accessToken = 'pk.eyJ1IjoiY29oZW5zMTIzIiwiYSI6ImNqdGJ6cTRidDByOHk0NnN6Mmg2ZmUyOTMifQ.ik4nlHsUtlGK1bhDy0-1yw';

var mapStyle = {
  "version": 8,
  "name": "Water Level",
  "sources": {
    "mapbox": {
      "type": "raster",
      "url": "mapbox://mapbox.satellite"
    }
  },
  "layers": [
    {
      "id": "map",
      "type": "raster",
      "source": "mapbox",
      "source-layer": "mapbox_satellite_full",
    }]
};

var map = new mapboxgl.Map({
  container: 'map',
  zoom: 4,
  center: [-73.240966, 40.798059],
  style: mapStyle
});
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

var sea_level = 0;
var acc = 0;
pairs = [];
//var mutex = 0;
[map.getBounds()._ne.lat, map.getBounds()._sw.lat].forEach(function (lat, index1) {
  [map.getBounds()._ne.lng, map.getBounds()._sw.lng].forEach(function (lng, index2) {
    pairs[acc] = [lat, lng];
    acc++;
  });
});



var canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
var context = canvas.getContext("2d");


var img = new Image(256, 256);
img.onload = function () {
  processTopography(context, 1);


  var img2 = new Image(256, 256);
  img2.onload = function () {
    processTopography(context, 2);


    var img3 = new Image(256, 256);
    img3.onload = function () {
      processTopography(context, 3);


      var img4 = new Image(256, 256);
      img4.onload = function () {
        processTopography(context, 4);
      }
      var callArgs4 = latLng2tile(pairs[3][0], pairs[3][1], Math.floor(map.getZoom()));
      var tile4 = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + callArgs4.tileCall + '.pngraw?access_token=' + mapboxgl.accessToken;
      console.log(tile4);
      img2.src = tile4;



    }
    var callArgs3 = latLng2tile(pairs[2][0], pairs[2][1], Math.floor(map.getZoom()));
    var tile3 = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + callArgs3.tileCall + '.pngraw?access_token=' + mapboxgl.accessToken;
    console.log(tile3);
    img2.src = tile3;



  }
  var callArgs2 = latLng2tile(pairs[1][0], pairs[1][1], Math.floor(map.getZoom()));
  var tile2 = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + callArgs2.tileCall + '.pngraw?access_token=' + mapboxgl.accessToken;
  console.log(tile2);
  img2.src = tile2;



}
var callArgs = latLng2tile(pairs[0][0], pairs[0][1], Math.floor(map.getZoom()));
var tile = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + callArgs.tileCall + '.pngraw?access_token=' + mapboxgl.accessToken;
console.log(tile);
img.src = tile;


function processTopography(context, acc) {
  var imgData = context.getImageData(0, 0, 256, 256);

  for (var i = 0; i < imgData.data.length; i += 4) {
    height = -10000 + ((imgData.data[i] * 256 * 256 + imgData.data[i + 1] * 256 + imgData.data[i + 2]) * 0.1);
    if (i % 16384 == 0) {
      console.log(height);
    }
    if (height > sea_level) {
      imgData.data[i + 3] = 0;
    } else {
      imgData.data[i + 3] = 100;
    }
    imgData.data[i] = 10;
    imgData.data[i + 1] = 20;
    imgData.data[i + 2] = 200;
  }

  context.putImageData(imgData, 0, 0);
  context.save();

  console.log(canvas.toDataURL("image/png"));

  var image_BBOX = tileToBBOX([callArgs.tileX, callArgs.tileY, Math.floor(map.getZoom())]);
  new_overlay = {
    "type": "image",
    "url": canvas.toDataURL("image/png"),
    "coordinates": [
      [image_BBOX[0], image_BBOX[3]],
      [image_BBOX[2], image_BBOX[3]],
      [image_BBOX[2], image_BBOX[1]],
      [image_BBOX[0], image_BBOX[1]],
    ]
  };
  var layer = {
    "id": "overlay" + acc,
    "source": "overlay" + acc,
    "type": "raster",
    "paint": { "raster-opacity": 0.85 }
  };
  if (acc == 1) {
    mapStyle.sources.overlay1 = new_overlay;
  } else if (acc == 2) {
    mapStyle.sources.overlay2 = new_overlay;
  } else if (acc == 3) {
    mapStyle.sources.overlay3 = new_overlay;
  } else if (acc == 4) {
    mapStyle.sources.overlay4 = new_overlay;
  }
  mapStyle.layers[acc] = layer;
}