import { categoryShortcuts } from "@/data/mock";
import { LayoutGrid, Shirt, ShoppingBag, Footprints, Home, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, any> = {
  LayoutGrid,
  Dress: Shirt, // Using shirt as fallback for dress if not available
  Shirt,
  Image: ImageIcon,
  ShoppingBag,
  Footprints,
  Home,
};

export function CategoryShortcuts() {
  return (
    <div className="py-12 bg-white container mx-auto px-4 lg:px-8">
      <div className="flex flex-wrap justify-center gap-4 md:gap-8 lg:gap-12">
        {categoryShortcuts.map((category) => {
          const IconComponent = iconMap[category.icon] || LayoutGrid;
          
          return (
            <Link 
              href="#" 
              key={category.id}
              className="flex flex-col items-center gap-3 group w-20 md:w-24"
            >
              <div className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-md">
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors block">
                  {category.label}
                </span>
                <span className="text-xs text-gray-400 group-hover:text-primary transition-colors">
                  →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
