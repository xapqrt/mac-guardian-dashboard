import React from 'react';

export const CosmicField: React.FC = () => {

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-70 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% -20%, rgba(0, 113, 227, 0.18), transparent 70%)'
        }}
      />
    </div>
  );
};
