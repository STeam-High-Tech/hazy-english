// src/components/Spinner.tsx
type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'cyan' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
  className?: string;
};

export function Spinner({ 
  size = 'md', 
  color = 'blue',
  className = '' 
}: SpinnerProps = {}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-[3px]',
  };

  const colorClasses = {
    blue: 'border-t-tokyo-night-blue/20 border-r-tokyo-night-blue/20 border-b-tokyo-night-blue/20 border-l-tokyo-night-blue',
    cyan: 'border-t-tokyo-night-cyan/20 border-r-tokyo-night-cyan/20 border-b-tokyo-night-cyan/20 border-l-tokyo-night-cyan',
    green: 'border-t-tokyo-night-green/20 border-r-tokyo-night-green/20 border-b-tokyo-night-green/20 border-l-tokyo-night-green',
    yellow: 'border-t-tokyo-night-yellow/20 border-r-tokyo-night-yellow/20 border-b-tokyo-night-yellow/20 border-l-tokyo-night-yellow',
    red: 'border-t-tokyo-night-red/20 border-r-tokyo-night-red/20 border-b-tokyo-night-red/20 border-l-tokyo-night-red',
    purple: 'border-t-tokyo-night-purple/20 border-r-tokyo-night-purple/20 border-b-tokyo-night-purple/20 border-l-tokyo-night-purple',
    orange: 'border-t-tokyo-night-orange/20 border-r-tokyo-night-orange/20 border-b-tokyo-night-orange/20 border-l-tokyo-night-orange',
  };

  return (
    <div 
      className={`inline-block ${sizeClasses[size]} ${colorClasses[color]} ${className} animate-spin rounded-full`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}