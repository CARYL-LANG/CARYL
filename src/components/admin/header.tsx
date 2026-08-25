import { BouncingText } from '../bouncing-text';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Pring Kuyas Inn Logo"
            className="logo-flip w-10 h-10 object-contain"
          />
          <BouncingText text="PRING KUYAS INN" className="text-2xl font-bold text-gray-800" />
        </div>
      </div>
    </header>
  );
}
