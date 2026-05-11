import { useState, useEffect } from 'react';
import { qrCodeService, QRCode } from '../services/qrCodeService';
import { studentService, Student } from '../services/studentService';
import { QrCode, Clock, CheckCircle, AlertTriangle, Download, Smartphone } from 'lucide-react';

export default function QRCodeGenerator() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [expiryHours, setExpiryHours] = useState(24);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [qrData, studentData] = await Promise.all([
        qrCodeService.getUserQRCodes('current-user-id'), // This should come from auth context
        studentService.getAllStudents()
      ]);
      setQrCodes(qrData);
      setStudents(studentData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + Number(expiryHours));

      await qrCodeService.generateQRCode({
        user_id: 'current-user-id', // This should come from auth context
        student_id: selectedStudent,
        expires_at: expiresAt.toISOString()
      });

      await loadData();
      setSelectedStudent('');
      setError('QR Code generated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = (qrCode: QRCode) => {
    // Create QR code image URL (you'll need QR code library)
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode.code)}`;
    
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `qr-code-${qrCode.code}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (qrCode: QRCode) => {
    if (qrCode.last_used_at) {
      return { color: 'bg-gray-100 text-gray-800', text: 'Used', icon: CheckCircle };
    }
    
    const isExpired = qrCode.expires_at && new Date(qrCode.expires_at) < new Date();
    if (isExpired) {
      return { color: 'bg-red-100 text-red-800', text: 'Expired', icon: AlertTriangle };
    }
    
    return { color: 'bg-green-100 text-green-800', text: 'Active', icon: CheckCircle };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
          <p className="text-gray-600 text-sm mt-1">Generate pickup authorization codes for your students</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`p-4 rounded-lg border ${
          error.includes('successfully') 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {error}
        </div>
      )}

      {/* Generate New QR Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New QR Code</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name} - {student.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Hours
            </label>
            <select
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1">1 Hour</option>
              <option value="6">6 Hours</option>
              <option value="12">12 Hours</option>
              <option value="24">24 Hours</option>
              <option value="48">48 Hours</option>
              <option value="72">3 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateQR}
              disabled={generating || !selectedStudent}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-4 h-4" />
                  Generate QR Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Existing QR Codes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your QR Codes</h3>
        </div>
        
        {qrCodes.length === 0 ? (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No QR codes generated yet</p>
            <p className="text-gray-400 text-sm mt-2">Generate your first pickup authorization code above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {qrCodes.map((qrCode) => {
              const status = getStatusBadge(qrCode);
              const StatusIcon = status.icon;
              
              return (
                <div key={qrCode.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <QrCode className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Pickup Authorization</h4>
                          <p className="text-sm text-gray-500">
                            {qrCode.student_name || 'Student'} • {qrCode.grade || 'Grade'}
                          </p>
                          {qrCode.class_name && (
                            <p className="text-xs text-gray-400">Class: {qrCode.class_name}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created: {new Date(qrCode.created_at).toLocaleDateString()}
                        </div>
                        {qrCode.expires_at && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Expires: {new Date(qrCode.expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.text}
                      </span>
                      
                      {qrCode.is_active && !qrCode.last_used_at && (
                        <>
                          <button
                            onClick={() => downloadQRCode(qrCode)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download QR Code"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                            title="Show on Phone"
                          >
                            <Smartphone className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
