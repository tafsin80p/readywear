import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";

export function Footer({ 
  logoUrl, 
  socialLinks 
}: { 
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
  };
}) {
  return (
    <footer className="bg-[#1c212e] text-white pt-16 pb-6">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 border-b border-gray-700 pb-12">
          
          {/* Brand & Address */}
          <div>
            <Link href="/" className="inline-block bg-white p-2 rounded-xl mb-5">
              <Image 
                src={logoUrl || "/readywear logo.png"} 
                alt="ReadyWear Logo" 
                width={200} 
                height={60} 
                className={`h-10 w-auto object-contain ${!logoUrl ? 'mix-blend-multiply' : ''}`}
              />
            </Link>
            <p className="text-gray-300 text-sm mb-6">স্টাইল মানেই তুমি</p>
            {/* Social Icons */}
            <div className="flex gap-4">
              {socialLinks?.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {socialLinks?.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              )}
              {socialLinks?.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white text-gray-400 transition-colors">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-6">কুইক লিংক</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-300 hover:text-white transition-colors text-sm">হোম</Link></li>
              <li><Link href="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">সকল ক্যাটাগরি</Link></li>
              <li><Link href="/track" className="text-gray-300 hover:text-white transition-colors text-sm">অর্ডার ট্র্যাক করুন</Link></li>
              <li><Link href="/account" className="text-gray-300 hover:text-white transition-colors text-sm">আমার অ্যাকাউন্ট</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-semibold text-lg mb-6">পলিসি ও নীতিমালা</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-colors text-sm">প্রাইভেসি পলিসি</Link></li>
              <li><Link href="/refund-return-policy" className="text-gray-300 hover:text-white transition-colors text-sm">রিটার্ন ও রিফান্ড পলিসি</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-300 hover:text-white transition-colors text-sm">শর্তাবলী</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-6">যোগাযোগ</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Phone className="w-[18px] h-[18px] mt-0.5 shrink-0 text-primary" />
                <a href="tel:01332547787" className="hover:text-white transition-colors">01332-547787</a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Mail className="w-[18px] h-[18px] mt-0.5 shrink-0 text-primary" />
                <a href="mailto:contact.mehzin@gmail.com" className="hover:text-white transition-colors break-all">contact.mehzin@gmail.com</a>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <MapPin className="w-[18px] h-[18px] mt-0.5 shrink-0 text-primary" />
                <span>ঢাকা, বাংলাদেশ</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} মেহজাবিন অফারস. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="mt-3 md:mt-0 flex items-center gap-2">
            <span className="text-gray-300">A signature brand of</span>
            <span className="text-white font-bold tracking-widest text-[11px] uppercase border-l border-gray-600 pl-2">Mehzin</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
