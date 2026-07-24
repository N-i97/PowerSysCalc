import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CalculatorPage, CategoryPage, NotFoundPage } from './pages/CalculatorPage';
import { StandardsPage, AboutPage, MethodologyPage, FaqPage } from './pages/StaticPages';
import { Icon, LiveDot } from './components/ui/Icon';

function PageLoader() {
  return (
    <div className="container-px mx-auto max-w-3xl py-24 text-center">
      <div className="inline-flex h-12 w-12 items-center justify-center border-2 border-ink-900 bg-paper-bright">
        <Icon name="bolt" className="h-6 w-6 text-live animate-pulse" />
      </div>
      <div className="mt-4 text-2xs font-mono uppercase tracking-datasheet text-ink-600 flex items-center justify-center gap-1.5">
        <LiveDot /> Loading…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/:slug" element={<CalculatorPage />} />
          <Route path="/standards" element={<StandardsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
