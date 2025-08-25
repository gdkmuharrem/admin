export interface LogSummaryStats {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
}

export interface TopPageStat {
  page: string | null;
  count: number;
}

export interface GeoStat {
  country: string | null;
  count: number;
}

export interface TimelineStat {
  date: string; // yyyy-mm-dd formatında
  count: number;
}
