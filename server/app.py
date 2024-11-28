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
    df = pd.read_excel('./server/hec_40.xlsx')
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
        'cost': 0
    }

# 各家電の初期コストを設定 (例)
# initial_costs = {
#     'Living Room AC': 100,
#     'Kids Room AC': 80,
#     'Microwave': 20,
#     'IH Cooktop': 50,
# }

# 家電のゼロコスト状態を記録する辞書
zero_cost_tracker = {appliance_id: 0 for appliance_id in appliances}

def update_power_usage():
    """Update power usage for all active appliances."""
    for i in range(40):  # 40秒間データを送信
        updated_appliances = []
        for appliance_id, appliance in appliances.items():
            appliance_name = appliance['name']
            if appliance_name in appliance_data:
                try:
                    power_increment = appliance_data[appliance_name]['消費電力'][i]
                    cost_increment = appliance_data[appliance_name]['料金'][i]

                    # 更新
                    appliance['power'] = power_increment
                    appliance['cost'] = cost_increment

                    # ゼロコスト状態の追跡
                    if cost_increment == 0:
                        zero_cost_tracker[appliance_id] += 1
                        if zero_cost_tracker[appliance_id] >= 30:  # 30秒間ゼロ
                            socketio.emit('zero_cost_alert', {
                                'id': appliance_id,
                                'name': appliance['name'],
                                'message': f"{appliance['name']}の電気料金が30秒間ゼロです！"
                            })
                    else:
                        zero_cost_tracker[appliance_id] = 0  # リセット

                except IndexError:
                    # データが不足している場合
                    appliance['power'] = 0
                    appliance['cost'] = 0

            updated_appliances.append(appliance)

        # クライアントに更新情報を送信
        socketio.emit('appliance_update', updated_appliances)
        time.sleep(1)

    # 40回送信後、消費電力を0にする
    # for appliance in appliances.values():
    #     appliance['power'] = 0
    # socketio.emit('appliance_update', list(appliances.values()))

@app.route('/api/appliances')
def get_appliances():
    """現在の家電データを取得するAPI"""
    return jsonify(list(appliances.values()))

@socketio.on('toggle_appliance')
def handle_toggle(data):
    """クライアントからの家電操作リクエストを処理"""
    appliance_id = data['id']
    if appliance_id in appliances:
        # appliances[appliance_id]['isOn'] = not appliances[appliance_id]['isOn']
        socketio.emit('appliance_update', list(appliances.values()))

if __name__ == '__main__':
    # 消費電力の更新スレッドを開始
    update_thread = threading.Thread(target=update_power_usage)
    update_thread.daemon = True
    update_thread.start()
    
    socketio.run(app, debug=True, port=5000)
    # socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)

