import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# Example: Read API key from environment variable (simulate error if not set)
API_KEY = os.environ.get('WEATHER_API_KEY')

@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('city')
    if not API_KEY:
        return jsonify({'error': 'API key not set in environment variables'}), 500
    if not city:
        return jsonify({'error': 'City parameter is required'}), 400
    # Simulate weather data
    data = {
        'city': city,
        'temperature': 25,
        'description': 'Sunny',
        'source': 'MCP Weather Server'
    }
    return jsonify(data)

# Example logging function for MCP debugging
def send_log_message(message):
    print(f"[MCP LOG] {message}")

@app.before_request
def log_request_info():
    send_log_message(f"Incoming request: {request.method} {request.path} - args: {request.args}")

@app.after_request
def log_response_info(response):
    send_log_message(f"Response: {response.status} - {response.get_data(as_text=True)}")
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)
