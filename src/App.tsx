import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { EnergyDashboard } from './components/EnergyDashboard';
import { ApplianceCard } from './components/ApplianceCard';
import { ApplianceData } from './types';

const BACKEND_URL = 'http://localhost:5000'; // バックエンドのURL

const socket = io(BACKEND_URL);

function App() {
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  useEffect(() => {
    socket.on('appliance_update', (data: ApplianceData[]) => {
      setAppliances(data);
    });

    // ゼロコストアラートを受信
    socket.on('zero_cost_alert', (data: { message: string }) => {
      setAlertMessage(data.message);

      // 5秒後にアラートを非表示
      setTimeout(() => setAlertMessage(null), 5000);
    });

    // クリーンアップ処理
    return () => {
      socket.off('appliance_update');
      socket.off('zero_cost_alert');
    };
  }, []);

  const handleToggle = (id: string) => {
    socket.emit('toggle_appliance', { id });
  };

  // appliancesの合計値を計算
  const totalPower = appliances.reduce((sum, app) => sum + app.power, 0);
  const totalCost = appliances.reduce((sum, app) => sum + app.cost, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* アラートメッセージ */}
        {alertMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700">{alertMessage}</p>
          </div>
        )}

        {/* ダッシュボード */}
        <EnergyDashboard data={appliances} totalPower={totalPower} totalCost={totalCost} />

        {/* 家電情報のカード表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {appliances.map((appliance) => (
            <ApplianceCard key={appliance.id} appliance={appliance} onToggle={handleToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

// import React, { useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import { ApplianceCard } from './components/ApplianceCard';
// import { EnergyDashboard } from './components/EnergyDashboard';
// import { SuggestionList } from './components/SuggestionList';
// import { ApplianceData, Suggestion } from './types';
// import { AlertTriangle } from 'lucide-react';

// const BACKEND_URL = 'http://localhost:5000';
// const socket = io(BACKEND_URL);

// function App() {
//   const [appliances, setAppliances] = useState<ApplianceData[]>([]);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertMessage, setAlertMessage] = useState('');
//   const [totalPower, setTotalPower] = useState(0);
//   const [totalCost, setTotalCost] = useState(0);

//   const suggestions: Suggestion[] = [
//     {
//       id: '1',
//       title: 'エアコンの使用をまとめる',
//       description: '複数のエアコンを使う代わりに、リビングルームに集まって1台のエアコンを使用することを検討してください。',
//       savingPotential: 3000,
//     },
//     {
//       id: '2',
//       title: '代替暖房を使用する',
//       description: '一人用の場合、エアコンの代わりに電気毛布を使用することを検討してください。',
//       savingPotential: 2000,
//     },
//   ];

//   useEffect(() => {
//     const fetchData = () => {
//       fetch(`${BACKEND_URL}/api/appliances`)
//         .then(response => response.json())
//         .then(data => {
//           setAppliances(data);
//           const newTotalPower = data.reduce((sum, app) => sum + app.power, 0);
//           const newTotalCost = data.reduce((sum, app) => sum + app.cost, 0);
//           setTotalPower(newTotalPower);
//           setTotalCost(newTotalCost);
//         })
//         .catch(error => console.error('家電データの取得エラー:', error));
//     };

//     fetchData(); // 初回データ取得

//     const intervalId = setInterval(fetchData, 1000); // 1秒ごとにデータ取得

//     // リアルタイム更新をリッスン
//     socket.on('appliance_update', (data: ApplianceData[]) => {
//       setAppliances(data);
//       const newTotalPower = data.reduce((sum, app) => sum + app.power, 0);
//       const newTotalCost = data.reduce((sum, app) => sum + app.cost, 0);
//       setTotalPower(newTotalPower);
//       setTotalCost(newTotalCost);
//     });

//     // 電力アラートをリッスン
//     socket.on('power_alert', (data: { message: string }) => {
//       setShowAlert(true);
//       setAlertMessage(data.message);
//     });

//     return () => {
//       clearInterval(intervalId); // インターバルをクリーンアップ
//       socket.off('appliance_update');
//       socket.off('power_alert');
//     };
//   }, []);

//   const handleToggle = (id: string) => {
//     socket.emit('toggle_appliance', { id });
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-6xl mx-auto space-y-6">
//         <h1 className="text-3xl font-bold text-gray-800">家庭エネルギーモニター</h1>

//         {showAlert && (
//           <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded">
//             <div className="flex items-center">
//               <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
//               <p className="text-red-700">{alertMessage}</p>
//             </div>
//           </div>
//         )}

//         <EnergyDashboard
//           data={appliances}
//           totalPower={totalPower}
//           totalCost={totalCost}
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="space-y-4">
//             <h2 className="text-xl font-semibold">アクティブな家電</h2>
//             <div className="grid grid-cols-1 gap-4">
//               {appliances.map(appliance => (
//                 <ApplianceCard
//                   key={appliance.id}
//                   appliance={appliance}
//                   onToggle={handleToggle}
//                 />
//               ))}
//             </div>
//           </div>

//           <SuggestionList suggestions={suggestions} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

