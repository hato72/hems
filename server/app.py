from flask import Flask, jsonify, request
from flask_socketio import SocketIO
from flask_cors import CORS
import threading
import time
import pandas as pd
import os
import json
import requests

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

        appliance_data[appliance_name][data_type] = df[col].tolist()[1:] 

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

# Dify APIの設定
API_KEY = os.getenv("DIFY_API_KEY")  # 環境変数からAPIキーを取得
BASE_URL = "https://api.dify.ai/v1"

def run_workflow(inputs, response_mode, user):
    """Dify APIを呼び出してワークフローを実行する"""
    url = f"{BASE_URL}/workflows/run"  # chat-messages エンドポイントを使用
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "inputs": inputs,
        "response_mode": response_mode,
        "user": user,
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    
    if response.status_code == 200:
        result = response.json()
        # response_mode によって処理を分岐
        if response_mode == "blocking":
            if "data" in result and "outputs" in result["data"]:  # outputsの存在を確認
                if "text" in result["data"]["outputs"]: # "text"キーの存在を確認
                    return result["data"]["outputs"]["text"] # textキーの値を返す
                else:
                    return "APIからの応答に'text'キーが見つかりません。" # textキーがない場合のエラー処理

            else:
                return "APIからの応答が不正です。"  # data または outputs がない場合のエラー処理
        else: # streamingの場合
            return result #ストリーミングの場合はそのまま結果を返す

    else:
        return f"Request failed with status code {response.status_code}, {response.text}"

@app.route('/api/send_data', methods=['POST'])  # 新しいエンドポイントを追加
def send_data():
    try:
        data = request.get_json()
        appliances_data = data.get('appliances')

        if not appliances_data:
            return jsonify({"error": "No appliances data provided"}), 400

        text_description = "Appliance usage data:"
        for appliance in appliances_data:
            text_description += f"\n{appliance['name']}: cost - {appliance['cost']}"

        inputs = {"input": text_description} #入力を変更
        response_mode = "blocking" #blockingモードに変更
        user = "example_user"

        result = run_workflow(inputs, response_mode, user)
        return jsonify({"result": result})
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid JSON data"}), 400
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

def update_power_usage():
    """Update power usage for all active appliances."""
    total_power = {appliance_id: 0 for appliance_id in appliances}
    total_cost = {appliance_id: 0 for appliance_id in appliances}
    # for i in range(40): 
    time_data_length = len(df['time']) -1 # ヘッダー行を除外
    for i in range(time_data_length):
        updated_appliances = []
        for appliance_id, appliance in appliances.items():
            appliance_name = appliance['name']
            if appliance_name in appliance_data:
                try:
                    #power_increment = appliance_data[appliance_name]['消費電力'][i]
                    #cost_increment = appliance_data[appliance_name]['料金'][i]
                    #total_power[appliance_id] += power_increment
                    #total_cost[appliance_id] += cost_increment
                    #appliance['power'] = total_power[appliance_id] # 合計値を代入
                    #appliance['cost'] = total_cost[appliance_id] # 合計値を代入
                    appliance['power'] = appliance_data[appliance_name]['消費電力'][i]
                    appliance['cost'] = appliance_data[appliance_name]['料金'][i] # 累計コストをそのまま設定
                except IndexError:
                    appliance['power'] = 0
                    # appliance['cost'] = 0
                    #appliance['power'] = total_power[appliance_id]
                    #appliance['cost'] = total_cost[appliance_id]
            updated_appliances.append(appliance)
        socketio.emit('appliance_update', updated_appliances)
        time.sleep(1)

    # 40回送信後、消費電力を0にする
    for appliance in appliances.values():
        appliance['power'] = 0
    socketio.emit('appliance_update', list(appliances.values()))
    
    
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
        #appliances[appliance_id]['isOn'] = not appliances[appliance_id]['isOn']
        socketio.emit('appliance_update', list(appliances.values()))

if __name__ == '__main__':
    # Start the background thread for updating power usage
    update_thread = threading.Thread(target=update_power_usage)
    update_thread.daemon = True
    update_thread.start()
    
    socketio.run(app, debug=True, port=5000)
    #socketio.run(app, debug=True, port=5000, allow_unsafe_werkzeug=True)
