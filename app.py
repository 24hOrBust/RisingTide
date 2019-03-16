from flask import Flask, request, send_file, jsonify
from seamodel import sealevel

app = Flask(__name__)

@app.route('/')
def index():
  return send_file('static/index.html')

@app.route('/api/simulate', methods=['GET'])
def test_carbon():
   fossil_gtc_carbon = request.args.get('fossil_gtc_carbon')
   data = scenarios['RCP26']['WORLD']
   copy_row = data.loc[[2007]]

   for index, row in data.iterrows():
      if index > 2007:
         data = data.drop(index)

   for i in range(2008, 2101):
      temp = copy.deepcopy(copy_row)
      for index, row in temp.iterrows():
         data.loc[i] = row.tolist()
         break
   
   for i in range(2019, 2101):
      data.at[i, "FossilCO2"] = float(fossil_gtc_carbon)
   
   results = pymagicc.run(data)
   results_df = results['SURFACE_TEMP']['GLOBAL']
   ret_json = {}
   ret_json['start_year'] = str(data.index[0])
   ret_json['temperatures'] = list(results_df.values)
   return jsonify(ret_json)

if __name__ == '__main__':
  app.run()