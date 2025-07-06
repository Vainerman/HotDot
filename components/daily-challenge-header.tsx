import Link from 'next/link';

const DailyChallengeHeader = () => {
  return (
    <div className="w-full max-w-4xl p-4 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-500 tracking-wider">DAILY CHALLENGE</span>
        <span className="text-3xl font-bold text-black">DAY 5: MONKEY</span>
      </div>
      <div className="flex flex-col items-end">
        <Link href="/" className="text-3xl font-bold text-gray-800 mb-2">
          (Hot/Dot)
        </Link>
        <div className="w-56 h-2 bg-gray-300 rounded-full overflow-hidden">
          <div className="w-3/5 h-full bg-yellow-400" />
        </div>
      </div>
    </div>
  );
};

export default DailyChallengeHeader; 