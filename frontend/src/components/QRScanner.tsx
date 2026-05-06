import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ScanLine, CheckCircle, XCircle, User } from 'lucide-react';

type ScanResult = {
  success: boolean;
  message: string;
  student?: {
    first_name: string;
    last_name: string;
    grade: string;
    class_name: string | null;
  };
  parent?: {
    full_name: string;
  };
};

export default function QRScanner({
  onPickupComplete,
  securityUserId
}: {
  onPickupComplete: () => void;
  securityUserId: string;
}) {
  const [scanInput, setScanInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [studentToConfirm, setStudentToConfirm] = useState<{
    qrCodeId: string;
    studentId: string;
    parentId: string;
    student: ScanResult['student'];
    parent: ScanResult['parent'];
  } | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setScanning(true);
    setResult(null);
    setStudentToConfirm(null);

    try {
      const { data: qrCode, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, user_id, student_id, is_active')
        .eq('code', scanInput.trim())
        .maybeSingle();

      if (qrError) throw qrError;

      if (!qrCode) {
        setResult({
          success: false,
          message: 'Invalid QR code. Please try again.',
        });
        return;
      }

      if (!qrCode.is_active) {
        setResult({
          success: false,
          message: 'This QR code has been deactivated.',
        });
        return;
      }

      const { data: parent, error: parentError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', qrCode.user_id)
        .maybeSingle();

      if (parentError) throw parentError;

      if (qrCode.student_id) {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('id, first_name, last_name, grade, class_name')
          .eq('id', qrCode.student_id)
          .maybeSingle();

        if (studentError) throw studentError;

        if (student) {
          setStudentToConfirm({
            qrCodeId: qrCode.id,
            studentId: student.id,
            parentId: qrCode.user_id,
            student: {
              first_name: student.first_name,
              last_name: student.last_name,
              grade: student.grade,
              class_name: student.class_name,
            },
            parent: {
              full_name: parent?.full_name || 'Unknown',
            },
          });
        }
      } else {
        const { data: guardians, error: guardiansError } = await supabase
          .from('guardians')
          .select('student_id, students(id, first_name, last_name, grade, class_name)')
          .eq('user_id', qrCode.user_id)
          .eq('is_authorized', true);

        if (guardiansError) throw guardiansError;

        if (guardians && guardians.length > 0) {
          const student = (guardians[0] as { students: { id: string; first_name: string; last_name: string; grade: string; class_name: string | null } }).students;
          setStudentToConfirm({
            qrCodeId: qrCode.id,
            studentId: student.id,
            parentId: qrCode.user_id,
            student: {
              first_name: student.first_name,
              last_name: student.last_name,
              grade: student.grade,
              class_name: student.class_name,
            },
            parent: {
              full_name: parent?.full_name || 'Unknown',
            },
          });
        }
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      setResult({
        success: false,
        message: 'Error processing QR code. Please try again.',
      });
    } finally {
      setScanning(false);
      setScanInput('');
    }
  };

  const confirmPickup = async () => {
    if (!studentToConfirm) return;

    setScanning(true);
    try {
      const { error } = await supabase.from('pickups').insert({
        student_id: studentToConfirm.studentId,
        picked_by_user_id: studentToConfirm.parentId,
        verified_by_user_id: securityUserId,
        qr_code_id: studentToConfirm.qrCodeId,
        pickup_time: new Date().toISOString(),
      });

      if (error) throw error;

      await supabase
        .from('qr_codes')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', studentToConfirm.qrCodeId);

      await supabase.from('notifications').insert({
        user_id: studentToConfirm.parentId,
        title: 'Pickup Confirmed',
        message: `${studentToConfirm.student?.first_name} ${studentToConfirm.student?.last_name} has been picked up successfully.`,
        type: 'pickup_confirmation',
        is_read: false,
      });

      setResult({
        success: true,
        message: 'Pickup confirmed successfully!',
        student: studentToConfirm.student,
        parent: studentToConfirm.parent,
      });

      setStudentToConfirm(null);
      onPickupComplete();

      setTimeout(() => {
        setResult(null);
      }, 5000);
    } catch (error) {
      console.error('Error confirming pickup:', error);
      setResult({
        success: false,
        message: 'Error confirming pickup. Please try again.',
      });
    } finally {
      setScanning(false);
    }
  };

  const cancelConfirmation = () => {
    setStudentToConfirm(null);
    setScanInput('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code Scanner</h2>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label htmlFor="qr-input" className="block text-sm font-medium text-gray-700 mb-2">
              Scan or Enter QR Code
            </label>
            <input
              id="qr-input"
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter QR code or scan..."
              disabled={scanning || !!studentToConfirm}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={scanning || !scanInput.trim() || !!studentToConfirm}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ScanLine className={`w-5 h-5 ${scanning ? 'animate-pulse' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan QR Code'}
          </button>
        </form>
      </div>

      {studentToConfirm && (
        <div className="bg-blue-50 rounded-xl border-2 border-blue-500 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Verify Student Information
          </h3>

          <div className="bg-white rounded-lg p-4 space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Student:</span>
              <span className="font-semibold text-gray-900">
                {studentToConfirm.student?.first_name} {studentToConfirm.student?.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Grade:</span>
              <span className="font-medium text-gray-900">{studentToConfirm.student?.grade}</span>
            </div>
            {studentToConfirm.student?.class_name && (
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium text-gray-900">{studentToConfirm.student?.class_name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Parent/Guardian:</span>
              <span className="font-medium text-gray-900">{studentToConfirm.parent?.full_name}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={cancelConfirmation}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmPickup}
              disabled={scanning}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {scanning ? 'Confirming...' : 'Confirm Pickup'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div
          className={`rounded-xl p-6 border-2 ${
            result.success
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Success!' : 'Error'}
              </h3>
              <p
                className={`mb-3 ${
                  result.success ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {result.message}
              </p>
              {result.success && result.student && (
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="font-medium text-gray-900">
                    {result.student.first_name} {result.student.last_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Grade: {result.student.grade}
                    {result.student.class_name && ` | Class: ${result.student.class_name}`}
                  </div>
                  {result.parent && (
                    <div className="text-sm text-gray-600">
                      Picked by: {result.parent.full_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
