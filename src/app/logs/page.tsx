'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchLogSummaryStats,
  fetchTopPages,
  fetchGeoStats,
  fetchTimelineStats,
} from '@/services/logService';
import { LogSummaryStats, TopPageStat, GeoStat, TimelineStat } from '@/types/log';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,  // <-- BURAYA EKLE
} from 'chart.js';

import styles from '@/components/LogsPage.module.css';

// Filler plugin'i register et
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function AdminLogsPage() {
  const [summary, setSummary] = useState<LogSummaryStats | null>(null);
  const [topPages, setTopPages] = useState<TopPageStat[]>([]);
  const [geoStats, setGeoStats] = useState<GeoStat[]>([]);
  const [timelineStats, setTimelineStats] = useState<TimelineStat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<'7d' | '30d'>('7d');

  // Filtreler
  const [ipFilter, setIpFilter] = useState('');
  const [pageFilter, setPageFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredTopPages = topPages.filter((tp) =>
    tp.page?.toLowerCase().includes(pageFilter.toLowerCase() ?? '') ?? false
  );

  useEffect(() => {
    async function loadStats() {
      try {
        const [summaryData, topPagesData, geoData, timelineData] = await Promise.all([
          fetchLogSummaryStats(),
          fetchTopPages(),
          fetchGeoStats(),
          fetchTimelineStats(range),
        ]);
        setSummary(summaryData);
        setTopPages(topPagesData);
        setGeoStats(geoData);
        setTimelineStats(timelineData);
        setError(null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Veri alınırken hata oluştu');
        }
      }
    }
    loadStats();
  }, [range]);


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Ziyaretçi Logları ve İstatistikler</h1>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label>IP Filtre:</label>
          <input
            type="text"
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
            placeholder="IP adresi ara"
            className={styles.input}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Sayfa Adı Filtre:</label>
          <input
            type="text"
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
            placeholder="Sayfa adı ara"
            className={styles.input}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Başlangıç Tarihi:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>Bitiş Tarihi:</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className={styles.input}
          />
        </div>
      </section>

      {summary && (
        <section className={styles.statsGrid}>
          <StatCard title="Bugün" value={summary.today} />
          <StatCard title="Bu Hafta" value={summary.thisWeek} />
          <StatCard title="Bu Ay" value={summary.thisMonth} />
          <StatCard title="Toplam" value={summary.total} />
        </section>
      )}

      <section className={styles.section}>
        <h2 className={styles.subtitle}>En Çok Ziyaret Edilen Sayfalar</h2>
        <SimpleTable
          headers={['Sayfa', 'Ziyaret Sayısı']}
          rows={filteredTopPages.map(({ page, count }) => [page ?? '(Bilinmeyen)', count.toString()])}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Ülkelere Göre Ziyaretçi Dağılımı</h2>
        <SimpleTable
          headers={['Ülke', 'Ziyaretçi Sayısı']}
          rows={geoStats.map(({ country, count }) => [country ?? '(Bilinmeyen)', count.toString()])}
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>
          Zaman Çizelgesi
          <select
            className={styles.select}
            value={range}
            onChange={(e) => setRange(e.target.value as '7d' | '30d')}
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
          </select>
        </h2>
        <TimelineChart data={timelineStats} />
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className={styles.statCard}>
      <p className={styles.statTitle}>{title}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} className={styles.tableHeader}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={headers.length} className={styles.noData}>
              Veri yok
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr key={i} className={styles.tableRow}>
              {row.map((cell, ci) => (
                <td key={ci} className={styles.tableCell}>
                  {cell}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function TimelineChart({ data }: { data: TimelineStat[] }) {
  const labels = data.map((d) => d.date);
  const counts = data.map((d) => d.count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Ziyaretçi Sayısı',
        data: counts,
        borderColor: '#0f4c81',
        backgroundColor: 'rgba(15, 76, 129, 0.3)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Zaman Çizelgesi' },
    },
  };

  return <Line data={chartData} options={options} />;
}
