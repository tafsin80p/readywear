import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">
          You do not have permission to view this page. If you believe this is an error, please contact the administrator.
        </p>

        <div className="flex flex-col gap-3">
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <Link 
            href="/admin/login"
            className="flex items-center justify-center gap-2 w-full bg-white text-gray-600 px-4 py-2.5 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
