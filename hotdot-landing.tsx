import Link from "next/link";
import Image from "next/image";
import HeaderAuth from "@/components/auth/header-auth";
import FullscreenButton from "@/components/fullscreen-button";

export default function Component() {
  return (
    <div className="relative flex flex-col h-screen-dynamic bg-[#F4F1E9] overflow-hidden">
      <FullscreenButton />
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 font-bold text-[#928E82] text-base font-['Helvetica_Neue']">
        <span>(Hot--Dot)</span>
        <div className="flex items-center space-x-4">
          <HeaderAuth />
        </div>
      </header>

      {/* Main Doodle Graphic */}
      <main className="flex-grow flex items-center justify-center px-4 pb-16">
        <div className="relative w-full max-w-[373px] aspect-[373/341]">
          <Image src="/images/home-doodle/vector-271.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '-0.55px', left: '28.67px', width: '344.13px', height: '333.5px' }} />
          <Image src="/images/home-doodle/vector-272.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '29.37px', left: '29.68px', width: '260.63px', height: '37.6px' }} />
          <Image src="/images/home-doodle/vector-273.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '95px', left: '0px', width: '105px', height: '237.39px' }} />
          <Image src="/images/home-doodle/vector-274.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '133.58px', left: '59.1px', width: '96.96px', height: '164.04px' }} />
          <Image src="/images/home-doodle/vector-275.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '147.78px', left: '87.72px', width: '109.43px', height: '192.6px' }} />
          <Image src="/images/home-doodle/vector-279.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '105.67px', left: '15.83px', width: '120.14px', height: '13.78px' }} />
          <Image src="/images/home-doodle/vector-280.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '118.04px', left: '22.93px', width: '111.38px', height: '24.77px' }} />
          <Image src="/images/home-doodle/vector-276.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '109.12px', left: '132.52px', width: '16.35px', height: '15.74px' }} />
          <Image src="/images/home-doodle/vector-281.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '95.03px', left: '126.78px', width: '6.71px', height: '8.27px' }} />
          <Image src="/images/home-doodle/vector-282.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '96.06px', left: '155.95px', width: '6.9px', height: '8.54px' }} />
          <Image src="/images/home-doodle/vector-277.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '104.86px', left: '149.74px', width: '118.06px', height: '29.2px' }} />
          <Image src="/images/home-doodle/vector-278.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '117.37px', left: '147.66px', width: '109.3px', height: '38.8px' }} />
          <Image src="/images/home-doodle/vector-270.svg" alt="Doodle part" layout="fill" objectFit="contain" className="absolute" style={{ top: '39.48px', left: '85px', width: '184.96px', height: '55.52px' }} />
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="absolute bottom-8 left-6 z-10">
        <nav className="flex flex-col items-start gap-2 text-[#1A1A1A] text-[48px] md:text-[52px] font-medium leading-tight tracking-[-2%]">
          <Link href="/solo-play" className="hover:text-[#FF5C38] transition-colors">SOLO-PLAY</Link>
          <Link href="/guess-match" className="hover:text-[#FF5C38] transition-colors">GUESS-IT</Link>
          <Link href="/profile" className="hover:text-[#FF5C38] transition-colors">PROFILE</Link>
        </nav>
      </footer>
    </div>
  );
}
