export interface ApplianceData {
  id: string;
  name: string;
  power: number;
  cost: number;
  //location: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  savingPotential: number;
}