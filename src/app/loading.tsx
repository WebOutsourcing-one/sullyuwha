import Image from "next/image";

export default function LoadingPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-ivory">
      <div className="relative h-32 w-32 animate-pulse">
        <Image
          src="/loding.png"
          alt="로딩 중"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
