import { useCallback, useEffect, useState } from 'react';
import './index.css';
import BorgWarnerLogo from './assets/BorgWarner.svg?react';
import type { SubmitEvent } from 'react';
import * as React from 'react';
import { useScan } from './hooks/useScan';
import { useImageReview } from './hooks/useImageReview';
import type { FaultItem } from './utils/faultUtils';

const APP_TITLE = 'CMI RVW';

const App = () => {
  const [view, setView] = useState<'main' | 'imageReview' | 'finalReview'>(
    'main',
  );
  const [unit, setUnit] = useState('');
  const [activeUnit, setActiveUnit] = useState('');
  const [error, setError] = useState<{ title: string; text: string } | null>(
    null,
  );

  const [faults, setFaults] = useState<FaultItem[]>([]);
  const [currentFaultIndex, setCurrentFaultIndex] = useState(0);
  const [reviewResult, setReviewResult] = useState<Array<'OK' | 'NOK'>>([]);

  const {
    handleScanSubmit: executeScan,
    isLoading: scanLoading,
    clearError: clearScanError,
  } = useScan();

  const { handleImageDecision: executeImageDecision, isLoading: reviewLoading } =
    useImageReview(reviewResult);

  const isLoading = scanLoading || reviewLoading;

  const [theme, setTheme] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eats-theme');
      return saved || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('eats-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('eats-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  const dismissError = useCallback(() => {
    setError(null);
    clearScanError();
  }, [clearScanError]);

  const reset = useCallback(() => {
    setUnit('');
    setActiveUnit('');
    setView('main');
    setError(null);
    setFaults([]);
    setCurrentFaultIndex(0);
    setReviewResult([]);
  }, []);

  const handleScanSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    const result = await executeScan(unit);
    if (result && 'error' in result && result.error) {
      setError(result.error);
    } else if (result && 'faults' in result) {
      setFaults(result.faults);
      setActiveUnit(result.unit);
      setCurrentFaultIndex(0);
      setView('imageReview');
    }
  };

  const handleImageDecision = async (decision: 'OK' | 'NOK') => {
    const result = await executeImageDecision(
      decision,
      currentFaultIndex,
      faults.length,
      activeUnit,
    );

    if (result.error) {
      setError(result.error);
    } else if (result.isComplete) {
      setReviewResult(result.updatedResults);
      setView('finalReview');
    } else {
      setReviewResult(result.updatedResults);
      if (currentFaultIndex < faults.length - 1) {
        setCurrentFaultIndex((prev) => prev + 1);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full relative">
      {isLoading && <LoadingOverlay />}

      {error && (
        <ErrorOverlay
          title={error.title}
          text={error.text}
          onDismiss={dismissError}
        />
      )}
      <>
        <Header theme={theme} toggleTheme={toggleTheme} />

        <main className="flex-1 flex flex-col items-center justify-center pt-16 pb-16">
          {view === 'main' && (
            <ScanSection
              unit={unit}
              setUnit={setUnit}
              onSubmit={handleScanSubmit}
              onReset={reset}
            />
          )}

          {view === 'imageReview' && faults.length > 0 && (
            <ImageReviewSection
              currentFault={faults[currentFaultIndex]}
              currentIndex={currentFaultIndex}
              totalFaults={faults.length}
              onDecision={handleImageDecision}
            />
          )}

          {view === 'finalReview' && (
            <FinalSection
              onReset={reset}
              activeUnit={activeUnit}
            />
          )}
        </main>

        <Footer />
      </>
    </div>
  );
};

const ImageReviewSection = ({
  currentFault,
  currentIndex,
  totalFaults,
  onDecision,
}: {
  currentFault: FaultItem;
  currentIndex: number;
  totalFaults: number;
  onDecision: (decision: 'OK' | 'NOK') => void;
}) => (
  <section
    className="flex-1 flex flex-col items-center justify-center p-4 w-full h-full"
    id="image-review-section"
  >
    <div className="animate-fade-in bg-linear-to-b from-white to-slate-50 dark:from-bw-card dark:to-[#050505] border border-slate-200 dark:border-bw-green/30 rounded-2xl p-2 sm:p-4 w-full max-w-5xl shadow-lg flex flex-col items-center max-h-[80vh]">
      <div className="w-full flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-xl font-bold text-cyan-600 dark:text-bw-green">
          Weryfikacja błędu:{' '}
          <span className="text-red-500">Krok {currentFault.fault_code}</span>
        </h2>
        <span className="text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-sm">
          Zdjęcie {currentIndex + 1} z {totalFaults}
        </span>
      </div>

      <div
        className="w-full flex-1 min-h-0 bg-black/5 dark:bg-black/20 rounded-xl mb-4 sm:mb-6 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800 p-2 sm:p-4 [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: currentFault.imageUrl }}
      />

      <div className="grid grid-cols-2 gap-6 w-full max-w-md shrink-0">
        <button
          onClick={() => onDecision('OK')}
          className="py-4 text-white font-extrabold text-xl rounded-xl bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 transition-all duration-300 shadow-lg shadow-emerald-500/20 tracking-widest cursor-pointer"
        >
          OK
        </button>
        <button
          onClick={() => onDecision('NOK')}
          className="py-4 text-white font-extrabold text-xl rounded-xl bg-linear-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 transition-all duration-300 shadow-lg shadow-red-500/20 tracking-widest cursor-pointer"
        >
          NOK
        </button>
      </div>
    </div>
  </section>
);

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-49 flex items-center justify-center bg-white/80 dark:bg-[#030303]/80 backdrop-blur-sm transition-opacity duration-300">
    <div className="flex flex-col items-center text-center gap-4">
      <svg
        className="spinner"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3Z"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          className="spinner-accent"
          d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-xl text-slate-800 dark:text-slate-200 font-rajdhani font-semibold animate-breath">
        Proszę czekać...
      </p>
    </div>
  </div>
);

const ErrorOverlay = ({
  title,
  text,
  onDismiss,
}: {
  title: string;
  text: string;
  onDismiss: () => void;
}) => (
  <div
    className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    onClick={onDismiss}
  >
    <div
      className="animate-fade-in bg-linear-to-b from-bw-card to-[#050505] border border-bw-green/30 text-white p-8 rounded-2xl text-center max-w-md shadow-[0_0_32px_rgba(46,250,217,0.12)] relative mx-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-transparent via-red-500 to-transparent rounded-full"></div>
      <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-900/20 mb-4">
        <svg
          className="h-7 w-7 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-3 text-red-400">{title}</h2>
      <p className="text-slate-300 mb-6 leading-relaxed">{text}</p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={onDismiss}
          className="px-6 py-2 bg-linear-to-r from-slate-600 to-slate-500 hover:from-slate-500 hover:to-slate-400 text-white font-bold rounded-lg border-0 transition-all duration-300 shadow-lg text-sm tracking-wide cursor-pointer"
        >
          Zamknij
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-lg border-0 transition-all duration-300 shadow-lg text-sm tracking-wide cursor-pointer"
        >
          Odśwież
        </button>
      </div>
    </div>
  </div>
);

const Header = ({
  theme,
  toggleTheme,
}: {
  theme: string;
  toggleTheme: () => void;
}) => (
  <header className="fixed top-0 inset-x-0 z-100 h-16 bg-white/80 dark:bg-bw-blue/80 backdrop-blur-lg border-b border-slate-200 dark:border-bw-green/30 flex items-center justify-between px-8 transition-colors duration-300 shadow-sm">
    <BorgWarnerLogo className="h-4 w-auto shrink-0 relative z-10" />
    <a
      href="#"
      className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl tracking-widest hover:opacity-75 hover:scale-[1.02] transition-all rounded animate-pulse-glow z-0 bg-linear-to-r from-cyan-500 to-blue-500 dark:from-bw-green dark:to-cyan-400 bg-clip-text text-transparent whitespace-nowrap"
    >
      {APP_TITLE}
    </a>
    <button
      onClick={toggleTheme}
      title="Toggle theme"
      className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-bw-input dark:to-bw-card hover:from-slate-200 hover:to-slate-300 dark:hover:from-bw-card dark:hover:to-[#111] border border-slate-300 dark:border-bw-green/50 cursor-pointer transition-all duration-300 outline-none text-xl z-10 shadow-md"
    >
      <span className="transition-transform duration-300 hover:scale-110 drop-shadow-md">
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  </header>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-fade-in bg-linear-to-b from-white to-slate-50 dark:from-bw-card dark:to-[#050505] border border-slate-200 dark:border-bw-green/30 rounded-2xl p-8 w-full max-w-md shadow-lg dark:shadow-[0_0_32px_rgba(46,250,217,0.08)] relative overflow-hidden transition-colors duration-300">
    <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-linear-to-r from-transparent via-cyan-400 dark:via-bw-green to-transparent rounded-full"></div>
    {children}
  </div>
);

/* ─── Scan Section (Main Form) ──────────────────────────────────────── */
const ScanSection = ({
  unit,
  setUnit,
  onSubmit,
  onReset,
}: {
  unit: string;
  setUnit: (v: string) => void;
  onSubmit: (e: SubmitEvent<HTMLFormElement>) => void;
  onReset: () => void;
}) => (
  <section
    className="flex-1 flex items-center justify-center p-4 relative z-10 w-full"
    id="main-section"
  >
    <Card>
      <form id="main" onSubmit={onSubmit}>
        <label
          htmlFor="unit"
          className="block mb-3 text-cyan-600 dark:text-bw-green tracking-wide leading-snug text-lg"
        >
          Zeskanuj część:
        </label>
        <input
          type="text"
          id="unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value.toUpperCase())}
          className="w-full px-4 py-3 mb-5 bg-slate-50 dark:bg-bw-input border-2 border-slate-300 dark:border-bw-green/30 rounded-xl text-slate-800 dark:text-yellow-300 font-mono text-lg tracking-[0.12em] text-center uppercase outline-none caret-amber-400 focus:border-cyan-500 dark:focus:border-bw-green transition-all shadow-inner"
          autoComplete="off"
          autoFocus
        />
        <div className="flex gap-3 mt-4 flex-wrap items-center pb-2">
          <input
            type="submit"
            id="submitBtn"
            className="px-6 py-2 bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-lg cursor-pointer border-0 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 text-sm tracking-wide"
            value="Zatwierdź"
          />
          <input
            type="reset"
            onClick={onReset}
            className="px-6 py-2 bg-linear-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-bold rounded-lg cursor-pointer border-0 transition-all duration-300 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 text-sm tracking-wide"
            value="Reset"
          />
        </div>
      </form>
    </Card>
  </section>
);

/* ─── Footer ────────────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-[#030303]/90 backdrop-blur-md border-t border-slate-200 dark:border-bw-green/20 px-8 py-3 flex flex-wrap gap-2 items-center justify-between text-sm text-slate-500 dark:text-slate-400 transition-colors duration-300 z-50">
    <div className="flex items-center gap-3 flex-wrap">
      <span>Developed by: Mateusz Zielinski</span>
      <span className="opacity-40">|</span>
      <a
        href="mailto:matzielinski@borgwarner.com"
        className="text-cyan-600 dark:text-bw-green underline decoration-dotted hover:opacity-75"
      >
        matzielinski@borgwarner.com
      </a>
    </div>
    <span>&copy; 2026 BorgWarner. All rights reserved.</span>
  </footer>
);

/* ─── Final Section (Widok Końcowy) ─────────────────────────────────── */
const FinalSection = ({
  onReset,
  activeUnit,
}: {
  onReset: () => void;
  activeUnit: string;
}) => (
  <section
    className="flex-1 flex items-center justify-center p-4 relative z-10 w-full"
    id="final-section"
  >
    <Card>
      <div className="flex flex-col items-center text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-6 shadow-inner">
          <svg
            className="h-8 w-8 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
          Weryfikacja zakończona
        </h2>

        <p className="text-xl font-medium text-cyan-600 dark:text-bw-green mb-8">
          Proces dodany na: {activeUnit}
        </p>

        <button
          onClick={onReset}
          className="px-8 py-3 bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl cursor-pointer border-0 transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 tracking-wide"
        >
          Zeskanuj kolejną część
        </button>
      </div>
    </Card>
  </section>
);

export default App;
