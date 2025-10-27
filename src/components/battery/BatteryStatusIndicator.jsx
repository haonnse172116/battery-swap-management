const BatteryStatusIndicator = ({ 
  currentCapacity, 
  totalCapacity, 
  status = 'Available',
  size = 'md',
  showPercentage = true 
}) => {
  const percentage = totalCapacity > 0 ? Math.round((currentCapacity / totalCapacity) * 100) : 0;
  
  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-12 h-6',
    lg: 'w-16 h-8'
  };
  
  const getStatusColor = () => {
    if (status === 'Damaged') return 'bg-red-500';
    if (status === 'Maintenance') return 'bg-orange-500';
    if (status === 'Charging') return 'bg-yellow-500';
    
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBorderColor = () => {
    if (status === 'Damaged') return 'border-red-600';
    if (status === 'Maintenance') return 'border-orange-600';
    if (status === 'Charging') return 'border-yellow-600';
    return 'border-gray-600';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Battery Visual */}
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 ${getBorderColor()} rounded-sm bg-gray-200 relative overflow-hidden`}>
          {/* Battery Fill */}
          <div
            className={`h-full ${getStatusColor()} transition-all duration-300`}
            style={{ width: `${Math.max(percentage, 5)}%` }}
          />
          
          {/* Battery Terminal */}
          <div className={`absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 ${
            size === 'sm' ? 'h-2' : size === 'md' ? 'h-3' : 'h-4'
          } ${getBorderColor().replace('border-', 'bg-')} rounded-r`} />
        </div>
        
        {/* Charging Animation */}
        {status === 'Charging' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-white text-xs">⚡</div>
          </div>
        )}
      </div>

      {/* Percentage Text */}
      {showPercentage && (
        <span className={`font-medium ${
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        } ${
          percentage < 20 ? 'text-red-600' : 
          percentage < 40 ? 'text-orange-600' : 
          'text-gray-700'
        }`}>
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default BatteryStatusIndicator;