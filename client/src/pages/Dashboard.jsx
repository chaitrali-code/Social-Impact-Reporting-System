import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getSDGDistribution, getTimeline } from '../services/api';
import StatCard from '../components/StatCard';
import ProjectCard from '../components/ProjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MdFolder, MdPeople, MdVolunteerActivism, MdPublic,
  MdAutoAwesome, MdGroups
} from 'react-icons/md';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { sdgGoals } from '../utils/sdgData';
import './Dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [sdgDist, setSdgDist] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, sdgRes, timeRes] = await Promise.allSettled([
          getDashboardStats(),
          getSDGDistribution(),
          getTimeline(),
        ]);
        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data.data);;
          if (sdgRes.status === 'fulfilled') {
            const responseData = sdgRes.value.data;
          
            if (Array.isArray(responseData)) {
              setSdgDist(responseData);
            } else if (Array.isArray(responseData?.data)) {
              setSdgDist(responseData.data);
            } else {
              setSdgDist([]);
            }
          }        if (timeRes.status === 'fulfilled') setTimeline(timeRes.value.data.data);
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fallback demo data
  const dashStats = stats || {
    totalProjects: 42,
    totalBeneficiaries: 12850,
    totalVolunteers: 385,
    sdgsCovered: 14,
    reportsGenerated: 28,
    totalClubs: 8,
    recentProjects: [],
  };

  const statCards = [
    { icon: MdFolder, label: 'Total Projects', value: dashStats.totalProjects?.toLocaleString() || '0', gradient: 'purple', subtitle: 'All time' },
    { icon: MdPeople, label: 'Beneficiaries', value: dashStats.totalBeneficiaries?.toLocaleString() || '0', gradient: 'teal', subtitle: 'People reached' },
    { icon: MdVolunteerActivism, label: 'Volunteers', value: dashStats.totalVolunteers?.toLocaleString() || '0', gradient: 'orange', subtitle: 'Contributors' },
    { icon: MdPublic, label: 'SDGs Covered', value: dashStats.sdgsCovered?.toString() || '0', gradient: 'blue', subtitle: 'Out of 17' },
    { icon: MdAutoAwesome, label: 'AI Reports', value: dashStats.reportsGenerated?.toString() || '0', gradient: 'pink', subtitle: 'Generated' },
    { icon: MdGroups, label: 'Active Clubs', value: dashStats.totalClubs?.toString() || '0', gradient: 'green', subtitle: 'Contributing' },
  ];

  // Bar chart — Projects by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
 const timelineLabels =
  timeline?.map(item => `${item.month}/${item.year}`) ||
  months.slice(0, 6);

const projectCounts =
  timeline?.map(item => item.count) ||
  [5, 8, 12, 7, 15, 10];

const beneficiaryCounts =
  timeline?.map(item => item.totalBeneficiaries) ||
  [1200, 2400, 1800, 3200, 2800, 4100];

  const barData = {
  labels: timelineLabels,
  datasets: [{
    label: 'Projects',
    data: projectCounts,
    backgroundColor: (ctx) => {
      const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(124, 58, 237, 0.8)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.3)');
      return gradient;
    },
    borderRadius: 8,
    borderSkipped: false,
    barThickness: 28,
  }],
};
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 50, 0.95)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 1,
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Inter' },
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        border: { display: false },
      },
    },
  };

  // Doughnut — SDG Distribution
      const sdgDistData =
        Array.isArray(sdgDist) && sdgDist.length > 0
          ? sdgDist
          : sdgGoals.slice(0, 8).map((s) => ({
              sdg: s.number,
              count: Math.floor(Math.random() * 10) + 1,
            }));  const doughnutData = {
          labels: sdgDistData.map(d => `SDG ${d.sdg}`),
          datasets: [{
            data: sdgDistData.map(d => d.count),
            backgroundColor: sdgDistData.map(d => {
              const sdg = sdgGoals.find(s => s.number === d.sdg);
              return sdg?.color || '#666';
            }),
            borderWidth: 0,
            hoverOffset: 8,
          }],
        };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 50, 0.95)',
        borderColor: 'rgba(124, 58, 237, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  // Line chart — Impact over time

const lineData = {
  labels: timelineLabels,
  datasets: [{
    label: 'People Reached',
    data: beneficiaryCounts,
      borderColor: '#14b8a6',
      backgroundColor: (ctx) => {
        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(20, 184, 166, 0.3)');
        gradient.addColorStop(1, 'rgba(20, 184, 166, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#14b8a6',
      pointBorderColor: 'rgba(20, 184, 166, 0.3)',
      pointBorderWidth: 3,
      pointHoverRadius: 8,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 50, 0.95)',
        borderColor: 'rgba(20, 184, 166, 0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 12 } },
        border: { display: false },
      },
    },
  };

  const recentProjects = dashStats.recentProjects?.length > 0
    ? dashStats.recentProjects
    : [
        { _id: '1', title: 'Beach Cleanup Drive', club: 'Eco Warriors', category: 'Environment', date: '2025-06-01', beneficiaries: 500, sdgGoals: [14, 15, 13], photos: [] },
        { _id: '2', title: 'Code for Good Hackathon', club: 'Tech Club', category: 'Education', date: '2025-05-15', beneficiaries: 200, sdgGoals: [4, 9, 17], photos: [] },
        { _id: '3', title: 'Blood Donation Camp', club: 'Health Society', category: 'Health', date: '2025-04-20', beneficiaries: 350, sdgGoals: [3], photos: [] },
      ];

  if (loading) {
    return (
      <div className="page-loading">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h1 className="dashboard-title">
            Welcome back, <span className="gradient-text">{user?.name || 'User'}</span> 👋
          </h1>
          <p className="dashboard-subtitle">Here's an overview of your social impact ecosystem</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        {statCards.map((card, i) => (
          <StatCard key={card.label} {...card} delay={i * 80} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3>Projects by Month</h3>
            <span className="chart-badge">2025</span>
          </div>
          <div className="chart-container">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3>SDG Distribution</h3>
            <span className="chart-badge">17 Goals</span>
          </div>
          <div className="chart-container">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="chart-card chart-full">
        <div className="chart-card-header">
          <h3>Impact Over Time</h3>
          <span className="chart-badge">People Reached</span>
        </div>
        <div className="chart-container chart-container-lg">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Recent Projects */}
      <div className="dashboard-section">
        <h2 className="section-title">Recent Projects</h2>
        <div className="projects-grid">
          {recentProjects.slice(0, 3).map((project, i) => (
            <ProjectCard key={project._id || i} project={project} delay={i * 100} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
