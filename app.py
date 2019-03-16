from flask import Flask, request, send_file, jsonify

app = Flask(__name__)

@app.route('/')
def index():
  return send_file('static/index.html')

@app.route('/api/simulation', methods=['POST'])
def simulate():
  return jsonify({'hello':'world'})

if __name__ == '__main__':
  app.run()