import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI()

# Example: Read API key from environment variable (simulate error if not set)
API_KEY = os.environ.get('WEATHER_API_KEY')

def send_log_message(message: str):
    print(f"[MCP LOG] {message}")
    # Simpan log ke file mcp_server.log di path yang sama
    log_path = os.path.join(os.path.dirname(__file__), "mcp_server.log")
    with open(log_path, "a") as log_file:
        log_file.write(f"[MCP LOG] {message}\n")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    send_log_message(f"Incoming request: {request.method} {request.url} - query: {dict(request.query_params)}")
    response = await call_next(request)
    send_log_message(f"Response: {response.status_code} - {await response.body() if hasattr(response, 'body') else 'No body'}")
    return response

@app.get("/weather")
async def get_weather(city: str = None):
    if not API_KEY:
        send_log_message("API key not set in environment variables")
        raise HTTPException(status_code=500, detail="API key not set in environment variables")
    if not city:
        send_log_message("City parameter is required")
        raise HTTPException(status_code=400, detail="City parameter is required")
    # Simulate weather data
    data = {
        'city': city,
        'temperature': 25,
        'description': 'Sunny',
        'source': 'MCP Weather Server'
    }
    return JSONResponse(content=data)

if __name__ == "__main__":
    uvicorn.run("server_fastapi:app", host="0.0.0.0", port=5000, reload=True)
