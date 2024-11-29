import React, { useEffect, useState } from 'react';
import {XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Legend, Bar, LabelList } from 'recharts';
import { ApplianceData } from '../types';

interface Props {
  data: ApplianceData[];
  totalPower: number;
  totalCost: number;
  onAlertTriggered: (appliances: ApplianceData[]) => void; // 関数の型を定義
  difyResponse: string | null; 
}

export const EnergyDashboard: React.FC<Props> = ({ data, totalPower, totalCost,onAlertTriggered, difyResponse}) => {

  const maxPower = 0.0001; // 電力の最大値 (kWh)
  const maxCost = 700;  // コストの最大値 (¥)
  const targetCost = 445; //一日の目標コスト

  //const targetCostData = { name: '目標', cost: targetCost };
  const totalCostData = { name: '累計', cost: totalCost };

  const [alertSent,setAlertSent] = useState(false);

  // アラート表示のフラグ
  const showAlert = totalCost > targetCost;

  useEffect(() => {
    if (showAlert && !alertSent) {
      onAlertTriggered(data);
      setAlertSent(true);
    }
    if (showAlert && data.some(item => item.power > 0)) {
      //追加
    }
  }, [showAlert, data, onAlertTriggered,alertSent]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">合計コスト</h3>
          <p className="text-2xl font-bold text-green-600">¥{totalCost.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">合計電力</h3>
          <p className="text-2xl font-bold text-blue-600">{totalPower.toFixed(2)} kWh</p>
        </div> */}
      </div>
      {showAlert && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">アラート:</strong>
          <span className="block sm:inline"> 累計コストが目標金額を超過しました！</span>
        </div>
      )}
      {/* {difyResponse && ( // difyResponse が null でない場合に表示
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-500 rounded">
          <p className="text-yellow-700">{difyResponse}</p>
        </div>
      )} */}
      <div className="flex flex-row"> {/* flex container */}
        <div className="w-1/2 pr-4">
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[totalCostData, { name: '目標', target: targetCost }]}> {/* データを修正 */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, maxCost]} name="コスト" unit="円" />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" name="累積コスト" fill="#16a34a" isAnimationActive={false}>
                  <LabelList dataKey="cost" position="top" formatter={(value:number) => value.toFixed(7)} />
                </Bar>
                <Bar dataKey="target" name="目標金額" fill="red" isAnimationActive={false}>
                  <LabelList dataKey="target" position="top" formatter={(value:number) => value.toFixed(7)} />
                </Bar> {/* dataKey を target に変更 */}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-1/2 pl-4">
          <div className="h-64 mt-4"> {/* コストのグラフ */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0,maxCost]} dataKey="cost" name="コスト" unit="円" />
                <Tooltip />
                <Legend />
                <Bar dataKey="cost" name="累積コスト" fill="#16a34a">
                  <LabelList dataKey="cost" position="top" formatter={(value:number) => value.toFixed(7)} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex flex-row"> {/* flex container */}
        <div className="w-1/2 pr-4">
          <div className="h-64"> {/* 消費電力のグラフ */}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  domain={[0,maxPower]} 
                  dataKey="power" 
                  name="電力 (kWh)" 
                  unit=" kWh" 
                  tickFormatter={(value) => {
                    const exponent = Math.floor(Math.log10(value));
                    const coefficient = value / Math.pow(10, exponent);
                    return `${coefficient.toFixed(1)} × 10^${exponent}`;
                  }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="power" name="電力" fill="#2563eb"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="w-1/2 pl-4"> {/* Difyの提案文章 */}
            {difyResponse && (
              <div className="mt-4 p-4 bg-yellow-100 border border-yellow-500 rounded">
                  <p className="text-yellow-700">{difyResponse}</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};