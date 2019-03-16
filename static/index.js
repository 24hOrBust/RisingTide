
Vue.component('emissions-slider', {
  props: ['name'],
  data: function () {
    return {
      'value':100
    }
  },
  template: `
  <v-container fluid grid-list-lg>
    <v-layout row wrap>
      <v-flex xs12>
        <v-slider ref="slider" v-bind:label="name" v-model="value"></v-slider>
        <div class="slider-value">{{value}}</div>
      </v-flex>
    </v-layout>
  </v-container>`,
})

var app = new Vue({
  el: '#app',
  data: {
    gtc02: 100
  }
});