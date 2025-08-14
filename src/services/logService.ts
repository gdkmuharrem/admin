import api from '@/libs/api';
import { LogSummaryStats, TopPageStat, GeoStat, TimelineStat } from '@/types/log';

const BASE_URL = '/logs';

export async function fetchLogSummaryStats(): Promise<LogSummaryStats> {
  const res = await api.get(`${BASE_URL}/stats/summary`);
  return res.data;
}

export async function fetchTopPages(): Promise<TopPageStat[]> {
  const res = await api.get(`${BASE_URL}/stats/top-pages`);
  return res.data;
}

export async function fetchGeoStats(): Promise<GeoStat[]> {
  const res = await api.get(`${BASE_URL}/stats/geo`);
  return res.data;
}

export async function fetchTimelineStats(range: '7d' | '30d'): Promise<TimelineStat[]> {
  const res = await api.get(`${BASE_URL}/stats/timeline`, {
    params: { range },
  });
  return res.data;
}
