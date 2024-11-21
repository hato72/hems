from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store appliance data
appliances = {
    '1': {'id': '1', 'name': 'Living Room AC', 'location': 'Living Room', 'power': 0, 'isOn': True, 'cost': 0},
    '2': {'id': '2', 'name': 'Kids Room AC', 'location': 'Kids Room', 'power': 0, 'isOn': True, 'cost': 0},
    '3': {'id': '3', 'name': 'Microwave', 'location': 'Kitchen', 'power': 0, 'isOn': False, 'cost': 0},
    '4': {'id': '4', 'name': 'IH Cooktop', 'location': 'Kitchen', 'power': 0, 'isOn': False, 'cost': 0},
}

POWER_INCREASE_RATE = 0.1  # kWh per interval
COST_PER_KWH = 25  # ¥/kWh
POWER_THRESHOLD = 5  # kWh
UPDATE_INTERVAL = 5  # seconds

def update_power_usage():
    """Update power usage for all active appliances."""
    while True:
        total_power = 0
        for appliance_id, appliance in appliances.items():
            if appliance['isOn']:
                appliance['power'] += POWER_INCREASE_RATE
                appliance['cost'] = appliance['power'] * COST_PER_KWH
                total_power += appliance['power']
        
        # Emit updated data to all connected clients
        socketio.emit('appliance_update', list(appliances.values()))
        
        # Check if total power exceeds threshold
        if total_power > POWER_THRESHOLD:
            socketio.emit('power_alert', {
                'message': f'High power consumption detected! Current usage: {total_power:.2f} kWh'
            })
        
        time.sleep(UPDATE_INTERVAL)

@app.route('/api/appliances')
def get_appliances():
    """Get current state of all appliances."""
    return jsonify(list(appliances.values()))

@socketio.on('toggle_appliance')
def handle_toggle(data):
    """Handle appliance toggle events."""
    appliance_id = data['id']
    if appliance_id in appliances:
        appliances[appliance_id]['isOn'] = not appliances[appliance_id]['isOn']
        socketio.emit('appliance_update', list(appliances.values()))

if __name__ == '__main__':
    # Start the background thread for updating power usage
    update_thread = threading.Thread(target=update_power_usage)
    update_thread.daemon = True
    update_thread.start()
    
    socketio.run(app, debug=True, port=5000)