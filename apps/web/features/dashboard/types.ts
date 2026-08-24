export type DashboardSummary = {
  generatedAt: string;
  machines: {
    total: number;
    active: number;
    underMaintenance: number;
    inactive: number;
    retired: number;
  };
  maintenance: {
    dueSoon: number;
    overdue: number;
  };
  openUrgentNotifications: number;
  recentLogs: Array<{
    id: string;
    machine: { id: string; name: string };
    maintenancePlan: { id: string; name: string } | null;
    performedAt: string;
    type: 'PREVENTIVE' | 'CORRECTIVE' | 'INSPECTION';
    result: 'OK' | 'NEEDS_FOLLOW_UP' | 'FAILED' | 'CRITICAL_FAILURE';
    performedBy: string;
  }>;
};

export type DashboardResult = DashboardSummary['recentLogs'][number]['result'];

export type DashboardMachineDistribution = {
  label: string;
  count: number;
  color: string;
};
