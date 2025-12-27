
export interface SensorData {
  workerId: string;
  heartRate: number;
  machineTemp: number;
  energyConsumption: number;
  activeTasks: string;
  timestamp: string;
}

export interface ShiftReport {
  safetyStatus: 'Green' | 'Yellow' | 'Red';
  ecoImpact: string;
  workerTip: string;
  content: string;
  rawJson: string;
}

export interface HistoryItem extends SensorData {
  id: string;
  report?: ShiftReport;
}
