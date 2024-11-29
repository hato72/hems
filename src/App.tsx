import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { EnergyDashboard } from './components/EnergyDashboard';
import { ApplianceCard } from './components/ApplianceCard';
import { ApplianceData } from './types';

const BACKEND_URL = 'http://localhost:5000'; // バックエンドのURL

const socket = io(BACKEND_URL);

function App() {
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);

  const [zeroPowerDuration, setZeroPowerDuration] = useState(0); // 消費電力量が0の状態が継続している時間 (秒)
  const [showZeroPowerAlert, setShowZeroPowerAlert] = useState(false); // 消費電力量0アラート表示フラグ

  const [difyResponse, setDifyResponse] = useState<string | null>(null); // difyResponseの状態変数を追加

  const [showAlertTriggered, setShowAlertTriggered] = useState(false);


  useEffect(() => {
    socket.on('appliance_update', (data: ApplianceData[]) => {
      //setAppliances(data);

      const currentAppliances = appliances.reduce((acc, curr) => { // 現在のAppliancesの状態を取得
        acc[curr.id] = curr;
        return acc;
      }, {} as { [key: string]: ApplianceData });

      // 新しいデータでAppliancesの状態を更新
      const updatedAppliances = data.map((appliance) => {
        const currentAppliance = currentAppliances[appliance.id] || appliance;
        return {
          //...currentAppliance,
          ...appliance,
          //power: (currentAppliance.power || 0) + appliance.power,
          power: appliance.power,
          cost: (currentAppliance.cost || 0) + appliance.cost,
        };
      });
      
      setAppliances(updatedAppliances);

      // updatedAppliancesのどれかのpowerが0より大きければアラートを非表示にする
      if (updatedAppliances.some(appliance => appliance.power > 0)) {
        setZeroPowerDuration(0);
        setShowZeroPowerAlert(false);
      }
    });

    // クリーンアップ処理
    // return () => {
    //   socket.off('appliance_update');
    // };

    const intervalId = setInterval(() => {
      // 全ての家電の消費電力が0かどうかをチェック
      const allPowerZero = appliances.every((appliance) => appliance.power === 0);

      if (allPowerZero) {
        setZeroPowerDuration((prevDuration) => prevDuration + 1); // 継続時間を1秒増やす
      } else {
        setZeroPowerDuration(0); // 0でない場合は継続時間をリセット
      }
    }, 1000);

    // クリーンアップ関数
    return () => clearInterval(intervalId);
  }, [appliances]);

  useEffect(() => {
    // zeroPowerDuration が 30秒以上になったらアラートを表示
    if (zeroPowerDuration >= 30) {
      setShowZeroPowerAlert(true);
    } else {
      setShowZeroPowerAlert(false);
    }
  }, [zeroPowerDuration]);

  // appliancesの合計値を計算
  const totalPower = appliances.reduce((sum, app) => sum + app.power, 0);
  const totalCost = appliances.reduce((sum, app) => sum + app.cost, 0);

  const sendDataToBackend = async (appliancesData: ApplianceData[]) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/send_data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appliances: appliancesData.map(appliance => ({name: appliance.name, cost: appliance.cost})) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setDifyResponse(result.result);
    } catch (error) {
      console.error('Failed to send data to backend:', error);
      //setDifyResponse('バックエンドとの通信に失敗しました。');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {showZeroPowerAlert && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4" role="alert">
            <strong className="font-bold">アラート:</strong>
            <span className="block sm:inline"> 消費電力量が0の状態が30秒以上続いています。</span>
          </div>
        )}
        <EnergyDashboard data={appliances} totalPower={totalPower} totalCost={totalCost} onAlertTriggered={sendDataToBackend} difyResponse={difyResponse}/>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appliances.map((appliance) => (
            <ApplianceCard key={appliance.id} appliance={appliance} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
