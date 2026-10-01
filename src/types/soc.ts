export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type LayerType = 'L1 Ingress' | 'L2 Routing' | 'L3 Vault';

export type InvestigationStatus = 'Investigating' | 'Review' | 'Cleared' | 'Queued' | 'Escalated';

export interface InvestigationAccount {
  id: string;
  riskScore: number;
  riskLevel: RiskLevel;
  layer: LayerType;
  transactionsCount: number;
  status: InvestigationStatus;
  entityName: string;
  ipAddress: string;
  deviceFingerprint: string;
  jurisdiction: string;
  totalVolumeUSD: number;
  flagReason: string;
  lastActiveUtc: string;
  isContained?: boolean;
}

export interface TransactionRecord {
  txId: string;
  sourceAccount: string;
  destAccount: string;
  amountUSD: number;
  timestampUtc: string;
  layer: LayerType;
  anomalyScore: number;
  flagged: boolean;
  routingHop: number;
}

export interface GraphNode {
  id: string;
  label: string;
  layer: 'L1' | 'L2' | 'L3' | 'IP' | 'VAULT';
  riskScore: number;
  riskLevel: RiskLevel;
  x: number;
  y: number;
  type: 'account' | 'ip' | 'vault' | 'mule_cluster';
  details: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amountUSD: number;
  velocityTxMin: number;
  layerHop: string;
}

export interface ForensicDossier {
  caseId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'ACTIVE TRIAGE' | 'PENDING SAR' | 'RESOLVED' | 'UNDER ESCALATION';
  detectedUtc: string;
  assignedAnalyst: string;
  primaryAccounts: string[];
  totalExposureUSD: number;
  muleSwarmCount: number;
  narrative: string;
  recommendedAction: string;
  regulatoryJurisdiction: string;
}
