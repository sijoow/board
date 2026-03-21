"use client";

import { 
  BookOpen, 
  LayoutDashboard, 
  CheckCircle, 
  MapPin, 
  Layers,
  MessageCircle,
  ExternalLink,
  Image as ImageIcon,
  X
} from "lucide-react";

export default function AdminGuidePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 헤더 섹션 */}
      <div className="mb-16 text-center md:text-left flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-10">
        <div className="w-16 h-16 bg-indigo-500/10 rounded-3xl flex items-center justify-center shrink-0 shadow-inner border border-indigo-500/20">
           <BookOpen className="w-8 h-8 text-indigo-500" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">
              시스템 시각화 사용 가이드
            </span>
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-base max-w-2xl leading-relaxed font-medium">
            이 가이드는 실무 담당자를 위해 실제 시스템의 UI 동작 예시를 시각적으로 재현하여 작성되었습니다.
            아래의 각 단계별 예제 화면을 통해 피드백 워크플로우를 직관적으로 익혀보세요.
          </p>
        </div>
      </div>

      {/* 1. 전체 워크플로우 시작하기 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
              <LayoutDashboard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">1. 전체 워크플로우 (두 개의 URL)</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl mb-4">
            이 시스템에서 가장 중요한 점은 <strong>관리자 실무용 URL</strong>과 <strong>고객 확인용 URL</strong>이 완전히 분리되어 있다는 것입니다! 관리자가 게시판에 1차 시안을 세팅한 후, <strong>[고객 URL]</strong> 버튼을 복사해 그 주소만 고객에게 카카오톡 등으로 단일 전송하시면 됩니다.
          </p>
          <ul className="space-y-3">
             <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3"></span>
              고객용 URL 접속자는 관리자 메뉴에 절대 접근할 수 없으며 오직 시안 확인과 피드백 만을 남길 수 있습니다.
            </li>
            <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-3"></span>
              고객이 피드백을 남기면 우측 예제 타일처럼 썸네일에 <strong className="text-rose-500 mx-1">새 피드백</strong> 알림이 깜빡여 직관적으로 알려줍니다.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl p-6 md:p-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          {/* Mock Dashboard Card */}
          <div className="w-full max-w-sm bg-white dark:bg-neutral-900 border border-rose-500 rounded-2xl p-6 shadow-2xl shadow-rose-500/10 transform transition-transform hover:-translate-y-1">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold px-3 py-1.5 rounded-full text-xs">피드백 대기중</span>
              <span className="animate-pulse flex items-center space-x-1.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 px-3.5 py-1.5 rounded-full shadow-md border border-rose-400/50">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>새 피드백</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-1">2026년 봄 카탈로그 인쇄</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 font-medium">(주)디자인기획 • 1차 시안</p>
            <div className="flex space-x-3">
              <button className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 cursor-default">게시판 관리</button>
              <button className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center cursor-default">
                <ExternalLink className="w-4 h-4 mr-1.5"/> 고객 URL
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 스마트 핀(Pin) 피드백 활용법 */}
      <section className="bg-rose-50/50 dark:bg-rose-500/5 rounded-3xl p-8 lg:p-10 border border-rose-100 dark:border-rose-500/10 shadow-sm">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-white dark:bg-rose-500/20 rounded-xl border border-rose-100 dark:border-rose-500/20 shadow-sm">
              <MapPin className="w-6 h-6 text-rose-500 dark:text-rose-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">2. 모든 피드백은 '핀(Pin)'으로 정확하게</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium bg-white dark:bg-neutral-950 border border-rose-100 dark:border-rose-500/20 p-5 rounded-2xl shadow-sm mb-4">
            애매한 텍스트 설명("오른쪽 상단 글자 좀...") 단위가 아닌 시안 위의 <strong>스마트 핀(Pin) 터치</strong>를 통해 원천적으로 피드백을 받습니다. 고객이 수정이 필요한 곳에 직접 핀을 꽂아 코멘트를 남기면서 관리자와 고객의 소통 오차율을 0%에 수렴하게 만듭니다.
          </p>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <ul className="space-y-4">
              <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 mr-3"></span>
                실시간 채팅 내용과 이미지 위 마커가 숫자로 완벽하게 연동됩니다. 실제 작동 원리는 대시보드의 <strong>[고객 URL]</strong>을 눌러 직접 체험해 보세요.
              </li>
              <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 mr-3"></span>
                본인이 잘못 남긴 핀 피드백은 고객과 관리자 양측 모두 전용 채팅 영역에 있는 <strong>[X 삭제]</strong> 버튼으로 깔끔하게 지울 수 있습니다.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. 다중 이미지 및 2차 완성본 관리 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <Layers className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">3. 다중 이미지 & 버전 관리</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl">
            한 시안 안에 앞면/뒷면 등 여러 컷이 있다면 모두 다중 업로드할 수 있습니다. 피드백을 반영해 새 파일을 올리면 2차 시안 탭이 새로 생성되며 판올림됩니다.
          </p>
          <ul className="space-y-3">
             <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 mr-3"></span>
              마우스 스크롤 만으로 긴 파일 여러 장을 끊임없이 쾌적하게 넘기며 핀을 확인할 수 있습니다.
            </li>
          </ul>
        </div>

        <div className="lg:col-span-7 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl p-6 md:p-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          {/* Mock Multi-version UI */}
          <div className="w-full max-w-sm h-64 flex flex-col space-y-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-wrap gap-2 items-center border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <span className="text-xs text-neutral-500 font-bold mr-1 flex items-center"><Layers className="w-4 h-4 mr-1"/> 버전:</span>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 cursor-default">1차 시안</button>
              <button className="px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md cursor-default">2차 시안 (최신)</button>
            </div>
            <div className="flex-1 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col items-center p-3 space-y-3 relative overflow-y-auto">
                <div className="w-full h-24 shrink-0 bg-white dark:bg-neutral-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center text-xs text-neutral-400 relative">
                  <span className="absolute top-0 right-0 z-20 bg-neutral-900/90 text-white px-2 py-1 text-[10px] font-bold rounded-bl-lg pointer-events-none backdrop-blur-sm border-l border-b border-neutral-700">1 / 2 컷</span>
                  <ImageIcon className="w-6 h-6 mb-1 opacity-50"/>
                  앞면 디자인.jpg
                </div>
                <div className="w-full h-24 shrink-0 bg-white dark:bg-neutral-950 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 flex flex-col items-center justify-center text-xs text-neutral-400 relative">
                  <span className="absolute top-0 right-0 z-20 bg-neutral-900/90 text-white px-2 py-1 text-[10px] font-bold rounded-bl-lg pointer-events-none backdrop-blur-sm border-l border-b border-neutral-700">2 / 2 컷</span>
                  <ImageIcon className="w-6 h-6 mb-1 opacity-50"/>
                  뒷면 디자인.jpg
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 상태 관리 및 대시보드 리스트 */}
       <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
         <div className="lg:col-span-7 order-2 lg:order-1 bg-neutral-100 dark:bg-neutral-900/50 rounded-3xl p-6 md:p-10 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
          {/* Mock Dashboard Table */}
          <div className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-2xl text-sm">
            <table className="w-full text-left">
              <thead className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
                 <tr>
                    <th className="px-5 py-3.5 font-bold">프로젝트명</th>
                    <th className="px-5 py-3.5 font-bold hidden sm:table-cell">진행 상태</th>
                    <th className="px-5 py-3.5 font-bold">버전</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-700 dark:text-neutral-300">
                 <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors">
                   <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white truncate">제주도 여행 팜플렛</td>
                   <td className="px-5 py-4 hidden sm:table-cell">
                     <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap">승인 완료</span>
                   </td>
                   <td className="px-5 py-4">3차</td>
                 </tr>
                 <tr className="bg-rose-50/30 dark:bg-rose-500/5 hover:bg-rose-50/60 dark:hover:bg-rose-500/10 transition-colors">
                   <td className="px-5 py-4 font-bold text-neutral-900 dark:text-white truncate">간판 시안 작업</td>
                   <td className="px-5 py-4 hidden sm:table-cell">
                     <span className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-full font-bold text-xs whitespace-nowrap">수정 요청됨</span>
                   </td>
                   <td className="px-5 py-4">
                     <span className="flex w-max items-center space-x-1.5 text-[10px] font-bold text-white bg-rose-600 px-2 py-1 rounded-full shadow-sm">
                       <MessageCircle className="w-3 h-3" />
                       <span>새 피드백</span>
                     </span>
                   </td>
                 </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2 space-y-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
              <CheckCircle className="w-6 h-6 text-blue-500 dark:text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">4. 최종 완료 및 상태 관리</h3>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl">
            고객이 만족하여 최종 승인 버튼을 누르면 프로젝트가 종료됩니다. 초기 상태는 대시보드 리스트형 뷰로 넓고 한눈에 확인 가능하도록 세팅되어 있습니다.
          </p>
          <ul className="space-y-3">
             <li className="flex items-start text-sm text-neutral-700 dark:text-neutral-300 font-medium">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3"></span>
              최종 승인된 인쇄물은 좌측 메뉴의 [작업 완료] 탭으로 자동 보관되어 이력을 언제든 열람할 수 있습니다.
            </li>
          </ul>
        </div>
      </section>
      
      {/* 팁 박스 */}
      <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-sm space-y-4 md:space-y-0 text-center md:text-left">
        <div>
          <h3 className="text-indigo-800 dark:text-indigo-300 font-black text-lg mb-2 flex items-center justify-center md:justify-start">
            <span className="bg-indigo-600 text-white rounded-md w-6 h-6 flex items-center justify-center text-sm mr-2 shadow-sm">💡</span>
            담당자를 위한 프리미엄 팁
          </h3>
          <p className="text-indigo-600/90 dark:text-indigo-400/90 text-sm font-medium leading-relaxed max-w-2xl">
            관리가 필요한 게시판 상세뷰 상단의 <strong>[전체화면 보기]</strong> 버튼을 십분 활용해 보세요. 
            현수막이나 카탈로그 같은 넓은 레이아웃 파일의 피드백 마커 번호를 선명하게 파악할 수 있는 가장 쾌적한 뷰어 역할을 해줍니다!
          </p>
        </div>
      </div>
    </div>
  );
}
