import React, { useState } from 'react';
import { Download, Smartphone, Apple, CheckCircle2, X, Sparkles, Share2, PlusSquare, ArrowUpRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeDeviceTab, setActiveDeviceTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 shadow-md flex items-center justify-center">
              <img src="/icon.svg" alt="App Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">ดาวน์โหลด & ติดตั้งบนมือถือ</h3>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-400 text-slate-900 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> PWA Official
                </span>
              </div>
              <p className="text-sm text-blue-100 mt-0.5">
                ติดตั้งฟรีทันที ไม่ต้องโหลดไฟล์ใหญ่ เปิดใช้งานได้เหมือนแอพจาก Store!
              </p>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="flex gap-2 mt-4 bg-black/15 p-1 rounded-xl">
            <button
              onClick={() => setActiveDeviceTab('ios')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeDeviceTab === 'ios'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Apple App Store (iOS)</span>
            </button>
            <button
              onClick={() => setActiveDeviceTab('android')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                activeDeviceTab === 'android'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Google Play (Android)</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700">
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">คุณได้ติดตั้งแอพพลิเคชันนี้เรียบร้อยแล้ว!</p>
                <p className="text-xs text-emerald-600 mt-0.5">เปิดใช้งานได้ทันทีจากหน้าจอโฮมของคุณ</p>
              </div>
            </div>
          ) : null}

          {installSuccess ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-800">
              <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
              <p className="font-semibold text-sm">กำลังติดตั้งแอพพลิเคชันลงในอุปกรณ์ของคุณ...</p>
            </div>
          ) : null}

          {/* Quick Action Button for Chromium / Android */}
          {isInstallable && !isInstalled && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">ระบบตรวจพบอุปกรณ์ที่รองรับการติดตั้ง 1 คลิก</h4>
                  <p className="text-xs text-slate-600 mt-0.5">กดติดตั้งเพื่อเพิ่มไอคอนแอพลงหน้าจอมือถือได้ทันที</p>
                </div>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-medium text-sm rounded-xl shadow-md flex items-center gap-2 shrink-0 transition"
                >
                  <Download className="w-4 h-4" />
                  ติดตั้งทันที
                </button>
              </div>
            </div>
          )}

          {/* Device specific instructions */}
          {activeDeviceTab === 'ios' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">วิธีติดตั้งบน iPhone & iPad</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Safari Browser</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      เปิดในเบราว์เซอร์ Safari และกดปุ่ม <Share2 className="w-4 h-4 text-blue-600" /> "แชร์ (Share)"
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">ปุ่มรูปสี่เหลี่ยมพร้อมลูกศรชี้ขึ้น ที่แถบเมนูด้านล่างของหน้าจอ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      เลื่อนลงมาแล้วเลือก <PlusSquare className="w-4 h-4 text-emerald-600" /> "เพิ่มไปยังหน้าจอโฮม"
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">(Add to Home Screen) ในเมนูคำสั่ง</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">กดปุ่ม "เพิ่ม" (Add) ที่มุมขวาบน</p>
                    <p className="text-xs text-slate-500 mt-0.5">ไอคอน SmartPE จะปรากฏบนหน้าจอโฮมของคุณ พร้อมใช้งานแบบเต็มหน้าจอ เสมือนดาวน์โหลดจาก App Store!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">วิธีติดตั้งบน Android / Google Play style</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Chrome / Edge Browser</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">กดปุ่ม "ติดตั้งทันที" หรือจุดสามจุด (⋮)</p>
                    <p className="text-xs text-slate-500 mt-0.5">ที่มุมขวาบนของ Google Chrome หรือกดปุ่มด้านบนนี้</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                      เลือก "ติดตั้งแอป" (Install App) หรือ "เพิ่มลงในหน้าจอหลัก"
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">ระบบจะสร้าง WebAPK ให้โดยอัตโนมัติ</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">3</div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-800">เปิดใช้งานได้ทันที</p>
                    <p className="text-xs text-slate-500 mt-0.5">ทำงานได้รวดเร็ว ประหยัดพื้นที่เครื่อง ไม่กินแบตเตอรี่ และบันทึกข้อมูลออฟไลน์ได้</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Advantages */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1.5">
            <p className="font-medium text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              ข้อดีของ Progressive Web App (PWA):
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-500 pl-1">
              <li>ขนาดแอพเบามากเพียงไม่กี่เมกะไบต์ (ประหยัดความจำเครื่อง)</li>
              <li>อัปเดตฟังก์ชันใหม่ล่าสุดอัตโนมัติ ไม่ต้องคอยกด Update ใน Store</li>
              <li>รองรับทั้ง iOS, Android, แท็บเล็ต, iPad และคอมพิวเตอร์ PC/Mac</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            พร้อมใช้งานบนทุกอุปกรณ์ทันที
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 active:scale-95 text-slate-700 text-sm font-medium rounded-xl transition"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
