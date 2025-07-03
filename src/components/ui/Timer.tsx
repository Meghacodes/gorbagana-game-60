
interface TimerProps {
  timeRemaining: number;
}

const Timer = ({ timeRemaining }: TimerProps) => {
  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

  return (
    <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 px-4 py-2 rounded-lg border border-orange-500/30">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
        <span className="text-orange-400 font-mono text-sm">
          {hours.toString().padStart(2, '0')}:
          {minutes.toString().padStart(2, '0')}:
          {seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default Timer;
