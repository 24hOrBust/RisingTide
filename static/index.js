
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
                text: 'Select Year',
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
        console.log(app.seaLevels[yearIndex]);
        app.selectedSeaLevel = app.seaLevels[yearIndex];
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

        self.selectedSeaLevel = self.seaLevels[ 2075 - START_YEAR];

      })
    }
  },
  computed: {
    mapUrl() {
      return `https://labs.mapbox.com/bites/00307/?elev=${this.selectedSeaLevel}#10/40.8102/-73.8089`
    }
  }
});