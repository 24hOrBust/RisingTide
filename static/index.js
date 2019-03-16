
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
      var totalCarbon = this.sliders.map(s => s.value).reduce((a,b)=>a+b);
      fetch('/api/simulate?fossil_gtc_carbon=' + totalCarbon).then(function(resp){
        return resp.json();
      }).then(function(body) {
        console.log(body);
        self.chartOptions.series[0].data = body.temperatures;
        //self.chartOptions.series[0].pointStart = body.start_year;
        self.simulated = true;
        
      })
    }
  }
});