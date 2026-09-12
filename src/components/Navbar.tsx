import { navLinks } from "@/data/mock";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="hidden md:block bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <ul className="flex items-center justify-center gap-8 py-4">
          {navLinks.map((link, index) => (
            <li key={index} className="relative group">
              <Link 
                href={link.href}
                className={cn(
                  "flex items-center gap-1 text-[15px] font-medium transition-colors hover:text-primary",
                  link.isOffer ? "text-primary" : "text-gray-700",
                  index === 0 ? "text-primary border-b-2 border-primary pb-1" : ""
                )}
              >
                {link.label}
                {link.hasDropdown && <ChevronDown className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform duration-300" />}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
