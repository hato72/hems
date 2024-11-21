import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { ApplianceCard } from './components/ApplianceCard';
import { EnergyDashboard } from './components/EnergyDashboard';
import { SuggestionList } from './components/SuggestionList';
import { ApplianceData, Suggestion } from './types';
import { AlertTriangle } from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';
const socket = io(BACKEND_URL);

function App() {
  const [appliances, setAppliances] = useState<ApplianceData[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [totalPower, setTotalPower] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Consolidate AC Usage',
      description: 'Consider gathering in the living room to use a single AC unit instead of multiple units.',
      savingPotential: 3000,
    },
    {
      id: '2',
      title: 'Use Alternative Heating',
      description: 'For single person use, consider using an electric blanket instead of AC.',
      savingPotential: 2000,
    },
  ];

  useEffect(() => {
    // Initial fetch of appliances
    fetch(`${BACKEND_URL}/api/appliances`)
      .then(response => response.json())
      .then(data => setAppliances(data))
      .catch(error => console.error('Error fetching appliances:', error));

    // Listen for real-time updates
    socket.on('appliance_update', (data: ApplianceData[]) => {
      setAppliances(data);
      const newTotalPower = data.reduce((sum, app) => sum + app.power, 0);
      const newTotalCost = data.reduce((sum, app) => sum + app.cost, 0);
      setTotalPower(newTotalPower);
      setTotalCost(newTotalCost);
    });

    // Listen for power alerts
    socket.on('power_alert', (data: { message: string }) => {
      setShowAlert(true);
      setAlertMessage(data.message);
    });

    return () => {
      socket.off('appliance_update');
      socket.off('power_alert');
    };
  }, []);

  const handleToggle = (id: string) => {
    socket.emit('toggle_appliance', { id });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Home Energy Monitor</h1>
        
        {showAlert && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4 rounded">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
              <p className="text-red-700">{alertMessage}</p>
            </div>
          </div>
        )}

        <EnergyDashboard 
          data={appliances}
          totalPower={totalPower}
          totalCost={totalCost}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Active Appliances</h2>
            <div className="grid grid-cols-1 gap-4">
              {appliances.map(appliance => (
                <ApplianceCard
                  key={appliance.id}
                  appliance={appliance}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>
          
          <SuggestionList suggestions={suggestions} />
        </div>
      </div>
    </div>
  );
}

export default App;