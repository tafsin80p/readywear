import { services } from "@/data/mock";
import { Truck, ShieldCheck, RefreshCw, HeadphonesIcon } from "lucide-react";

const iconMap: Record<string, any> = {
  Truck,
  ShieldCheck,
  RefreshCw,
  HeadphonesIcon,
};

export function ServiceFeatures() {
  return (
    <div className="border-y border-gray-100 bg-pink-50/50 py-8 mt-12 mb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x-0 md:divide-x divide-gray-200">
          {services.map((service) => {
            const Icon = iconMap[service.icon] || Truck;
            return (
              <div key={service.id} className="flex items-center justify-center gap-4 px-4">
                <Icon className="w-10 h-10 text-primary stroke-[1.5]" />
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">{service.title}</h4>
                  <p className="text-sm text-gray-500">{service.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
