
const START_YEAR = 1765;

Vue.component('emissions-slider', {
  props: ['name', 'value', 'scale', 'first'],
  data: function () {
    return {
      'slider_value': 100
    }
  },
  methods: {
    update() {
      this.$emit('input', this.result);
    }
  },
  computed: {
    result() {
      return (this.scale * (this.slider_value / 100)).toFixed(2);
    }
  },
  template: `
        <div>
          <h3 v-bind:class={sliderheader:!first}>{{name}}</h3>
          <v-slider ref="slider" v-model="slider_value" @input="update" min="0" max="200"></v-slider>
          <div class="slider-value">{{result}} GT CO<sub>2</sub> | {{slider_value}}%</div> 
        </div>`,
})

var options = {
  title: {
    text: 'Global Average Temperature',
    color: "#fffff",
  },
  trackByArea: true,
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
      color: '#FF0000'
    }],
    min: -2,
    max: 5
  },
  tooltip: {
    valueSuffix: '°C'
  },
  chart: {
    height: window.innerHeight / 1.8,
    events: {
      click: function (e) {
        var chart = this;


        var x = e.xAxis[0].value;
        var y = e.yAxis[0].value;
        if (chart.xAxis[0].plotLinesAndBands.length > 0) {
          chart.xAxis[0].update({
            plotLines: [{
              id: 'xPlotLine',
              label: {
                text: 'Selected Year',
                style: {
                  color: 'white',
                  fontWeight: 'bold'
                },
              },
              value: x,
              width: 1,
              color: '#C0C0C0'
            }]
          });

        } else {
          chart.xAxis[0].addPlotLine({
            id: 'xPlotLine',
            label: {
              text: 'Select Year',
              style: {
                color: 'white',
              },
            },
            value: x,
            width: 1,
            color: '#C0C0C0'
          });

          chart.yAxis[0].addPlotLine({
            id: 'yPlotLine',
            value: y,
            width: 1,
            color: '#C0C0C0'
          });
        }

        console.log("x" + x);
        console.log("start " + (x - START_YEAR))
        let yearIndex = Math.floor(x - START_YEAR);
        if (yearIndex > 2099 - START_YEAR) {
          yearIndex = 2099 - START_YEAR;
        }
        sea_level = app.seaLevels[yearIndex];
        render();
        setTimeout(function () {
          render();
        }, 500);

      }

    },
  },
  series: [{
    name: 'Global Mean Temperature',
    data: [],
    pointStart: START_YEAR,
    point: {

    }
  }]
}

var app = new Vue({
  el: '#app',
  data: {
    sliders: [],
    simulated: true,
    chartOptions: options,
    selectedSeaLevel: 0,
    seaLevels: []
  },
  // mounted() {
  //   console.log(this.$refs.chart);
  //   this.$refs.chart.chart.renterTo.style.height = "2%";

  // },
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
      var totalCarbon = this.sliders.map(s => Number(s.value)).reduce((a, b) => a + b);
      fetch('/api/simulation?fossil_gtc_carbon=' + totalCarbon).then(function (resp) {
        return resp.json();
      }).then(function (body) {
        console.log(body);
        self.chartOptions.series[0].data = body.global_temps;
        self.seaLevels = body.sea_levels;
        //self.chartOptions.series[0].pointStart = body.start_year;
        self.simulated = true;

        self.chartOptions.xAxis.plotLines = [{
          id: 'xPlotLine',
          value: 2075,
          width: 1,
          color: '#C0C0C0',
          label: {
            text: 'Select Year',
            style: {
              color: 'white',
              fontWeight: 'bold'
            },
          }
        }]

        sea_level = app.seaLevels[2075 - START_YEAR];
        render();
        setTimeout(function () {
          render();
        }, 500);
      })
    }
  },
  computed: {
    mapUrl() {
      return `https://labs.mapbox.com/bites/00307/?elev=${this.selectedSeaLevel}#10/40.8102/-73.8089`
    }
  }
});


//Returns a JSON object holding semi-arbitrary bounds given a latitude, longitude, and zoom
//The object holds information of where in the API some topographical data is
//Torn from a MapBox example after hours of hunting
var latLng2tile = function (lat, lon, zoom) {
  //Each given zoom of the data has 2^zoom tiles in each dimension
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

//TODO: Delete from prod
mapboxgl.accessToken = 'pk.eyJ1IjoiY29oZW5zMTIzIiwiYSI6ImNqdGJ6cTRidDByOHk0NnN6Mmg2ZmUyOTMifQ.ik4nlHsUtlGK1bhDy0-1yw';

//Initial map styling, including only the satellite imagery
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
    }
  ]
};

