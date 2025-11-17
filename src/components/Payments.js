import React, { useEffect, useState } from 'react';
import api from '../config/api';
import './Payments.css';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    completedToday: 0,
    failedTransactions: 0
  });

  useEffect(() => {
    fetchPayments();
    fetchPaymentStats();
  }, []);

  useEffect(() => {
    filterPaymentsList();
  }, [searchTerm, filterStatus, filterMethod, payments]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/payments');
      
      if (response.data.success) {
        setPayments(response.data.data);
        setFilteredPayments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Set empty array when no data
      setPayments([]);
      setFilteredPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await api.get('/api/payments/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      // Set to zero when no data
      setStats({
        totalRevenue: 0,
        pendingAmount: 0,
        completedToday: 0,
        failedTransactions: 0
      });
    }
  };

  const filterPaymentsList = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Payment method filter
    if (filterMethod !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === filterMethod);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId) => {
    if (!window.confirm('Are you sure you want to process this refund?')) {
      return;
    }

    try {
      const response = await api.post(`/api/payments/${paymentId}/refund`);
      
      if (response.data.success) {
        alert('Refund processed successfully!');
        fetchPayments();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Failed to process refund. Please try again.');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'failed':
        return '#ef4444';
      case 'refunded':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return '💳';
      case 'cash':
        return '💵';
      case 'wallet':
        return '👛';
      case 'bank_transfer':
        return '🏦';
      default:
        return '💰';
    }
  };

  const formatCurrency = (amount) => {
    return `R ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Order ID', 'Customer', 'Amount', 'Status', 'Method', 'Date'];
    const csvData = filteredPayments.map(payment => [
      payment.transactionId,
      payment.orderId,
      payment.customerName,
      payment.amount,
      payment.status,
      payment.paymentMethod,
      formatDate(payment.date)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="payments-loading">
        <div className="loading-spinner"></div>
        <p>Loading payments...</p>
      </div>
    );
  }

  return (
    <div className="payments-container">
      {/* Stats Cards */}
      <div className="payments-stats-grid">
        <div className="payment-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            💰
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            ⏳
          </div>
          <div className="stat-content">
            <div className="stat-label">Pending Amount</div>
            <div className="stat-value">{formatCurrency(stats.pendingAmount)}</div>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)' }}>
            ✓
          </div>
          <div className="stat-content">
            <div className="stat-label">Completed Today</div>
            <div className="stat-value">{stats.completedToday}</div>
          </div>
        </div>

        <div className="payment-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            ✕
          </div>
          <div className="stat-content">
            <div className="stat-label">Failed Transactions</div>
            <div className="stat-value">{stats.failedTransactions}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="payments-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by Transaction ID, Order ID, Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Methods</option>
            <option value="card">Card</option>
            <option value="cash">Cash</option>
            <option value="wallet">Wallet</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>

          <button className="btn-export" onClick={exportToCSV}>
            📊 Export CSV
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="payments-table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  <div className="no-data-message">
                    <span className="no-data-icon">💳</span>
                    <p>No payments found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment._id} className="payment-row">
                  <td className="transaction-id">{payment.transactionId}</td>
                  <td>{payment.orderId}</td>
                  <td>
                    <div className="customer-cell">
                      <div className="customer-name">{payment.customerName}</div>
                      <div className="customer-email">{payment.customerEmail}</div>
                    </div>
                  </td>
                  <td className="amount-cell">{formatCurrency(payment.amount)}</td>
                  <td>
                    <div className="payment-method">
                      <span className="method-icon">{getPaymentMethodIcon(payment.paymentMethod)}</span>
                      <span className="method-text">
                        {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(payment.status) }}
                    >
                      {payment.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(payment.date)}</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(payment)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payment Details</h3>
              <button className="btn-close" onClick={() => setShowDetails(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Transaction Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID:</span>
                    <span className="detail-value">{selectedPayment.transactionId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Order ID:</span>
                    <span className="detail-value">{selectedPayment.orderId}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Amount:</span>
                    <span className="detail-value amount">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(selectedPayment.status) }}
                    >
                      {selectedPayment.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Payment Method:</span>
                    <span className="detail-value">
                      {getPaymentMethodIcon(selectedPayment.paymentMethod)}{' '}
                      {selectedPayment.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">{formatDate(selectedPayment.date)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Customer Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedPayment.customerName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedPayment.customerEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Restaurant:</span>
                    <span className="detail-value">{selectedPayment.restaurant}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Description:</span>
                    <span className="detail-value">{selectedPayment.description}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.status === 'completed' && (
                <div className="modal-actions">
                  <button
                    className="btn-refund"
                    onClick={() => handleRefund(selectedPayment._id)}
                  >
                    💸 Process Refund
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;