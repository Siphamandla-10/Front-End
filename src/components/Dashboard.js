import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import Orders from './Orders';
import Drivers from './Drivers';
import Customers from './Customers';
import RestaurantsList from './RestaurantsList';
import Payments from './Payments';
import Documents from './Documents';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    verifyToken();
    if (activeMenu === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeMenu]);

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.get('/api/auth/verify');

      if (response.data.success) {
        setAdmin(response.data.admin);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      navigate('/login');
    }
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const statsResponse = await api.get('/api/dashboard/stats');
      setStats(statsResponse.data.data);

      const chartResponse = await api.get('/api/dashboard/chart-data');
      setChartData(chartResponse.data.data);

      const suggestionsResponse = await api.get('/api/dashboard/ai-suggestions');
      setAiSuggestions(suggestionsResponse.data.data);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const formatChange = (change) => {
    return `${Math.abs(change).toFixed(1)}% from week`;
  };

  const getChangeClass = (change) => {
    return change >= 0 ? 'positive' : 'negative';
  };

  const getPageTitle = () => {
    const titles = {
      control: 'Control Center',
      dashboard: 'Dashboard Overview',
      orders: 'Orders Management',
      drivers: 'Drivers Management',
      pending: 'Pending Documents',
      customers: 'Customers Management',
      deliveries: 'Deliveries',
      map: 'Live Map',
      payments: 'Payments',
      restaurants: 'Restaurants Management',
      ai: 'AI Insights',
      settings: 'Settings'
    };
    return titles[activeMenu] || activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1);
  };

  const getAdminFullName = () => {
    if (!admin) return 'Administrator';
    const firstName = admin.name ? admin.name.trim() : '';
    const lastName = admin.surname ? admin.surname.trim() : '';
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    }
    return 'Administrator';
  };

  const getAdminInitials = () => {
    if (!admin) return 'AD';
    
    const firstName = admin.name ? admin.name.trim() : '';
    const lastName = admin.surname ? admin.surname.trim() : '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.substring(0, 2).toUpperCase();
    } else if (lastName) {
      return lastName.substring(0, 2).toUpperCase();
    }
    return 'AD';
  };

  const getAdminEmail = () => {
    return admin?.email || 'admin@delivernow.com';
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'orders':
        return <Orders />;
      
      case 'drivers':
        return <Drivers />;
      
      case 'customers':
        return <Customers />;
      
      case 'restaurants':
        return <RestaurantsList />;
      
      case 'control':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🎛️</div>
            <h3>Control Center</h3>
            <p>Advanced control features coming soon...</p>
          </div>
        );
      
      case 'pending':
        return <Documents />;
      
      case 'deliveries':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">📦</div>
            <h3>Deliveries</h3>
            <p>Delivery tracking features coming soon...</p>
          </div>
        );
      
      case 'map':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🗺️</div>
            <h3>Live Map</h3>
            <p>Real-time tracking map coming soon...</p>
          </div>
        );
      
      case 'payments':
        return <Payments />;
      
      case 'ai':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">🤖</div>
            <h3>AI Insights</h3>
            <p>AI-powered analytics coming soon...</p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="coming-soon">
            <div className="coming-soon-icon">⚙️</div>
            <h3>Settings</h3>
            <p>System configuration coming soon...</p>
          </div>
        );
      
      case 'dashboard':
      default:
        if (loading) {
          return (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          );
        }

        return (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Active Drivers</div>
                <div className="stat-value">{stats?.activeDrivers || 0}</div>
                <div className={`stat-change ${getChangeClass(stats?.activeDriversChange || 0)}`}>
                  {formatChange(stats?.activeDriversChange || 0)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Active Orders</div>
                <div className="stat-value">{stats?.activeOrders || 0}</div>
                <div className={`stat-change ${getChangeClass(stats?.activeOrdersChange || 0)}`}>
                  {formatChange(stats?.activeOrdersChange || 0)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Total Deliveries</div>
                <div className="stat-value">{stats?.totalDeliveries || 0}</div>
                <div className={`stat-change ${getChangeClass(stats?.totalDeliveriesChange || 0)}`}>
                  {formatChange(stats?.totalDeliveriesChange || 0)}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Ongoing Deliveries</div>
                <div className="stat-value">{stats?.ongoingDeliveries || 0}</div>
                <div className={`stat-change ${getChangeClass(stats?.ongoingDeliveriesChange || 0)}`}>
                  {Math.abs(stats?.ongoingDeliveriesChange || 0).toFixed(1)}% from yesterday
                </div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Delivery Trends - Last 7 Days</h3>
                </div>
                <div className="simple-chart">
                  <div className="chart-bars">
                    {chartData.map((item, index) => {
                      const maxValue = Math.max(...chartData.map(d => d.value));
                      const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 10;
                      
                      return (
                        <div key={index} className="chart-bar-container">
                          <div 
                            className="chart-bar" 
                            style={{ height: `${heightPercent}%` }}
                          >
                            <span className="chart-bar-value">{item.value}</span>
                          </div>
                          <div className="chart-label">{item.date}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {aiSuggestions.length > 0 && (
              <div className="ai-suggestions-card">
                <div className="ai-header">
                  <h3 className="ai-title">🤖 AI-Powered Suggestions</h3>
                </div>
                {aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="suggestion-item">
                    <div className="suggestion-title">
                      {suggestion.priority === 'high' && '🔴 '}
                      {suggestion.priority === 'medium' && '🟡 '}
                      {suggestion.title}
                    </div>
                    <div className="suggestion-description">{suggestion.description}</div>
                    <a href="#" className="suggestion-link" onClick={(e) => e.preventDefault()}>
                      View details →
                    </a>
                  </div>
                ))}
              </div>
            )}

            <div className="quick-actions-card">
              <div className="quick-actions-header">
                <h3 className="quick-actions-title">Quick Actions</h3>
              </div>
              <div className="quick-actions-grid">
                <div className="quick-action-item" onClick={() => setActiveMenu('orders')}>
                  <span className="quick-action-icon">📋</span>
                  <div className="quick-action-text">
                    <div className="quick-action-label">Manage Orders</div>
                    <div className="quick-action-value">{stats?.activeOrders || 0} Active</div>
                  </div>
                </div>
                <div className="quick-action-item" onClick={() => setActiveMenu('drivers')}>
                  <span className="quick-action-icon">👤</span>
                  <div className="quick-action-text">
                    <div className="quick-action-label">Manage Drivers</div>
                    <div className="quick-action-value">{stats?.activeDrivers || 0} Active</div>
                  </div>
                </div>
                <div className="quick-action-item" onClick={() => setActiveMenu('map')}>
                  <span className="quick-action-icon">🗺️</span>
                  <div className="quick-action-text">
                    <div className="quick-action-label">View Live Map</div>
                    <div className="quick-action-value">Track Deliveries</div>
                  </div>
                </div>
                <div className="quick-action-item" onClick={() => setActiveMenu('restaurants')}>
                  <span className="quick-action-icon">🏪</span>
                  <div className="quick-action-text">
                    <div className="quick-action-label">Manage Restaurants</div>
                    <div className="quick-action-value">View All</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* ✅ Sidebar header with toggle button inside */}
        <div className="sidebar-header">
          <div className="sidebar-header-left">
            <img src="/Assets/icon.png" alt="Deliver Now" className="sidebar-logo-img" />
            {sidebarOpen && <h1 className="sidebar-title">Deliver Now</h1>}
          </div>
          
          {/* ✅ Small toggle button in top-right corner */}
          <button 
            className="sidebar-toggle-btn"
            onClick={toggleSidebar} 
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <span className="toggle-icon">{sidebarOpen ? '‹' : '›'}</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeMenu === 'control' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('control')}
            title="Control Center"
          >
            <span className="nav-icon">🎛️</span>
            {sidebarOpen && <span>Control</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('dashboard')}
            title="Dashboard"
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span>Dashboard</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'orders' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('orders')}
            title="Orders"
          >
            <span className="nav-icon">📋</span>
            {sidebarOpen && <span>Orders</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'drivers' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('drivers')}
            title="Drivers"
          >
            <span className="nav-icon">🚗</span>
            {sidebarOpen && <span>Drivers</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'pending' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('pending')}
            title="Pending Documents"
          >
            <span className="nav-icon">📄</span>
            {sidebarOpen && <span>Pending Documents</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'customers' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('customers')}
            title="Customers"
          >
            <span className="nav-icon">👥</span>
            {sidebarOpen && <span>Customers</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'deliveries' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('deliveries')}
            title="Deliveries"
          >
            <span className="nav-icon">📦</span>
            {sidebarOpen && <span>Deliveries</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'map' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('map')}
            title="Live Map"
          >
            <span className="nav-icon">🗺️</span>
            {sidebarOpen && <span>Live Map</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'payments' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('payments')}
            title="Payments"
          >
            <span className="nav-icon">💳</span>
            {sidebarOpen && <span>Payments</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'restaurants' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('restaurants')}
            title="Restaurants"
          >
            <span className="nav-icon">🏪</span>
            {sidebarOpen && <span>Restaurants</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'ai' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('ai')}
            title="AI Insights"
          >
            <span className="nav-icon">🤖</span>
            {sidebarOpen && <span>AI Insights</span>}
          </div>
          <div 
            className={`nav-item ${activeMenu === 'settings' ? 'active' : ''}`} 
            onClick={() => setActiveMenu('settings')}
            title="Settings"
          >
            <span className="nav-icon">⚙️</span>
            {sidebarOpen && <span>Settings</span>}
          </div>
        </nav>
      </aside>

      <div className={`main-content ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <header className="top-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={toggleSidebar}>
              ☰
            </button>
            <h2 className="page-title">{getPageTitle()}</h2>
          </div>
          <div className="header-actions">
            <div className="country-selector">
              <span className="country-flag">🇿🇦</span>
              <span className="country-name">South Africa</span>
              <span className="country-dropdown">▼</span>
            </div>
            
            <div className="user-menu">
              <div className="user-avatar-container">
                <div className="user-avatar">
                  {getAdminInitials()}
                </div>
                <div className="avatar-status"></div>
              </div>
              <div className="user-info">
                <div className="user-name">{getAdminFullName()}</div>
                <div className="user-role">System Administrator</div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;