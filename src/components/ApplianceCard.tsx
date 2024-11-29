import React from 'react';
import { Power, DollarSign, MapPin } from 'lucide-react';
import { ApplianceData } from '../types';

interface Props {
  appliance: ApplianceData;
}

export const ApplianceCard: React.FC<Props> = ({ appliance }) => {
  return (
    <div className={`p-4 rounded-lg shadow-lg bg-gray-50`}>
      <div className="mb-2">
        <h3 className="text-lg font-semibold">{appliance.name}</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center text-gray-600">
          {/* <MapPin className="w-4 h-4 mr-2" />
          <span>{appliance.location}</span> */}
        </div>
        <div className="flex items-center text-gray-600">
          <Power className="w-4 h-4 mr-2" />
          <span>{appliance.power.toFixed(6)} kWh</span>
        </div>
        <div className="flex items-center text-gray-600">
          <DollarSign className="w-4 h-4 mr-2" />
          <span>¥{appliance.cost.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};