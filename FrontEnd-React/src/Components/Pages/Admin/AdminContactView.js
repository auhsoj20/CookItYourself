import React, { useState, useEffect } from 'react';
import './AdminContactView.css';

// API Base URL Konfiguration - hier einfach änderbar
const API_BASE_URL = 'http://192.168.10.50:8000';

function AdminContactView() {
    const [contactRequests, setContactRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState('alle');

    // Kontaktanfragen laden
    const loadContactRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/contact-requests`);
            if (response.ok) {
                const data = await response.json();
                setContactRequests(data);
            } else {
                console.error('Fehler beim Laden der Kontaktanfragen');
            }
        } catch (error) {
            console.error('Fehler:', error);
        } finally {
            setLoading(false);
        }
    };

    // Status einer Anfrage ändern
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
                // Liste neu laden
                loadContactRequests();
                // Falls aktuell ausgewählte Anfrage geändert wurde, Details aktualisieren
                if (selectedRequest && selectedRequest.id === requestId) {
                    setSelectedRequest({...selectedRequest, status: newStatus});
                }
            } else {
                // Fehler-Details anzeigen
                const errorData = await response.json();
                console.error('Fehler beim Aktualisieren:', errorData);
                alert(`Fehler: ${errorData.detail || 'Unbekannter Fehler'}`);
            }
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Status:', error);
            alert('Netzwerkfehler beim Aktualisieren des Status');
        }
    };

    // Gefilterte Anfragen basierend auf Status
    const filteredRequests = contactRequests.filter(request => {
        if (filterStatus === 'alle') return true;
        return request.status === filterStatus;
    });

    // Status-Farben
    const getStatusColor = (status) => {
        switch (status) {
            case 'neu': return '#e74c3c';
            case 'in_bearbeitung': return '#f39c12';
            case 'abgeschlossen': return '#27ae60';
            default: return '#95a5a6';
        }
    };

    // Status-Labels
    const getStatusLabel = (status) => {
        switch (status) {
            case 'neu': return 'Neu';
            case 'in_bearbeitung': return 'In Bearbeitung';
            case 'abgeschlossen': return 'Abgeschlossen';
            default: return status;
        }
    };

    useEffect(() => {
        loadContactRequests();
    }, []);

    if (loading) {
        return <div className="admin-loading">Lade Kontaktanfragen...</div>;
    }

    return (
        <div className="admin-contact-container">
            <div className="admin-header">
                <h1>Kontaktanfragen Verwaltung</h1>
                <div className="admin-stats">
                    <div className="stat-item">
                        <span className="stat-number">{contactRequests.length}</span>
                        <span className="stat-label">Gesamt</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#e74c3c'}}>
                            {contactRequests.filter(r => r.status === 'neu').length}
                        </span>
                        <span className="stat-label">Neue</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#f39c12'}}>
                            {contactRequests.filter(r => r.status === 'in_bearbeitung').length}
                        </span>
                        <span className="stat-label">In Bearbeitung</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number" style={{color: '#27ae60'}}>
                            {contactRequests.filter(r => r.status === 'abgeschlossen').length}
                        </span>
                        <span className="stat-label">Abgeschlossen</span>
                    </div>
                </div>
            </div>

            <div className="admin-controls">
                <label>
                    Filter nach Status:
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="alle">Alle anzeigen</option>
                        <option value="neu">Neu</option>
                        <option value="in_bearbeitung">In Bearbeitung</option>
                        <option value="abgeschlossen">Abgeschlossen</option>
                    </select>
                </label>
                <button onClick={loadContactRequests} className="refresh-btn">
                    🔄 Aktualisieren
                </button>
            </div>

            <div className="admin-content">
                <div className="requests-list">
                    <h3>Anfragen ({filteredRequests.length})</h3>
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
                        <div className="no-requests">Keine Anfragen gefunden.</div>
                    )}
                </div>

                {selectedRequest && (
                    <div className="request-details">
                        <div className="details-header">
                            <h3>Anfrage Details</h3>
                            <div className="status-controls">
                                <label>Status ändern:</label>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'neu')}
                                    className={selectedRequest.status === 'neu' ? 'active' : ''}
                                >
                                    Neu
                                </button>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'in_bearbeitung')}
                                    className={selectedRequest.status === 'in_bearbeitung' ? 'active' : ''}
                                >
                                    In Bearbeitung
                                </button>
                                <button 
                                    onClick={() => updateStatus(selectedRequest.id, 'abgeschlossen')}
                                    className={selectedRequest.status === 'abgeschlossen' ? 'active' : ''}
                                >
                                    Abgeschlossen
                                </button>
                            </div>
                        </div>

                        <div className="details-content">
                            <div className="detail-row">
                                <strong>ID:</strong> {selectedRequest.id}
                            </div>
                            <div className="detail-row">
                                <strong>Name:</strong> {selectedRequest.name}
                            </div>
                            <div className="detail-row">
                                <strong>E-Mail:</strong> 
                                <a href={`mailto:${selectedRequest.email}`}>{selectedRequest.email}</a>
                            </div>
                            <div className="detail-row">
                                <strong>Betreff:</strong> {selectedRequest.subject}
                            </div>
                            <div className="detail-row">
                                <strong>Eingegangen am:</strong> {selectedRequest.created_at}
                            </div>
                            <div className="detail-row">
                                <strong>Status:</strong> 
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
                                <strong>Nachricht:</strong>
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