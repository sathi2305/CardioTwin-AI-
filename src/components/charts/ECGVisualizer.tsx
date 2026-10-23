import React, { useEffect, useRef } from 'react';

interface ECGVisualizerProps {
  heartRate: number;
  isStreaming: boolean;
  isAlert?: boolean;
}

export const ECGVisualizer: React.FC<ECGVisualizerProps> = ({ heartRate, isStreaming, isAlert }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let xPos = 0;
    const height = canvas.height;
    const width = canvas.width;
    const midY = height / 2;

    // Buffer to store trace
    const points: number[] = new Array(width).fill(midY);
    let beatPhase = 0;

    const render = () => {
      // Calculate beat speed according to BPM
      // 60 bpm = 1 beat per second
      const beatFrequency = (heartRate / 60) * 0.05;
      beatPhase = (beatPhase + beatFrequency) % 1.0;

      let waveVal = 0;
      // Synthesize P-Q-R-S-T wave
      if (beatPhase > 0.15 && beatPhase < 0.25) {
        // P-wave
        waveVal = Math.sin((beatPhase - 0.15) * 10 * Math.PI) * -8;
      } else if (beatPhase >= 0.28 && beatPhase <= 0.30) {
        // Q-dip
        waveVal = 5;
      } else if (beatPhase > 0.30 && beatPhase < 0.36) {
        // R-peak
        waveVal = Math.sin((beatPhase - 0.30) * (Math.PI / 0.06)) * -32;
      } else if (beatPhase >= 0.36 && beatPhase <= 0.39) {
        // S-dip
        waveVal = 8;
      } else if (beatPhase > 0.50 && beatPhase < 0.68) {
        // T-wave
        waveVal = Math.sin((beatPhase - 0.50) * (Math.PI / 0.18)) * -12;
      } else {
        // Baseline noise
        waveVal = (Math.random() - 0.5) * 1.5;
      }

      points[xPos] = midY + waveVal;
      xPos = (xPos + 2) % width;

      // Draw grid
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#15223e';
      ctx.lineWidth = 0.5;
      const gridSize = 16;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ECG trace
      ctx.beginPath();
      ctx.strokeStyle = isAlert ? '#f43f5e' : '#06b6d4';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = isAlert ? 'rgba(244, 63, 94, 0.6)' : 'rgba(6, 182, 212, 0.6)';

      for (let i = 0; i < width; i++) {
        // Skip current cursor to create sweeping radar look
        if (Math.abs(i - xPos) < 6) continue;
        const y = points[i];
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweep head dot
      ctx.fillStyle = isAlert ? '#ff7991' : '#67e8f9';
      ctx.beginPath();
      ctx.arc(xPos, points[xPos], 3.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, isStreaming, isAlert]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0a1020]">
      <canvas ref={canvasRef} width={600} height={120} className="w-full h-28 block" />
      <div className="absolute top-2 left-3 flex items-center space-x-2 text-[10px] font-mono">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span className="text-slate-400 uppercase tracking-wider">Lead II Simulated PPG/ECG</span>
        <span className="text-cyan-400 font-bold">{heartRate} BPM</span>
      </div>
      <div className="absolute bottom-2 right-3 text-[10px] text-slate-400 font-mono">
        25 mm/s | 10 mm/mV
      </div>
    </div>
  );
};
