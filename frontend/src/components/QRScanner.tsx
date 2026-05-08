import { useState } from 'react';
import { qrCodeService } from '../services/qrCodeService';
import { pickupService } from '../services/pickupService';
import { userService } from '../services/userService';
import { studentService } from '../services/studentService';
import {
  ScanLine,
  CheckCircle,
  User,
  ShieldCheck,
  QrCode,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

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
  securityUserId,
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
      const validation = await qrCodeService.validateQRCode(
        scanInput.trim()
      );

      if (!validation.valid) {
        setResult({
          success: false,
          message:
            validation.error || 'Invalid QR Code. Please try again.',
        });

        return;
      }

      const qrCode = validation.qrCode;

      if (!qrCode) {
        setResult({
          success: false,
          message: 'QR Code not found.',
        });

        return;
      }

      if (!qrCode.is_active) {
        setResult({
          success: false,
          message: 'This QR Code has been deactivated.',
        });

        return;
      }

      let parent;

      try {
        parent = await userService.getUserById(qrCode.user_id);
      } catch (error) {
        console.error(error);
        parent = { full_name: 'Unknown Guardian' };
      }

      if (qrCode.student_id) {
        const student = await studentService.getStudentById(
          qrCode.student_id
        );

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
            full_name: parent?.full_name || 'Unknown Guardian',
          },
        });
      } else {
        const students =
          await studentService.getStudentsByGuardian(
            qrCode.user_id
          );

        if (students && students.length > 0) {
          const student = students[0];

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
              full_name: parent?.full_name || 'Unknown Guardian',
            },
          });
        } else {
          setResult({
            success: false,
            message:
              'No authorized students found for this guardian.',
          });
        }
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);

      setResult({
        success: false,
        message: 'Error processing QR Code.',
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
      await pickupService.createPickup({
        student_id: studentToConfirm.studentId,
        picked_by_user_id: studentToConfirm.parentId,
        verified_by_user_id: securityUserId,
        qr_code_id: studentToConfirm.qrCodeId,
        notes: undefined,
      });

      await qrCodeService.markQRCodeAsUsed(
        studentToConfirm.qrCodeId
      );

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
      console.error(error);

      setResult({
        success: false,
        message: 'Failed to confirm pickup.',
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
    <div className="h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            QR Scanner
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Scan and verify student pickups
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">
          <ShieldCheck className="w-5 h-5" />
          <span className="text-sm font-medium">
            Security Verification
          </span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* SCANNER CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">
                Scan QR Code
              </h3>

              <p className="text-sm text-gray-500">
                Use scanner or paste QR value manually
              </p>
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label
                htmlFor="qr-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                QR Code
              </label>

              <input
                id="qr-input"
                type="text"
                value={scanInput}
                onChange={(e) =>
                  setScanInput(e.target.value)
                }
                disabled={
                  scanning || !!studentToConfirm
                }
                placeholder="Scan or paste QR code..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={
                scanning ||
                !scanInput.trim() ||
                !!studentToConfirm
              }
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" />
                  Scan QR Code
                </>
              )}
            </button>
          </form>
        </div>

        {/* CONFIRM CARD */}
        {studentToConfirm && (
          <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-500 rounded-2xl shadow-sm p-6 mb-6 animate-in fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Verify Student
                </h3>

                <p className="text-sm text-gray-500">
                  Confirm pickup information below
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  Student Name
                </span>

                <span className="font-semibold text-gray-900">
                  {studentToConfirm.student?.first_name}{' '}
                  {studentToConfirm.student?.last_name}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  Grade
                </span>

                <span className="font-medium text-gray-900">
                  {studentToConfirm.student?.grade}
                </span>
              </div>

              {studentToConfirm.student?.class_name && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">
                    Class
                  </span>

                  <span className="font-medium text-gray-900">
                    {
                      studentToConfirm.student
                        ?.class_name
                    }
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500">
                  Guardian
                </span>

                <span className="font-medium text-gray-900">
                  {
                    studentToConfirm.parent
                      ?.full_name
                  }
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={cancelConfirmation}
                className="h-12 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmPickup}
                disabled={scanning}
                className="h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-all disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Confirm Pickup
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div
            className={`rounded-2xl border-2 p-6 mb-6 shadow-sm ${
              result.success
                ? 'bg-green-50 border-green-400'
                : 'bg-red-50 border-red-400'
            }`}
          >
            <div className="flex gap-4">
              <div>
                {result.success ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                )}
              </div>

              <div className="flex-1">
                <h3
                  className={`text-lg font-bold mb-2 ${
                    result.success
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}
                >
                  {result.success
                    ? 'Pickup Successful'
                    : 'Verification Failed'}
                </h3>

                <p
                  className={`mb-4 ${
                    result.success
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}
                >
                  {result.message}
                </p>

                {result.success &&
                  result.student && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
                      <div className="font-semibold text-gray-900">
                        {result.student.first_name}{' '}
                        {result.student.last_name}
                      </div>

                      <div className="text-sm text-gray-600">
                        Grade:{' '}
                        {result.student.grade}
                      </div>

                      {result.student.class_name && (
                        <div className="text-sm text-gray-600">
                          Class:{' '}
                          {
                            result.student
                              .class_name
                          }
                        </div>
                      )}

                      {result.parent && (
                        <div className="text-sm text-gray-600">
                          Picked By:{' '}
                          {
                            result.parent
                              .full_name
                          }
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}