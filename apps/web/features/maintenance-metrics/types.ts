export type RecurrenceMachine = {
  machineId: string;
  machineName: string;
  category: string;
  failureCount: number;
  correctiveCount: number;
  overduePreventiveCount: number;
  maintenanceCost: number;
  repeatedPart: { name: string; count: number } | null;
  recurringFailure: { type: string; count: number } | null;
};

export type RecurrenceMetrics = {
  periodMonths: number;
  since: string;
  generatedAt: string;
  summary: {
    machinesAnalyzed: number;
    failureCount: number;
    correctiveCount: number;
    overduePreventiveCount: number;
    maintenanceCost: number;
    recurringMachines: number;
  };
  machines: RecurrenceMachine[];
};
