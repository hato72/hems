export interface ApplianceData {
  id: string;
  name: string;
  location: string;
  power: number;
  isOn: boolean;
  cost: number;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  savingPotential: number;
}