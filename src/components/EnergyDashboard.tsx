import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Legend, Bar } from 'recharts';
import { ApplianceData } from '../types';

interface Props {
  data: ApplianceData[];
  totalPower: number;
  totalCost: number;
}

export const EnergyDashboard: React.FC<Props> = ({ data, totalPower, totalCost }) => {
  // const chartData = data.map(item => ({
  //   name: item.name,
  //   power: item.power,
  //   cost: item.cost
  // }));

  const maxPower = 0.0001; // 電力の最大値 (kWh)
  const maxCost = 5;  // コストの最大値 (¥)


  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">合計コスト</h3>
          <p className="text-2xl font-bold text-green-600">¥{totalCost.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">合計電力</h3>
          <p className="text-2xl font-bold text-blue-600">{totalPower.toFixed(2)} kWh</p>
        </div>
      </div>
      {/* <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#2563eb" dataKey="power" name="電力 (kWh)" unit=" kWh"/>
            <YAxis yAxisId="right" orientation="right" stroke="#16a34a" dataKey="cost" name="コスト (¥)" unit=" ¥"/>
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="power" stroke="#2563eb" name="電力 (kWh)" />
            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#16a34a" name="コスト (¥)" />
          </LineChart>
        </ResponsiveContainer>
      </div> */}
      <div className="grid grid-cols-2 gap-4"> {/* グラフを2つ並べる */}
        <div className="h-64"> {/* コストのグラフ */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0,maxCost]} dataKey="cost" name="コスト (¥)" unit=" ¥" />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" name="累積コスト" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-64"> {/* 消費電力のグラフ */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0,maxPower]} dataKey="power" name="電力 (kWh)" unit=" kWh" />
              <Tooltip />
              <Legend />
              <Bar dataKey="power" name="電力" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};