import Link from "next/link";
import { BookOpen, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            인쇄소 <span className="text-indigo-500">시안 피드백 시스템</span>
          </h1>
          <p className="text-neutral-400 text-lg">
            인쇄 작업 시안에 대한 실시간 피드백 및 승인 플랫폼입니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin"
            className="group flex flex-col items-center justify-center space-y-3 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-indigo-500 hover:bg-neutral-800/50 transition-all"
          >
            <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
              <Settings className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">관리자 포털</h2>
              <p className="text-sm text-neutral-500 mt-1">시안 관리 및 고객용 게시판 생성</p>
            </div>
          </Link>

          <Link
            href="/admin/guide"
            className="group flex flex-col items-center justify-center space-y-3 p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-emerald-500 hover:bg-neutral-800/50 transition-all"
          >
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full group-hover:scale-110 transition-transform">
              <BookOpen className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">사용설명서 확인하기</h2>
              <p className="text-sm text-neutral-500 mt-1">시스템 상세 사용 가이드</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
