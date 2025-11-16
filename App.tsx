
import React, { useState } from 'react';
import FireworksCanvas from './components/FireworksCanvas';
import Controls from './components/Controls';

const App: React.FC = () => {
  const [particleCount, setParticleCount] = useState(100);
  const [autoLaunch, setAutoLaunch] = useState(true);

  return (
    <main className="bg-black h-screen w-screen overflow-hidden font-sans">
      <FireworksCanvas particleCount={particleCount} autoLaunch={autoLaunch} />
      <Controls
        particleCount={particleCount}
        onParticleCountChange={setParticleCount}
        autoLaunch={autoLaunch}
        onAutoLaunchChange={setAutoLaunch}
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-sm pointer-events-none">
        Click or tap to launch a firework
      </div>
    </main>
  );
}

export default App;
