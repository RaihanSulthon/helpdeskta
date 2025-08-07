// Helper function to get file icon based on type or name
function getFileIcon(fileType = '', fileName = '') {
  const type = (fileType || fileName || '').toLowerCase();
  if (type.match(/pdf/)) return '📄';
  if (type.match(/word|docx?/)) return '📝';
  if (type.match(/excel|xlsx?/)) return '📊';
  if (type.match(/zip|rar/)) return '🗜️';
  if (type.match(/png|jpg|jpeg/)) return '🖼️';
  return '📎';
}
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getTicketDetailAPI,
  getChatMessagesAPI,
} from '../services/api';

// Helper function to format date string
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  // Format: 07 Aug 2025 10:51
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const TicketExport = () => {
  const { ticketId } = useParams();
  const [ticketData, setTicketData] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const ticket = await getTicketDetailAPI(ticketId);
        setTicketData(ticket);
        const chat = await getChatMessagesAPI(ticketId);
        // Debug log untuk melihat struktur response
        console.log('Chat API response:', chat);
        // Coba ambil data chat dari beberapa kemungkinan struktur
        let chatArr = [];
        if (Array.isArray(chat)) {
          chatArr = chat;
        } else if (Array.isArray(chat.messages)) {
          chatArr = chat.messages;
        } else if (Array.isArray(chat.data)) {
          chatArr = chat.data;
        } else if (Array.isArray(chat.chats)) {
          chatArr = chat.chats;
        }
        setChatHistory(chatArr);
      } catch (err) {
        setError('Gagal memuat data tiket');
      } finally {
        setLoading(false);
      }
    };
    if (ticketId) fetchData();
  }, [ticketId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{padding: 40}}>Memuat...</div>;
  if (error) return <div style={{padding: 40, color: 'red'}}>{error}</div>;
  if (!ticketData) return <div style={{padding: 40}}>Data tiket tidak ditemukan</div>;

  return (
    <div className="ticket-export-print" style={{background: '#fff', color: '#222', maxWidth: 800, margin: '40px auto', boxShadow: '0 0 8px #eee', padding: 32, borderRadius: 12}}>
      <div className="print-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32}}>
        <h1 style={{fontSize: 28, fontWeight: 700}}>Export Tiket #{ticketData.id}</h1>
        <button onClick={handlePrint} style={{padding: '8px 20px', fontSize: 16, background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', printColorAdjust: 'exact'}} className="no-print">Export</button>
      </div>
      <div style={{marginBottom: 24}}>
        <table style={{width: '100%', fontSize: 16, borderCollapse: 'collapse'}}>
          <tbody>
            <tr><td style={{fontWeight: 600, width: 160}}>Judul</td><td>{ticketData.judul || ticketData.title}</td></tr>
            <tr><td style={{fontWeight: 600}}>Status</td><td>{ticketData.status}</td></tr>
            <tr><td style={{fontWeight: 600}}>Pelapor</td><td>{ticketData.anonymous ? 'Anonim' : (ticketData.nama || ticketData.name)}</td></tr>
            <tr><td style={{fontWeight: 600}}>Email</td><td>{ticketData.email}</td></tr>
            <tr><td style={{fontWeight: 600}}>Tanggal</td><td>{ticketData.created_at}</td></tr>
            <tr><td style={{fontWeight: 600}}>Kategori</td><td>{ticketData.category?.name || '-'}</td></tr>
            <tr><td style={{fontWeight: 600}}>Sub Kategori</td><td>{ticketData.sub_category?.name || '-'}</td></tr>
            <tr><td style={{fontWeight: 600}}>NIM</td><td>{ticketData.nim || '-'}</td></tr>
            <tr><td style={{fontWeight: 600}}>Prodi</td><td>{ticketData.prodi || '-'}</td></tr>
            <tr><td style={{fontWeight: 600}}>Semester</td><td>{ticketData.semester || '-'}</td></tr>
            <tr><td style={{fontWeight: 600}}>No HP</td><td>{ticketData.no_hp || '-'}</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{marginBottom: 24}}>
        <h2 style={{fontSize: 20, fontWeight: 600, marginBottom: 12}}>Deskripsi Laporan</h2>
        <div style={{background: '#f9fafb', padding: 16, borderRadius: 8, fontSize: 16}}>{ticketData.deskripsi || ticketData.description}</div>
        {ticketData.attachments && Array.isArray(ticketData.attachments) && ticketData.attachments.length > 0 && (
          <div style={{marginTop: 12, fontSize: 15, color: '#555'}}>
            <span style={{color: '#888'}}>Lampiran Tiket:</span>
            <ul style={{margin: '4px 0 0 0', padding: 0, listStyle: 'none'}}>
              {ticketData.attachments.map((att, i) => {
                const fileUrl = att.url || att.file_url || '';
                const fileName = att.name || att.file_name || fileUrl.split('/').pop();
                const fileType = att.type || att.mime_type || fileName;
                const isImage = fileUrl.match(/\.(jpg|jpeg|png)$/i);
                return (
                  <li key={i} style={{marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10}}>
                    {isImage ? (
                      <img src={fileUrl} alt={fileName} style={{maxWidth: 120, maxHeight: 80, borderRadius: 6, border: '1px solid #eee', marginRight: 8}} />
                    ) : (
                      <span style={{fontSize: 22, marginRight: 6}}>{getFileIcon(fileType, fileName)}</span>
                    )}
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'underline', fontWeight: 500}}>
                      {fileName}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div>
        <h2 style={{fontSize: 20, fontWeight: 600, marginBottom: 12}}>Riwayat Chat/Feedback</h2>
        <table style={{width: '100%', fontSize: 15, borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#f3f4f6'}}>
              <th style={{padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left'}}>Pengirim</th>
              <th style={{padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left'}}>Waktu</th>
              <th style={{padding: 8, borderBottom: '1px solid #e5e7eb', textAlign: 'left'}}>Pesan</th>
            </tr>
          </thead>
          <tbody>
              {Array.isArray(chatHistory) && chatHistory.length > 0 ? (
                chatHistory.map((msg, idx) => {
                  // Extract sender info from msg.user object if available
                  const senderName = msg.user?.name || '-';
                  const senderRole = msg.user?.role || '-';
                  const senderEmail = msg.user?.email || '-';
                  return (
                    <tr key={msg.id || idx} style={{borderBottom: '1px solid #f3f4f6'}}>
                      <td style={{padding: 8, fontWeight: 500}}>
                        Pengirim: {senderName} <span style={{fontWeight: 'normal', color: '#888'}}>({senderRole})</span>
                        <div style={{fontSize: '0.95em', color: '#555', marginBottom: '0.2em'}}>
                          Email: <span style={{color: '#888'}}>{senderEmail}</span>
                        </div>
                      </td>
                      <td style={{padding: 8}}>{formatDate(msg.created_at)}</td>
                      <td style={{padding: 8}}>
                        {msg.message || msg.text || '-'}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div style={{marginTop: 6, fontSize: '0.95em', color: '#555'}}>
                            <span style={{color: '#888'}}>Lampiran:</span>
                            <ul style={{margin: '4px 0 0 0', padding: 0, listStyle: 'none'}}>
                              {msg.attachments.map((att, i) => {
                                const fileUrl = att.url || att.file_url || '';
                                const fileName = att.name || att.file_name || fileUrl.split('/').pop();
                                const fileType = att.type || att.mime_type || fileName;
                                const isImage = fileUrl.match(/\.(jpg|jpeg|png)$/i);
                                return (
                                  <li key={i} style={{marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8}}>
                                    {isImage ? (
                                      <img src={fileUrl} alt={fileName} style={{maxWidth: 90, maxHeight: 60, borderRadius: 6, border: '1px solid #eee', marginRight: 6}} />
                                    ) : (
                                      <span style={{fontSize: 20, marginRight: 5}}>{getFileIcon(fileType, fileName)}</span>
                                    )}
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'underline', fontWeight: 500}}>
                                      {fileName}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={3} style={{padding: 16, textAlign: 'center', color: '#888'}}>Belum ada chat/feedback</td></tr>
              )}
          </tbody>
        </table>
      </div>
      {/* Print CSS */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          .ticket-export-print { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketExport;
