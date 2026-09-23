import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

export function CategorySidebar({ categories, activeSlug }: { categories: any[], activeSlug?: string }) {
  // Separate main and subcategories
  const mainCategories = categories.filter(c => !c.parentCategory || c.parentCategory === "none" || c.parentCategory === "");
  const subCategories = categories.filter(c => c.parentCategory && c.parentCategory !== "none" && c.parentCategory !== "");

  return (
    <>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:block w-64 shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-28">
          <h3 className="font-bold text-lg mb-4 text-gray-900 border-b border-gray-100 pb-3">ক্যাটাগরি সমূহ</h3>
          <ul className="space-y-3">
            {/* All Products Link */}
            <li>
              <Link
                href="/categories"
                className={cn(
                  "block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                  activeSlug === "all" ? "bg-primary/10 text-primary font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                )}
              >
                সকল পণ্য
              </Link>
            </li>
            
            {mainCategories.map(main => {
              const children = subCategories.filter(sub => sub.parentCategory === main.slug);
              const isMainActive = activeSlug === main.slug;
              const isChildActive = children.some(child => child.slug === activeSlug);
              const isExpanded = isMainActive || isChildActive;

              return (
                <li key={main.slug} className="pt-1">
                  <Link
                    href={`/category/${main.slug}`}
                    className={cn(
                      "flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      isMainActive ? "bg-primary text-white font-semibold shadow-sm shadow-primary/20" : "text-gray-700 hover:bg-gray-50 hover:text-primary font-semibold"
                    )}
                  >
                    {main.name || main.label}
                    {children.length > 0 && (
                      <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
                    )}
                  </Link>
                  
                  {/* Nested Subcategories */}
                  {children.length > 0 && (
                    <ul className="pl-4 mt-1 space-y-1 border-l-2 border-gray-100 ml-4 mb-2">
                      {children.map(child => (
                        <li key={child.slug}>
                          <Link
                            href={`/category/${child.slug}`}
                            className={cn(
                              "block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors",
                              activeSlug === child.slug ? "text-primary font-bold bg-primary/5" : "text-gray-500 hover:text-primary hover:bg-gray-50"
                            )}
                          >
                            {child.name || child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile Horizontal Tabs */}
      <div className="md:hidden flex overflow-x-auto gap-2 pb-2 -mx-4 px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sticky top-[72px] z-30 bg-gray-50/90 backdrop-blur-md pt-2 mb-4">
        <Link
          href="/categories"
          className={cn(
            "shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors",
            activeSlug === "all" ? "bg-primary text-white shadow-sm shadow-primary/20" : "bg-white text-gray-600 border border-gray-200"
          )}
        >
          সকল পণ্য
        </Link>
        {mainCategories.map(main => (
          <Link
            key={main.slug}
            href={`/category/${main.slug}`}
            className={cn(
              "shrink-0 whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors",
              activeSlug === main.slug ? "bg-primary text-white shadow-sm shadow-primary/20" : "bg-white text-gray-600 border border-gray-200"
            )}
          >
            {main.name || main.label}
          </Link>
        ))}
      </div>
    </>
  );
}
