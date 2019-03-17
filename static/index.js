
const START_YEAR = 1765;

Vue.component('emissions-slider', {
  props: ['name', 'value', 'scale'],
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
          <p>
            <h3>{{name}}</h3>
            <div class="slidercontainer">
            <v-slider ref="slider" v-model="slider_value" @input="update" min="0" max="200"></v-slider> 
            </div>
          </p>
          <div class="slider-value">{{result}} GT CO<sub>2</sub> | {{slider_value}}%</div>
        </div>`,
})

var options = {
  title: {
    text: 'Global Average Temperature',
    color: "#fffff",
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
      color: '#FF0000'
    }],
    min: -2,
    max: 5
  },
  tooltip: {
    valueSuffix: '°C'
  },
  series: [{
    name: 'Global Mean Temperature',
    data: [],
    pointStart: START_YEAR,
    point: {
      events: {
        mouseOver: function() {
          let yearIndex = this.x - START_YEAR;
          console.log(app.seaLevels[yearIndex]);
          app.selectedSeaLevel = app.seaLevels[yearIndex];
        }
      }
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
      var totalCarbon = this.sliders.map(s => Number(s.value)).reduce((a,b)=>a+b);
      fetch('/api/simulation?fossil_gtc_carbon=' + totalCarbon).then(function(resp){
        return resp.json();
      }).then(function(body) {
        console.log(body);
        self.chartOptions.series[0].data = body.global_temps;
        self.seaLevels = body.sea_levels;
        //self.chartOptions.series[0].pointStart = body.start_year;
        self.simulated = true;
        
      })
    }
  },
  computed: {
    mapUrl() {
      return `https://labs.mapbox.com/bites/00307/?elev=${this.selectedSeaLevel}#10/40.8102/-73.8089`
    }
  }
});