export default function Header() {
  return (
    <header className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">IA</span>
            </div>
            <h1 className="text-2xl font-bold">Investment Advisory</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="hover:text-emerald-400 transition-colors">How it Works</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Advisors</a>
            <a href="#" className="hover:text-emerald-400 transition-colors">Portfolio</a>
            <button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg transition-colors">
              Get Started
            </button>
          </div>
          <button className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}