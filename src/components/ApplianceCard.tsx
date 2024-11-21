import React from 'react';
import { Power, DollarSign, MapPin } from 'lucide-react';
import { ApplianceData } from '../types';

interface Props {
  appliance: ApplianceData;
  onToggle: (id: string) => void;
}

export const ApplianceCard: React.FC<Props> = ({ appliance, onToggle }) => {
  return (
    <div className={`p-4 rounded-lg shadow-lg ${appliance.isOn ? 'bg-green-50' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{appliance.name}</h3>
        <button
          onClick={() => onToggle(appliance.id)}
          className={`px-4 py-2 rounded-full ${
            appliance.isOn ? 'bg-green-500 text-white' : 'bg-gray-300'
          }`}
        >
          {appliance.isOn ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{appliance.location}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Power className="w-4 h-4 mr-2" />
          <span>{appliance.power.toFixed(2)} kWh</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>¥{appliance.cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};