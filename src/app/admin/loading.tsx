export default function FullAdminLoading() {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex">
      
      {/* 1. SIDEBAR SKELETON */}
      <div className="w-[280px] bg-white border-r border-gray-100 hidden lg:flex flex-col animate-pulse shrink-0">
        <div className="h-[72px] flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-gray-200 rounded-xl mr-3"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="p-4 space-y-2 mt-4">
          <div className="h-10 bg-gray-200 rounded-xl w-full mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2 ml-2"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
          <div className="h-10 bg-gray-100 rounded-xl w-full"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. HEADER SKELETON */}
        <div className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 animate-pulse">
          <div className="h-10 bg-gray-100 rounded-xl w-64 hidden md:block"></div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
              <div className="hidden sm:block space-y-1">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-2 bg-gray-200 rounded w-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN DASHBOARD CONTENT SKELETON */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-[1600px] mx-auto pb-10 animate-pulse">
            
            {/* Welcome Area Skeleton */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-stretch">
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="h-10 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded-md w-1/2"></div>
                </div>
                <div className="h-16 bg-gray-200 rounded-2xl w-48 mt-6"></div>
              </div>
              <div className="w-full xl:w-[600px] flex gap-4">
                <div className="flex-1 bg-gray-200 rounded-[2rem]"></div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-24 bg-gray-200 rounded-[2rem]"></div>
                  <div className="h-24 bg-gray-200 rounded-[2rem]"></div>
                </div>
              </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-[2rem] h-[180px] p-6 flex flex-col justify-between">
                  <div className="w-14 h-14 bg-gray-300 rounded-2xl"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-gray-300 rounded w-32 mb-3"></div>
                    <div className="h-5 bg-gray-300 rounded w-40"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Section Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-gray-200 rounded-[2rem] h-[400px] p-6"></div>
                <div className="bg-gray-200 rounded-[2rem] h-[350px] p-6"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gray-200 rounded-[2rem] h-[350px] p-6"></div>
                <div className="bg-gray-200 rounded-[2rem] h-[250px] p-6"></div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
