from flask import Flask, request, send_file, jsonify
from seamodel import sealevel
import pymagicc
from pymagicc import scenarios
import copy
from seamodel import get_sea_level
from climate_model import climate_model

app = Flask(__name__)

@app.route('/')
def index():
  return send_file('static/index.html')

@app.route('/api/simulation', methods=['GET'])
def simulate():
   fossil_gtc_carbon = request.args.get('fossil_gtc_carbon')
   ret_json = climate_model(fossil_gtc_carbon)
   sea_levels = get_sea_level(ret_json['NH_temps'])
   ret_json['sea_levels'] = sea_levels
   return jsonify(ret_json)

@app.route('/test_carbon', methods=['GET'])
def test_carbon():
   fossil_gtc_carbon = request.args.get('fossil_gtc_carbon')
   ret_json = climate_model(fossil_gtc_carbon)
   return jsonify(ret_json)


if __name__ == '__main__':
  app.run()