"use client";

import Link from "next/link";
import Image from "next/image";

interface FloatingSocialButtonsProps {
  whatsappUrl?: string;
  messengerUrl?: string;
}

export function FloatingSocialButtons({ whatsappUrl, messengerUrl }: FloatingSocialButtonsProps) {
  if (!whatsappUrl && !messengerUrl) return null;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
      {whatsappUrl && (
        <a 
          href={whatsappUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl hover:scale-110 duration-300"
        >
          {/* Ripple animation layers */}
          <span className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75 duration-1000"></span>
          <span className="absolute -inset-2 rounded-full border border-green-300 animate-pulse opacity-50 duration-700"></span>
          
          <svg className="w-8 h-8 text-white z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      )}

      {messengerUrl && (
        <a 
          href={messengerUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#00c6ff] to-[#0072ff] hover:brightness-110 transition-all shadow-lg hover:shadow-xl hover:scale-110 duration-300"
        >
          {/* Ripple animation layers */}
          <span className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75 duration-1000 delay-150"></span>
          <span className="absolute -inset-2 rounded-full border border-blue-300 animate-pulse opacity-50 duration-700 delay-150"></span>

          <svg className="w-8 h-8 text-white z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654v4.235l4.085-2.242c1.09.301 2.246.464 3.446.464 6.627 0 12-4.975 12-11.111S18.627 0 12 0zm1.191 14.962l-3.056-3.26-5.963 3.26 6.559-6.962 3.13 3.259 5.888-3.259-6.558 6.962z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
