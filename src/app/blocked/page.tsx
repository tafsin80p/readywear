import { Ban } from "lucide-react";

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-red-100 p-8 text-center">
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Ban className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Blocked</h1>
        <p className="text-gray-600 mb-4">
          Your IP address has been temporarily blocked due to suspicious activity.
        </p>
        <div className="bg-red-50 text-red-800 text-sm p-4 rounded-lg text-left">
          <strong>Reason:</strong> Too many unauthorized attempts to access secured areas of this website.
        </div>
      </div>
    </div>
  );
}
