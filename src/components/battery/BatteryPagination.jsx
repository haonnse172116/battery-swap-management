const BatteryPagination = ({ 
  page, 
  setPage, 
  pagination, 
  pageSize = 20 
}) => {
  if (!pagination.totalPages || pagination.totalPages <= 1) return null;

  return (
    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-500">
        Hiển thị {((page - 1) * pageSize) + 1} - {Math.min(page * pageSize, pagination.totalRecords)} của {pagination.totalRecords} pin
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Trước
        </button>
        
        {/* Page numbers */}
        <div className="flex space-x-1">
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = i + 1;
            const isActive = pageNum === page;
            
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                  isActive 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {pagination.totalPages > 5 && (
            <>
              <span className="px-2 py-1 text-sm text-gray-500">...</span>
              <button
                onClick={() => setPage(pagination.totalPages)}
                className={`px-3 py-1 text-sm border border-gray-300 rounded ${
                  pagination.totalPages === page 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'hover:bg-gray-50'
                }`}
              >
                {pagination.totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= pagination.totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Sau
        </button>
      </div>
    </div>
  );
};

export default BatteryPagination;