from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import time
import pandas as pd

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store appliance data
# appliances = {
#     '1': {'id': '1', 'name': 'Living Room AC', 'location': 'Living Room', 'power': 0, 'isOn': True, 'cost': 0},
#     '2': {'id': '2', 'name': 'Kids Room AC', 'location': 'Kids Room', 'power': 0, 'isOn': True, 'cost': 0},
#     '3': {'id': '3', 'name': 'Microwave', 'location': 'Kitchen', 'power': 0, 'isOn': False, 'cost': 0},
#     '4': {'id': '4', 'name': 'IH Cooktop', 'location': 'Kitchen', 'power': 0, 'isOn': False, 'cost': 0},
# }

POWER_INCREASE_RATE = 0.1  # kWh per interval
COST_PER_KWH = 25  # ¥/kWh
POWER_THRESHOLD = 5  # kWh
UPDATE_INTERVAL = 5  # seconds

# Excelファイルからデータを読み込む
try:
    df = pd.read_excel('../hec_40.xlsx')
    appliance_data = {}
    
    # time列以外のカラム名を取得
    columns = df.columns.tolist()[1:]
    
    # カラム名から家電名を取得し、対応する電力と料金のデータを格納
    for col in columns:
        appliance_name = col.split('_')[0]  # カラム名から家電名を取得
        data_type = col.split('_')[1]      # 消費電力 or 料金 を取得

        if appliance_name not in appliance_data:
            appliance_data[appliance_name] = {}

        appliance_data[appliance_name][data_type] = df[col].tolist()[1:41] # 1秒後〜40秒後のデータを取得

except FileNotFoundError:
    print("Error: hec_40.xlsx not found.")
    exit(1)
except Exception as e:
    print(f"Error reading Excel file: {e}")
    exit(1)

appliances = {}
for i, appliance_name in enumerate(appliance_data.keys()):
    appliances[str(i + 1)] = {
        'id': str(i + 1),
        'name': appliance_name,
        'location': 'Location Placeholder',  # 適切な場所を設定してください
        'power': 0,
        'isOn': True,  # 初期状態はオン
        'cost': 0
    }

# 各家電の初期コストを設定 (例)
# initial_costs = {
#     'Living Room AC': 100,
#     'Kids Room AC': 80,
#     'Microwave': 20,
#     'IH Cooktop': 50,
# }

def update_power_usage():
    """Update power usage for all active appliances."""
    for i in range(40):  # 40秒間データを送信
        updated_appliances = []
        for appliance_id, appliance in appliances.items():
            appliance_name = appliance['name']
            if appliance_name in appliance_data:
                try:
                    appliance['power'] = appliance_data[appliance_name]['消費電力'][i]
                    appliance['cost'] = appliance_data[appliance_name]['料金'][i] # 料金もExcelから取得
                except IndexError:
                    # データが足りない場合は0を設定
                    appliance['power'] = 0
                    appliance['cost'] = 0
            updated_appliances.append(appliance)

        socketio.emit('appliance_update', updated_appliances)
        time.sleep(1)
    # while True:
    #     total_power = 0
    #     for appliance_id, appliance in appliances.items():
    #         if appliance['isOn']:
    #             appliance['power'] += POWER_INCREASE_RATE
    #             appliance['cost'] = appliance['power'] * COST_PER_KWH
    #             total_power += appliance['power']
        
    #     # Emit updated data to all connected clients
    #     socketio.emit('appliance_update', list(appliances.values()))
        
    #     # Check if total power exceeds threshold
    #     if total_power > POWER_THRESHOLD:
    #         socketio.emit('power_alert', {
    #             'message': f'High power consumption detected! Current usage: {total_power:.2f} kWh'
    #         })
        
    #     time.sleep(UPDATE_INTERVAL)

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