//Create the map, and you can't scroll off the sides (it causes visual glitches)
//Centered on NYC
var map = new mapboxgl.Map({
  container: 'map',
  zoom: 8,
  maxBounds: new mapboxgl.LngLatBounds(
    new mapboxgl.LngLat(-180, -80),
    new mapboxgl.LngLat(180, 80)),
  center: [-74.0060, 40.7128],
  style: mapStyle
});

//Restricts zoom to only the bottoms
//Integer zoom levels are basically a must to prevent visual issues
map.addControl(new mapboxgl.NavigationControl());
map.scrollZoom.disable();

//Re-render the sea level data whenever we move etc
map.on("resize", function () {
  render();
  //Timeouts exist to deal with inconsistencies in the MapBox engine hooks
  setTimeout(function () {
    render();
  }, 500);
});
map.on("moveend", function () {
  render();
  setTimeout(function () {
    render();
  }, 500);
});
map.on("zoomend", function () {
  render();
  setTimeout(function () {
    render();
  }, 500);
});

//Draw the water level for the first time
render();
setTimeout(function () {
  render();
}, 500);

//Renders all the overlays
function render() {
  var avg = (map.getBounds()._ne.lng + map.getBounds()._sw.lng + 1.0) / 2.0;
  //Sample top left, top mid, top right and the 3 bottoms to get topographical tiles
  [map.getBounds()._ne.lat, map.getBounds()._sw.lat].forEach(function (lat, index1) {
    [map.getBounds()._ne.lng, avg, map.getBounds()._sw.lng].forEach(function (lng, index2) {
      //Generate and retrieve topographical location
      var callArgs = latLng2tile(lat, lng, Math.floor(map.getZoom()));
      var tile = 'https://a.tiles.mapbox.com/v4/mapbox.terrain-rgb/' + callArgs.tileCall + '@2x.pngraw?access_token=' + mapboxgl.accessToken;
      var canvas = document.createElement("canvas");
      // Images are a fixed
      canvas.width = 512;
      canvas.height = 512;
      var context = canvas.getContext("2d");
      var img = new Image(512, 512);
      //Prevents XSS preventions from crashing everything
      img.crossOrigin = "Anonymous";
      img.onload = function () {
        context.drawImage(img, 0, 0);
        //When the image is loaded, process the RGB into heights and generate the overlay
        processTopography(canvas, context, callArgs, index1 * 3 + index2 + 1);
      };
      img.src = tile;
    });
  });
}

//Global variable of change in sea level in meters
var sea_level = 0;
function processTopography(canvas, context, callArgs, acc) {
  var imgData = context.getImageData(0, 0, 512, 512);

  //Iterate over all of the pixels, putting a slight blue tinge over pixels determined to be below sea level
  for (var i = 0; i < imgData.data.length; i += 4) {
    height = -10000 + ((imgData.data[i] * 256 * 256 + imgData.data[i + 1] * 256 + imgData.data[i + 2]) * 0.1);
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

  //As tilebelt library for where the tile we just generated should go on the map
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
  //Add the source if we don't have it (first time run only, mostly)
  if (map.getSource("overlay" + acc) == undefined) {
    map.addSource("overlay" + acc, new_overlay);
  } else {
    //Layers are dependent on there sources, so remove it first
    //Only one layer per source
    if (map.getLayer("overlay" + acc) !== undefined) {
      map.removeLayer("overlay" + acc);
    }
    map.removeSource("overlay" + acc);
    //Put new source in
    map.addSource("overlay" + acc, new_overlay);
  }
  layer =
    {
      "id": "overlay" + acc,
      "source": "overlay" + acc,
      "type": "raster",
      "paint": { "raster-opacity": 0.85 }
    };
  my_overlay = map.getStyle().sources[layer.id];
  //This situation can be caused by async issues, but should no longer be possible
  if (acc > 6) {
    console.log("Got acc of " + acc);
    return;
  }
  var add_layer = true;
  //Loop over all the other layers to verify we aren't doubling up
  for (var l of map.getStyle().layers) {
    if (map.getSource(l.id) == undefined) {
      continue;
    }
    over = map.getStyle().sources[l.id]
    var match = true;
    //We use coordinate locations to verify that two overlays have the same topographical data
    for (var i in over.coordinates) {
      for (var j in [0, 1]) {
        match &= (over.coordinates[i][j] == my_overlay.coordinates[i][j])
      }
    }
    if (match == true) {
      add_layer = false;
    }
  }
  //Add the layer back in when it's done
  if (add_layer == true) {
    map.addLayer(layer);
  }
};