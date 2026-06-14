import { useState, useEffect } from 'react';
import { getCategoryDistribution, getClubImpact, getTimeline, getDashboardStats } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { MdTrendingUp, MdPeople, MdCategory, MdGroups } from 'react-icons/md';
import './ImpactVisualization.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const ImpactVisualization = () => {
  const [categoryData, setCategoryData] = useState(null);
  const [clubData, setClubData] = useState(null);
  const [timelineData, setTimelineData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, clubRes, timeRes, statsRes] = await Promise.allSettled([
          getCategoryDistribution(),
          getClubImpact(),
          getTimeline(),
          getDashboardStats(),
        ]);
        if (catRes.status === 'fulfilled') setCategoryData(catRes.value.data.data);
        if (clubRes.status === 'fulfilled') setClubData(clubRes.value.data.data);
        if (timeRes.status === 'fulfilled') setTimelineData(timeRes.value.data.data);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);
      } catch {
        // use demo data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Demo fallbacks
  const catLabels =
  categoryData?.map(item => item.category) ||
  ['Education', 'Health', 'Environment'];

  const catValues =
  categoryData?.map(item => item.count) ||
  [12, 8, 15];

  const clubLabels =
  clubData?.map(item => item.club) ||
  ['Eco Warriors', 'Tech Club'];

  const clubValues =
  clubData?.map(item => item.projectCount) ||
  [15, 12];

  const timeLabels =
  timelineData?.map(
    item => `${item.month}/${item.year}`
  ) || ['Jan', 'Feb'];

  const timeValues =
  timelineData?.map(
    item => item.totalBeneficiaries
  ) || [1200, 2400];

  const topProjects = timelineData?.topProjects || [
    { name: 'Beach Cleanup Drive', impact: 800 },
    { name: 'Code for Good Hackathon', impact: 650 },
    { name: 'Blood Donation Camp', impact: 550 },
    { name: 'Tree Plantation Drive', impact: 420 },
    { name: 'Digital Literacy Camp', impact: 350 },
  ];

  const summaryStats = stats || {
    totalProjects: 42,
    totalBeneficiaries: 12850,
    totalVolunteers: 385,
    sdgsCovered: 14,
  };

  // Chart configs
  const categoryChart = {
    labels: catLabels,
    datasets: [{
      label: 'Projects',
      data: catValues,
      backgroundColor: [
        'rgba(124, 58, 237, 0.7)', 'rgba(20, 184, 166, 0.7)',
        'rgba(59, 130, 246, 0.7)', 'rgba(249, 115, 22, 0.7)',
        'rgba(236, 72, 153, 0.7)', 'rgba(34, 197, 94, 0.7)',
      ],
      borderRadius: 8,
      borderSkipped: false,
      barThickness: 32,
    }],
  };

  const lineChart = {
    labels: timeLabels,
    datasets: [{
      label: 'People Reached',
      data: timeValues,
      borderColor: '#14b8a6',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.25)');
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#14b8a6',
      pointBorderColor: 'rgba(20, 184, 166, 0.3)',
      pointBorderWidth: 3,
    }],
  };

  const doughnutChart = {
    labels: clubLabels,
    datasets: [{
      data: clubValues,
      backgroundColor: [
        'rgba(124, 58, 237, 0.8)', 'rgba(59, 130, 246, 0.8)',
        'rgba(20, 184, 166, 0.8)', 'rgba(249, 115, 22, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  // const horizontalBarChart = {
  //   labels: topProjects.map(p => p.name),
  //   datasets: [{
  //     label: 'Impact Score',
  //     data: topProjects.map(p => p.impact),
  //     backgroundColor: (ctx) => {
  //       const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 400, 0);
  //       gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
  //       gradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
  //       return gradient;
  //     },
  //     borderRadius: 6,
  //     borderSkipped: false,
  //     barThickness: 24,
  //   }],
  // };

  const chartOptions = (title) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 50, 0.95)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11 } },
        border: { display: false },
      },
    },
  });

  const horizontalOptions = {
    ...chartOptions(),
    indexAxis: 'y',
    scales: {
      ...chartOptions().scales,
      x: {
        ...chartOptions().scales.x,
        grid: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        ...chartOptions().scales.y,
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 50, 0.95)',
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  if (loading) {
    return <div className="page-loading"><LoadingSpinner size="lg" text="Loading impact data..." /></div>;
  }

  return (
    <div className="impact-page">
      <div className="impact-page-header">
        <h1 className="page-title">Impact Visualization</h1>
        <p className="page-subtitle">Deep-dive analytics into your social impact ecosystem</p>
      </div>

      {/* Summary Stats */}
      <div className="impact-summary">
        <div className="summary-item">
          <MdCategory className="summary-icon" style={{ color: '#7c3aed' }} />
          <div className="summary-value">{summaryStats.totalProjects}</div>
          <div className="summary-label">Projects</div>
        </div>
        <div className="summary-item">
          <MdPeople className="summary-icon" style={{ color: '#14b8a6' }} />
          <div className="summary-value">{summaryStats.totalBeneficiaries?.toLocaleString()}</div>
          <div className="summary-label">People Reached</div>
        </div>
        <div className="summary-item">
          <MdGroups className="summary-icon" style={{ color: '#f97316' }} />
          <div className="summary-value">{summaryStats.totalVolunteers}</div>
          <div className="summary-label">Volunteers</div>
        </div>
        <div className="summary-item">
          <MdTrendingUp className="summary-icon" style={{ color: '#ec4899' }} />
          <div className="summary-value">{summaryStats.sdgsCovered}/17</div>
          <div className="summary-label">SDGs Covered</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="impact-charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Category Distribution</h3>
            <span className="chart-badge">Projects</span>
          </div>
          <div className="chart-container">
            <Bar data={categoryChart} options={chartOptions()} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Club-wise Contribution</h3>
            <span className="chart-badge">Clubs</span>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutChart} options={doughnutOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>People Reached Over Time</h3>
            <span className="chart-badge">Timeline</span>
          </div>
          <div className="chart-container">
            <Line data={lineChart} options={chartOptions()} />
          </div>
        </div>

        {/* <div className="chart-card">
          <div className="chart-card-header">
            <h3>Top 5 Most Impactful Projects</h3>
            <span className="chart-badge">Rankings</span>
          </div>
          <div className="chart-container">
            <Bar data={horizontalBarChart} options={horizontalOptions} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ImpactVisualization;
