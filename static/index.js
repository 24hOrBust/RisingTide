
Vue.component('emissions-slider', {
  props: ['name', 'value', 'scale'],
  data: function () {
    return {
      'slider_value': this.value
    }
  },
  methods: {
    update() {
      let result = this.scale * (this.slider_value / 100)
      this.$emit('input', result);
    }
  },
  template: `
  <v-container fluid grid-list-lg style="padding: 0px !important">
    <v-layout row wrap>
      <v-flex xs12>
        <v-slider ref="slider" v-bind:label="name" v-model="slider_value" @input="update" min="0" max="200"></v-slider>
        <div class="slider-value">{{slider_value}}%</div>
      </v-flex>
    </v-layout>
  </v-container>`,
})

var app = new Vue({
  el: '#app',
  data: {
    sliders: [],
    simulated: false
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
          slider['value'] = 100;
          self.sliders.push(slider)
        }
      })
  },
  methods: {
    simulate() {
      this.simulated = true;
      console.log("SIMULATE")
    }
  }
});