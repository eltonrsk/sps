import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { QrCode, Plus, Download, Copy, Check } from 'lucide-react';

type QRCode = {
  id: string;
  code: string;
  is_active: boolean;
  created_at: string;
  last_used_at: string | null;
  student_id: string | null;
};

export default function QRCodeDisplay({ userId }: { userId: string }) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    loadQRCodes();
  }, [userId]);

  const loadQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error loading QR codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const codeValue = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { error } = await supabase.from('qr_codes').insert({
        user_id: userId,
        code: codeValue,
        is_active: true,
      });

      if (error) throw error;
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
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadQRCode = (code: string) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `qr-code-${code.substr(0, 8)}.png`;
    link.click();
  };

  const deactivateQRCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ is_active: false })
        .eq('id', codeId);

      if (error) throw error;
      await loadQRCodes();
    } catch (error) {
      console.error('Error deactivating QR code:', error);
    }
  };

  if (loading && qrCodes.length === 0) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My QR Codes</h2>
          <p className="text-gray-600 text-sm mt-1">Generate and manage pickup QR codes</p>
        </div>
        <button
          onClick={generateQRCode}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Generate New QR
        </button>
      </div>

      {qrCodes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">No QR codes yet</p>
          <p className="text-gray-500 mb-6">Generate a QR code to enable school staff to verify pickups</p>
          <button
            onClick={generateQRCode}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Your First QR Code
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {qrCodes.map((qr) => {
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qr.code)}`;
            return (
              <div key={qr.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900">QR Code</h3>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      qr.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {qr.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4 flex justify-center">
                  <img
                    src={qrImageUrl}
                    alt="QR Code"
                    className="w-40 h-40"
                  />
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600">Code Value</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={qr.code}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        onClick={() => copyToClipboard(qr.code)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied === qr.code ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {qr.last_used_at && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Last Used</label>
                      <p className="text-sm text-gray-700 mt-1">
                        {new Date(qr.last_used_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQRCode(qr.code)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  {qr.is_active && (
                    <button
                      onClick={() => deactivateQRCode(qr.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
