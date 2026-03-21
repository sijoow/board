import Link from "next/link";
import { LayoutDashboard, PlusSquare, Trash2, CheckCircle, BookOpen } from "lucide-react";
import { ThemeToggle } from "../../components/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 shrink-0 overflow-y-auto overflow-x-hidden border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col transition-all">
        <div className="p-4 md:p-6 flex items-center justify-center md:justify-start shrink-0">
          <h1 className="hidden md:block text-xl font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent truncate">
            관리자 포털
          </h1>
          <span className="md:hidden text-2xl font-black bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent">
            P
          </span>
        </div>
        <div className="hidden md:block px-6 shrink-0">
          <p className="text-xs text-neutral-500 -mt-2 mb-4">인쇄소 피드백 시스템</p>
        </div>

        <nav className="flex-1 px-2 md:px-4 space-y-2 mt-2 md:mt-4 flex flex-col">
          <Link
            href="/admin"
            className="flex justify-center md:justify-start items-center space-x-0 md:space-x-3 p-3 md:px-3 md:py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
            title="대시보드"
          >
            <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="hidden md:block font-medium">대시보드</span>
          </Link>
          <Link
            href="/admin/new"
            className="flex justify-center md:justify-start items-center space-x-0 md:space-x-3 p-3 md:px-3 md:py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
            title="새 게시판 생성"
          >
            <PlusSquare className="w-6 h-6 md:w-5 md:h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="hidden md:block font-medium">새 게시판 생성</span>
          </Link>
          <Link
            href="/admin/completed"
            className="flex justify-center md:justify-start items-center space-x-0 md:space-x-3 p-3 md:px-3 md:py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
            title="작업 완료"
          >
            <CheckCircle className="w-6 h-6 md:w-5 md:h-5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span className="hidden md:block font-medium">작업 완료</span>
          </Link>
          <Link
            href="/admin/guide"
            className="flex justify-center md:justify-start items-center space-x-0 md:space-x-3 p-3 md:px-3 md:py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
            title="사용 가이드"
          >
            <BookOpen className="w-6 h-6 md:w-5 md:h-5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span className="hidden md:block font-medium">사용 가이드</span>
          </Link>
          <Link
            href="/admin/trash"
            className="flex justify-center md:justify-start items-center space-x-0 md:space-x-3 p-3 md:px-3 md:py-2.5 rounded-xl text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
            title="휴지통"
          >
            <Trash2 className="w-6 h-6 md:w-5 md:h-5 text-rose-500 dark:text-rose-400 shrink-0" />
            <span className="hidden md:block font-medium">휴지통</span>
          </Link>
        </nav>

        <div className="p-3 md:p-4 mt-auto border-t border-neutral-200 dark:border-neutral-800 flex flex-col space-y-4 items-center md:items-stretch">
          <div className="flex flex-col md:flex-row items-center justify-between gap-y-2">
            <span className="hidden md:block text-sm font-medium text-neutral-500">테마 설정</span>
            <ThemeToggle />
          </div>
          <Link
            href="/"
            className="hidden md:block text-sm text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors text-center"
          >
            &larr; 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main Layout Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 bg-neutral-50 dark:bg-neutral-950 transition-colors">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
