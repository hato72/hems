import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ApplianceData } from '../types';

interface Props {
  data: ApplianceData[];
  totalPower: number;
  totalCost: number;
}

export const EnergyDashboard: React.FC<Props> = ({ data, totalPower, totalCost }) => {
  const chartData = data.map(item => ({
    name: item.name,
    power: item.power,
    cost: item.cost
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Power</h3>
          <p className="text-2xl font-bold text-blue-600">{totalPower.toFixed(2)} kWh</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Total Cost</h3>
          <p className="text-2xl font-bold text-green-600">¥{totalCost.toFixed(2)}</p>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
            <YAxis yAxisId="right" orientation="right" stroke="#16a34a" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="power" stroke="#2563eb" name="Power (kWh)" />
            <Line yAxisId="right" type="monotone" dataKey="cost" stroke="#16a34a" name="Cost (¥)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};