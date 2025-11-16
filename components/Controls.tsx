
import React from 'react';

interface ControlsProps {
  particleCount: number;
  onParticleCountChange: (count: number) => void;
  autoLaunch: boolean;
  onAutoLaunchChange: (auto: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  particleCount,
  onParticleCountChange,
  autoLaunch,
  onAutoLaunchChange,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-70 p-4 rounded-lg text-white shadow-lg backdrop-blur-sm border border-white/20">
      <h2 className="text-lg font-bold mb-3 text-center">Controls</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="particleCount" className="block text-sm font-medium text-gray-300">
            Explosion Size ({particleCount})
          </label>
          <input
            id="particleCount"
            type="range"
            min="20"
            max="400"
            step="10"
            value={particleCount}
            onChange={(e) => onParticleCountChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>
        <div className="flex items-center justify-between">
          <label htmlFor="autoLaunch" className="text-sm font-medium text-gray-300">
            Auto Launch
          </label>
          <button
            id="autoLaunch"
            onClick={() => onAutoLaunchChange(!autoLaunch)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-sky-400`}
          >
            <span className="sr-only">Toggle Auto Launch</span>
            <span
              className={`inline-block w-4 h-4 transform ${autoLaunch ? 'translate-x-6 bg-sky-400' : 'translate-x-1 bg-gray-400'} rounded-full transition-transform duration-300 ease-in-out bg-white`}
            />
             <span
              className={`absolute inset-0 h-full w-full rounded-full ${autoLaunch ? 'bg-sky-600/50' : 'bg-gray-600'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
