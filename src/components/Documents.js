import React, { useEffect, useState } from 'react';
import api from '../config/api';
import './Documents.css';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState({
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    expiringSoon: 0
  });

  useEffect(() => {
    fetchDocuments();
    fetchDocumentStats();
  }, []);

  useEffect(() => {
    filterDocumentsList();
  }, [searchTerm, filterStatus, filterType, documents]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/documents');
      
      if (response.data.success) {
        setDocuments(response.data.data);
        setFilteredDocuments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Set empty array when no data
      setDocuments([]);
      setFilteredDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentStats = async () => {
    try {
      const response = await api.get('/api/documents/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching document stats:', error);
      // Set to zero when no data
      setStats({
        pendingDocuments: 0,
        approvedDocuments: 0,
        rejectedDocuments: 0,
        expiringSoon: 0
      });
    }
  };

  const filterDocumentsList = () => {
    let filtered = [...documents];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.driverEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.documentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    // Document type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }

    setFilteredDocuments(filtered);
  };

  const handleApprove = async (documentId) => {
    if (!window.confirm('Are you sure you want to approve this document?')) {
      return;
    }

    try {
      const response = await api.put(`/api/documents/${documentId}/approve`);
      
      if (response.data.success) {
        alert('Document approved successfully!');
        fetchDocuments();
        fetchDocumentStats();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Failed to approve document. Please try again.');
    }
  };

  const handleReject = async (documentId) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    
    if (!reason) {
      return;
    }

    try {
      const response = await api.put(`/api/documents/${documentId}/reject`, {
        rejectionReason: reason
      });
      
      if (response.data.success) {
        alert('Document rejected successfully!');
        fetchDocuments();
        fetchDocumentStats();
        setShowDetails(false);
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      alert('Failed to reject document. Please try again.');
    }
  };

  const handleViewDetails = (document) => {
    setSelectedDocument(document);
    setShowDetails(true);
  };

  const handleDownload = (documentUrl, documentType) => {
    // Open document in new tab for download
    window.open(documentUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      case 'expired':
        return '#6b7280';
      default:
        return '#9ca3af';
    }
  };

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'license':
        return '🪪';
      case 'id':
        return '🆔';
      case 'proof_of_residence':
        return '🏠';
      default:
        return '📄';
    }
  };

  const getDocumentTypeName = (type) => {
    switch (type) {
      case 'license':
        return 'Driver\'s License';
      case 'id':
        return 'ID Document';
      case 'proof_of_residence':
        return 'Proof of Residence';
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  if (loading) {
    return (
      <div className="documents-loading">
        <div className="loading-spinner"></div>
        <p>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="documents-container">
      {/* Stats Cards */}
      <div className="documents-stats-grid">
        <div className="document-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            ⏳
          </div>
          <div className="stat-content">
            <div className="stat-label">Pending Review</div>
            <div className="stat-value">{stats.pendingDocuments}</div>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ✓
          </div>
          <div className="stat-content">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.approvedDocuments}</div>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
            ✕
          </div>
          <div className="stat-content">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{stats.rejectedDocuments}</div>
          </div>
        </div>

        <div className="document-stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #d946ef 0%, #c026d3 100%)' }}>
            ⚠️
          </div>
          <div className="stat-content">
            <div className="stat-label">Expiring Soon</div>
            <div className="stat-value">{stats.expiringSoon}</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="documents-controls">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by driver name, email, or document number..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Document Types</option>
            <option value="license">Driver's License</option>
            <option value="id">ID Document</option>
            <option value="proof_of_residence">Proof of Residence</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Document Type</th>
              <th>Document Number</th>
              <th>Upload Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="no-data-message">
                    <span className="no-data-icon">📄</span>
                    <p>No documents found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredDocuments.map((document) => (
                <tr key={document._id} className="document-row">
                  <td>
                    <div className="driver-cell">
                      <div className="driver-name">{document.driverName}</div>
                      <div className="driver-email">{document.driverEmail}</div>
                    </div>
                  </td>
                  <td>
                    <div className="document-type">
                      <span className="type-icon">{getDocumentTypeIcon(document.documentType)}</span>
                      <span className="type-text">{getDocumentTypeName(document.documentType)}</span>
                    </div>
                  </td>
                  <td className="document-number">{document.documentNumber || 'N/A'}</td>
                  <td className="date-cell">{formatDate(document.uploadDate)}</td>
                  <td className="date-cell">
                    {document.expiryDate ? (
                      <div>
                        {formatDate(document.expiryDate)}
                        {isExpiringSoon(document.expiryDate) && (
                          <span className="expiry-warning">⚠️ Expiring Soon</span>
                        )}
                        {isExpired(document.expiryDate) && (
                          <span className="expiry-danger">❌ Expired</span>
                        )}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(document.status) }}
                    >
                      {document.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetails(document)}
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

      {/* Document Details Modal */}
      {showDetails && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Document Details</h3>
              <button className="btn-close" onClick={() => setShowDetails(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Document Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Document Type:</span>
                    <span className="detail-value">
                      {getDocumentTypeIcon(selectedDocument.documentType)}{' '}
                      {getDocumentTypeName(selectedDocument.documentType)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Document Number:</span>
                    <span className="detail-value">{selectedDocument.documentNumber || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Upload Date:</span>
                    <span className="detail-value">{formatDate(selectedDocument.uploadDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Expiry Date:</span>
                    <span className="detail-value">{formatDate(selectedDocument.expiryDate)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span
                      className="status-badge"
                      style={{ background: getStatusColor(selectedDocument.status) }}
                    >
                      {selectedDocument.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Driver Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Name:</span>
                    <span className="detail-value">{selectedDocument.driverName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{selectedDocument.driverEmail}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{selectedDocument.driverPhone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedDocument.documentUrl && (
                <div className="detail-section">
                  <h4>Document Preview</h4>
                  <div className="document-preview">
                    {selectedDocument.documentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                      <img 
                        src={selectedDocument.documentUrl} 
                        alt={getDocumentTypeName(selectedDocument.documentType)}
                        className="preview-image"
                      />
                    ) : (
                      <div className="preview-placeholder">
                        <span className="preview-icon">📄</span>
                        <p>Preview not available</p>
                      </div>
                    )}
                  </div>
                  <button
                    className="btn-download"
                    onClick={() => handleDownload(selectedDocument.documentUrl, selectedDocument.documentType)}
                  >
                    📥 Download Document
                  </button>
                </div>
              )}

              {selectedDocument.rejectionReason && (
                <div className="detail-section">
                  <h4>Rejection Reason</h4>
                  <div className="rejection-reason">
                    {selectedDocument.rejectionReason}
                  </div>
                </div>
              )}

              {selectedDocument.status === 'pending' && (
                <div className="modal-actions">
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(selectedDocument._id)}
                  >
                    ✕ Reject Document
                  </button>
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(selectedDocument._id)}
                  >
                    ✓ Approve Document
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

export default Documents;