import fs from 'fs';
import path from 'path';

export interface SaaSUsageMeterData {
  periodMonth: string; // e.g. "2026-08"
  waMessages: number;
  aiTokens: number;
  pgSettlements: number;
  updatedAt: string;
}

const meterFilePath = path.join(process.cwd(), 'scratch', 'saas_usage_meter.json');

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getLiveSaaSUsage(): SaaSUsageMeterData {
  const currentMonth = getCurrentMonth();
  try {
    if (fs.existsSync(meterFilePath)) {
      const data = JSON.parse(fs.readFileSync(meterFilePath, 'utf8')) as SaaSUsageMeterData;
      if (data.periodMonth === currentMonth) {
        return data;
      }
    }
  } catch (err) {
    console.error('[SaaSUsageMeter] Error reading meter file:', err);
  }

  // Initial fresh month meter
  const freshMeter: SaaSUsageMeterData = {
    periodMonth: currentMonth,
    waMessages: 0,
    aiTokens: 0,
    pgSettlements: 0,
    updatedAt: new Date().toISOString(),
  };

  saveSaaSUsage(freshMeter);
  return freshMeter;
}

export function saveSaaSUsage(data: SaaSUsageMeterData) {
  try {
    const dir = path.dirname(meterFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(meterFilePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[SaaSUsageMeter] Error saving meter file:', err);
  }
}

export function incrementSaaSUsage(type: 'WA' | 'AI' | 'PG', amount: number = 1): SaaSUsageMeterData {
  const data = getLiveSaaSUsage();

  if (type === 'WA') {
    data.waMessages += amount;
  } else if (type === 'AI') {
    data.aiTokens += amount;
  } else if (type === 'PG') {
    data.pgSettlements += amount;
  }

  data.updatedAt = new Date().toISOString();
  saveSaaSUsage(data);
  return data;
}
