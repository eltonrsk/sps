import { useState, useEffect } from 'react';
import { 
  qrCodeService, 
  QRCode 
} from '../services/qrCodeService';

import { 
  QrCode,
  Plus,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Clock3,
  Trash2,
  Sparkles,
  User,
  CalendarDays,
  RefreshCcw
} from 'lucide-react';

import { Student } from '../services/studentService';

export default function QRCodeDisplay({
  userId,
  students = []
}: {
  userId: string;
  students?: Student[];
}) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    loadQRCodes();
  }, [userId]);

  const loadQRCodes = async () => {
    try {
      setLoading(true);

      const codes = await qrCodeService.getUserQRCodes(
        userId,
        false
      );

      setQrCodes(codes);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await qrCodeService.generateQRCode({
        user_id: userId,
        student_id: selectedStudent || undefined,
        expires_at: expiresAt.toISOString(),
      });

      await loadQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);

    setCopied(code);

    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const downloadQRCode = (code: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(code)}`;

    const link = document.createElement('a');

    link.href = qrUrl;
    link.download = `qr-code-${code.substring(0, 8)}.png`;

    link.click();
  };

  const deactivateQRCode = async (codeId: string) => {
    try {
      await qrCodeService.deactivateQRCode(codeId);
      await loadQRCodes();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
    }
  };

  const getStudentName = (studentId?: string) => {
    if (!studentId) return 'Any Student';

    const student = students.find((s) => s.id === studentId);

    if (!student) return 'Unknown Student';

    return `${student.first_name} ${student.last_name}`;
  };

  if (loading && qrCodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm">
            Loading QR Codes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  My QR Codes
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  Secure pickup verification system
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={loadQRCodes}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>

            <div className="flex gap-3">
              <select
                value={selectedStudent}
                onChange={(e) =>
                  setSelectedStudent(e.target.value)
                }
                className="px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  Any linked student
                </option>

                {students.map((student) => (
                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.first_name} {student.last_name} (
                    {student.grade})
                  </option>
                ))}
              </select>

              <button
                onClick={generateQRCode}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:scale-[1.02] hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Generate QR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total QR Codes
              </p>

              <h3 className="text-3xl font-bold text-gray-900 mt-1">
                {qrCodes.length}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Active Codes
              </p>

              <h3 className="text-3xl font-bold text-green-600 mt-1">
                {qrCodes.filter((q) => q.is_active).length}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Student Linked
              </p>

              <h3 className="text-3xl font-bold text-purple-600 mt-1">
                {students.length}
              </h3>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <User className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {qrCodes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-12 h-12 text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No QR Codes Yet
            </h3>

            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Generate your first QR code to allow
              secure and fast student pickup
              verification.
            </p>

            <button
              onClick={generateQRCode}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Create First QR Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-6">
            {qrCodes.map((qr) => {
              const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                qr.code
              )}`;

              return (
                <div
                  key={qr.id}
                  className="bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* TOP */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg text-gray-900">
                            Pickup QR
                          </h3>

                          {qr.is_active ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                              Inactive
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-500">
                          Secure student verification
                        </p>
                      </div>

                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                        <QrCode className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* QR IMAGE */}
                  <div className="p-6">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 flex justify-center mb-6">
                      <img
                        src={qrImageUrl}
                        alt="QR Code"
                        className="w-52 h-52 object-contain"
                      />
                    </div>

                    {/* INFO */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Student
                          </p>
                        </div>

                        <p className="font-semibold text-gray-900">
                          {getStudentName(qr.student_id)}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock3 className="w-4 h-4 text-gray-500" />
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Last Used
                          </p>
                        </div>

                        <p className="text-sm text-gray-700">
                          {qr.last_used_at
                            ? new Date(
                                qr.last_used_at
                              ).toLocaleString()
                            : 'Never used'}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-gray-500" />
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Created
                          </p>
                        </div>

                        <p className="text-sm text-gray-700">
                          {new Date(
                            qr.created_at
                          ).toLocaleString()}
                        </p>
                      </div>

                      {/* CODE */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">
                          QR Value
                        </label>

                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            value={qr.code}
                            readOnly
                            className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl bg-gray-50"
                          />

                          <button
                            onClick={() =>
                              copyToClipboard(qr.code)
                            }
                            className="w-12 h-12 rounded-xl border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-all"
                          >
                            {copied === qr.code ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() =>
                          downloadQRCode(qr.code)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>

                      {qr.is_active ? (
                        <button
                          onClick={() =>
                            deactivateQRCode(qr.id)
                          }
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-500 rounded-xl cursor-not-allowed"
                        >
                          Inactive
                        </button>
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