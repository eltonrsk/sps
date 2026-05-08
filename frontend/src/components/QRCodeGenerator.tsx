import { useState, useEffect } from 'react';
import { qrCodeService, QRCode } from '../services/qrCodeService';
import { studentService, Student } from '../services/studentService';

import {
  QrCode,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Smartphone,
  Loader2,
  Sparkles,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react';

export default function QRCodeGenerator() {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState('');

  const [expiryHours, setExpiryHours] =
    useState(24);

  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [qrData, studentData] =
        await Promise.all([
          qrCodeService.getUserQRCodes(
            'current-user-id'
          ),
          studentService.getAllStudents(),
        ]);

      setQrCodes(qrData);
      setStudents(studentData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load data'
      );
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

      expiresAt.setHours(
        expiresAt.getHours() +
          Number(expiryHours)
      );

      await qrCodeService.generateQRCode({
        user_id: 'current-user-id',
        student_id: selectedStudent,
        expires_at: expiresAt.toISOString(),
      });

      await loadData();

      setSelectedStudent('');

      setError(
        'QR Code generated successfully!'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate QR code'
      );
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = (
    qrCode: QRCode
  ) => {
    const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      qrCode.code
    )}`;

    const link =
      document.createElement('a');

    link.href = qrDataUrl;

    link.download = `qr-code-${qrCode.code}.png`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  };

  const getStatusBadge = (
    qrCode: QRCode
  ) => {
    if (qrCode.last_used_at) {
      return {
        color:
          'bg-gray-100 text-gray-700 border-gray-200',
        text: 'Used',
        icon: CheckCircle,
      };
    }

    const isExpired =
      qrCode.expires_at &&
      new Date(qrCode.expires_at) <
        new Date();

    if (isExpired) {
      return {
        color:
          'bg-red-100 text-red-700 border-red-200',
        text: 'Expired',
        icon: AlertTriangle,
      };
    }

    return {
      color:
        'bg-green-100 text-green-700 border-green-200',
      text: 'Active',
      icon: ShieldCheck,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />

          <p className="text-gray-500 text-sm">
            Loading QR Codes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-90px)] flex flex-col overflow-hidden bg-gray-50">
      {/* HEADER */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <QrCode className="w-7 h-7 text-blue-600" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  QR Code Generator
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Generate secure pickup
                  authorization QR codes
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
            <Sparkles className="w-5 h-5 text-yellow-500" />

            <span className="text-sm font-medium text-gray-700">
              Smart & Secure Pickup
              System
            </span>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
        {/* ALERT */}
        {error && (
          <div
            className={`rounded-2xl border p-4 shadow-sm ${
              error.includes('successfully')
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {error.includes(
                'successfully'
              ) ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}

              <span className="font-medium">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* GENERATE CARD */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Generate New QR Code
              </h3>

              <p className="text-sm text-gray-500">
                Create secure pickup
                authorization
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* STUDENT */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Student
              </label>

              <select
                value={selectedStudent}
                onChange={(e) =>
                  setSelectedStudent(
                    e.target.value
                  )
                }
                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">
                  Choose Student...
                </option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.first_name}{' '}
                    {student.last_name} •{' '}
                    {student.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* EXPIRY */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Expiry Time
              </label>

              <select
                value={expiryHours}
                onChange={(e) =>
                  setExpiryHours(
                    Number(e.target.value)
                  )
                }
                className="w-full h-12 px-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              >
                <option value="1">
                  1 Hour
                </option>

                <option value="6">
                  6 Hours
                </option>

                <option value="12">
                  12 Hours
                </option>

                <option value="24">
                  24 Hours
                </option>

                <option value="48">
                  48 Hours
                </option>

                <option value="72">
                  3 Days
                </option>
              </select>
            </div>

            {/* BUTTON */}
            <div className="flex items-end">
              <button
                onClick={handleGenerateQR}
                disabled={
                  generating ||
                  !selectedStudent
                }
                className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" />
                    Generate QR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* QR CODES LIST */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Your QR Codes
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Manage generated pickup
                authorization codes
              </p>
            </div>

            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
              {qrCodes.length} Codes
            </div>
          </div>

          {qrCodes.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
                <QrCode className="w-10 h-10 text-gray-400" />
              </div>

              <h3 className="text-lg font-semibold text-gray-700">
                No QR Codes Yet
              </h3>

              <p className="text-gray-500 text-sm mt-2">
                Generate your first pickup
                QR code above
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {qrCodes.map((qrCode) => {
                const status =
                  getStatusBadge(qrCode);

                const StatusIcon =
                  status.icon;

                return (
                  <div
                    key={qrCode.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                      {/* LEFT */}
                      <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-gray-700" />
                        </div>

                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Pickup Authorization
                          </h4>

                          <p className="text-sm text-gray-500 mt-1">
                            {qrCode.student_name ||
                              'Student'}{' '}
                            •{' '}
                            {qrCode.grade ||
                              'Grade'}
                          </p>

                          {qrCode.class_name && (
                            <p className="text-xs text-gray-400 mt-1">
                              Class:{' '}
                              {
                                qrCode.class_name
                              }
                            </p>
                          )}

                          <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <CalendarClock className="w-3 h-3" />

                              Created:{' '}
                              {new Date(
                                qrCode.created_at
                              ).toLocaleDateString()}
                            </div>

                            {qrCode.expires_at && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />

                                Expires:{' '}
                                {new Date(
                                  qrCode.expires_at
                                ).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT */}
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />

                          {status.text}
                        </span>

                        {qrCode.is_active &&
                          !qrCode.last_used_at && (
                            <>
                              <button
                                onClick={() =>
                                  downloadQRCode(
                                    qrCode
                                  )
                                }
                                className="w-11 h-11 rounded-xl border border-blue-200 text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center"
                              >
                                <Download className="w-5 h-5" />
                              </button>

                              <button className="w-11 h-11 rounded-xl border border-green-100 text-green-200 hover:bg-green-50 transition-all flex items-center justify-center">
                                <Smartphone className="w-5 h-5" />
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
    </div>
  );
}