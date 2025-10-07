import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './AdminContactView.css';

const API_BASE_URL = 'http://192.168.10.50:8000';

function AdminContactView() {
    const { t } = useTranslation();
    const [contactRequests, setContactRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState('alle');

    const loadContactRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact-requests`);
            if (response.ok) {
                const data = await response.json();
                setContactRequests(data);
            } else {
                console.error(t('admin.errors.loadError'));
            }
        } catch (error) {
            console.error(t('admin.errors.error'), error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (requestId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact-requests/${requestId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                loadContactRequests();
                if (selectedRequest && selectedRequest.id === requestId) {
                    setSelectedRequest({...selectedRequest, status: newStatus});
                }
            } else {
                const errorData = await response.json();
                console.error(t('admin.errors.updateError'), errorData);
                alert(`${t('admin.errors.error')}: ${errorData.detail || t('admin.errors.unknownError')}`);
            }
        } catch (error) {
            console.error(t('admin.errors.updateStatusError'), error);
            alert(t('admin.errors.networkError'));
        }
    };

    const filteredRequests = contactRequests.filter(request => {
        if (filterStatus === 'alle') return true;
        return request.status === filterStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'neu': return '#e74c3c';
            case 'in_bearbeitung': return '#f39c12';
            case 'abgeschlossen': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    const getStatusLabel = (status) => {
        return t(`admin.status.${status}`, status);
    };

    useEffect(() => {
        loadContactRequests();
    }, []);

    if (loading) {
        return <div className="admin-loading">{t('admin.loading')}</div>;
    }

    return (
        <div className="admin-contact-container">
            <div className="admin-header">
                <h1>{t('admin.title')}</h1>
                <div className="admin-stats">
                    <div className="stat-item">
                        <span className="stat-number">{contactRequests.length}</span>
                        <span className="stat-label">{t('admin.stats.total')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#e74c3c'}}>
                            {contactRequests.filter(r => r.status === 'neu').length}
                        </span>
                        <span className="stat-label">{t('admin.stats.new')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#f39c12'}}>
                            {contactRequests.filter(r => r.status === 'in_bearbeitung').length}
                        </span>
                        <span className="stat-label">{t('admin.stats.inProgress')}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#27ae60'}}>
                            {contactRequests.filter(r => r.status === 'abgeschlossen').length}
                        </span>
                        <span className="stat-label">{t('admin.stats.completed')}</span>
                    </div>
                </div>
            </div>

            <div className="admin-controls">
                <label>
                    {t('admin.filter.label')}
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="alle">{t('admin.filter.all')}</option>
                        <option value="neu">{t('admin.status.neu')}</option>
                        <option value="in_bearbeitung">{t('admin.status.in_bearbeitung')}</option>
                        <option value="abgeschlossen">{t('admin.status.abgeschlossen')}</option>
                    </select>
                </label>
                <button onClick={loadContactRequests} className="refresh-btn">
                    🔄 {t('admin.buttons.refresh')}
                </button>
            </div>

            <div className="admin-content">
                <div className="requests-list">
                    <h3>{t('admin.requestsList.title', { count: filteredRequests.length })}</h3>
                    {filteredRequests.map(request => (
                        <div 
                            key={request.id} 
                            className={`request-item ${selectedRequest?.id === request.id ? 'selected' : ''}`}
                            onClick={() => setSelectedRequest(request)}
                        >
                            <div className="request-header">
                                <span className="request-name">{request.name}</span>
                                <span 
                                    className="request-status" 
                                    style={{backgroundColor: getStatusColor(request.status)}}
                                >
                                    {getStatusLabel(request.status)}
                                </span>
                            </div>
                            <div className="request-subject">{request.subject}</div>
                            <div className="request-date">{request.created_at}</div>
                        </div>
                    ))}
                    {filteredRequests.length === 0 && (
                        <div className="no-requests">{t('admin.requestsList.noRequests')}</div>
                    )}
                </div>

                {selectedRequest && (
                    <div className="request-details">
                        <div className="details-header">
                            <h3>{t('admin.details.title')}</h3>
                            <div className="status-controls">
                                <label>{t('admin.details.changeStatus')}</label>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'neu')}
                                    className={selectedRequest.status === 'neu' ? 'active' : ''}
                                >
                                    {t('admin.status.neu')}
                                </button>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'in_bearbeitung')}
                                    className={selectedRequest.status === 'in_bearbeitung' ? 'active' : ''}
                                >
                                    {t('admin.status.in_bearbeitung')}
                                </button>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'abgeschlossen')}
                                    className={selectedRequest.status === 'abgeschlossen' ? 'active' : ''}
                                >
                                    {t('admin.status.abgeschlossen')}
                                </button>
                            </div>
                        </div>

                        <div className="details-content">
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.id')}:</strong> {selectedRequest.id}
                            </div>
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.name')}:</strong> {selectedRequest.name}
                            </div>
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.email')}:</strong> 
                                <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a>
                            </div>
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.subject')}:</strong> {selectedRequest.subject}
                            </div>
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.createdAt')}:</strong> {selectedRequest.created_at}
                            </div>
                            <div className="detail-row">
                                <strong>{t('admin.details.fields.status')}:</strong> 
                                <span 
                                    style={{
                                        color: getStatusColor(selectedRequest.status),
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {getStatusLabel(selectedRequest.status)}
                                </span>
                            </div>
                            <div className="detail-row message-row">
                                <strong>{t('admin.details.fields.message')}:</strong>
                                <div className="message-content">{selectedRequest.message}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminContactView;