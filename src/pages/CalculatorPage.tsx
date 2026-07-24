import { Link, useParams } from 'react-router-dom';
import { ALL_CALCULATORS, CATEGORIES, calculatorsByCategory } from '../data/registry';
import { CalculatorLayout } from '../components/calculator/CalculatorLayout';
import { Icon } from '../components/ui/Icon';
import { useEffect } from 'react';
import { useSEO } from '../hooks/useSEO';

export function CalculatorPage() {
  const { slug = '' } = useParams();
  const def = ALL_CALCULATORS.find((c) => c.slug === slug);

  useSEO({
    title: def?.seo.title ?? 'Calculator not found · PowerSys Calc',
    description: def?.seo.description ?? 'Engineering calculator not found.',
    canonicalPath: `/${slug}`,
  });

  if (!def) {
    return <NotFoundCalc />;
  }
  return <CalculatorLayout def={def} />;
}

function NotFoundCalc() {
  return (
    <div className="container-px mx-auto max-w-3xl py-20 text-center">
      <div className="eyebrow mb-2 text-signal-warn">404 · Unknown calculator</div>
      <h1 className="text-3xl font-display font-semibold text-ink">That calculator doesn’t exist (yet)</h1>
      <p className="text-ink-600 mt-2">The slug you opened isn’t in the registry. Browse the toolbox to find what you need.</p>
      <div className="mt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-live hover:text-live-600 font-mono uppercase tracking-datasheet text-2xs">
          <Icon name="arrow-left" className="h-3.5 w-3.5" /> Back to home
        </Link>
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { id = '' } = useParams();
  const cat = CATEGORIES.find((c) => c.id === id);
  const items = calculatorsByCategory().get(id as never) ?? [];

  useSEO({
    title: cat ? `${cat.label} Calculators | PowerSys Calc` : 'Category',
    description: cat?.tagline ?? 'Browse engineering calculators by category.',
    canonicalPath: `/category/${id}`,
  });

  if (!cat) {
    return (
      <div className="container-px mx-auto max-w-3xl py-20 text-center">
        <h1 className="text-3xl font-display font-semibold text-ink">Category not found</h1>
      </div>
    );
  }

  return (
    <div className="container-px mx-auto max-w-[1500px] py-8">
      <div className="text-2xs font-mono uppercase tracking-datasheet text-ink-600 mb-3 flex items-center gap-2">
        <Link to="/" className="hover:text-live">Home</Link>
        <span className="text-ink-400">/</span>
        <span className="text-ink">{cat.label}</span>
      </div>
      <header className="mb-8 pb-3 border-b-2 border-ink-900 flex items-center gap-4">
        <span className="inline-flex h-12 w-12 items-center justify-center border-2 border-ink-900 bg-paper-bright text-ink shrink-0">
          <Icon name={cat.icon} className="h-6 w-6" />
        </span>
        <div>
          <div className="eyebrow">Category · {String(items.length).padStart(2, '0')} tools</div>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold text-ink tracking-tight">{cat.label}</h1>
          <p className="text-sm text-ink-700 mt-1 max-w-2xl">{cat.tagline}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((c) => (
          <Link
            key={c.slug}
            to={`/${c.slug}`}
            className="group bg-paper-bright border border-rule p-5 hover:border-ink-900 transition-colors"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center border border-ink-900 bg-paper text-ink">
                <Icon name={c.icon ?? 'bolt'} className="h-4 w-4" />
              </span>
              {c.featured ? <span className="stamp">Featured</span> : null}
            </div>
            <h3 className="mt-3 text-base font-display font-semibold text-ink group-hover:text-live">{c.title}</h3>
            <p className="mt-1 text-2xs text-ink-600 leading-relaxed line-clamp-2">{c.tagline}</p>
            <div className="mt-3 flex items-center gap-1.5 text-2xs font-mono uppercase tracking-datasheet text-live">
              Open <Icon name="arrow-right" className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  useEffect(() => { document.title = 'Not found · PowerSys Calc'; }, []);
  return (
    <div className="container-px mx-auto max-w-2xl py-24 text-center">
      <div className="eyebrow text-signal-warn mb-2">404</div>
      <h1 className="text-4xl font-display font-semibold text-ink">Off the grid</h1>
      <p className="text-ink-600 mt-3">The page you tried to reach isn’t in the registry. Try the search or head back to the toolbox.</p>
      <Link to="/" className="inline-flex items-center gap-2 mt-6 text-live hover:text-live-600 font-mono uppercase tracking-datasheet text-2xs">
        <Icon name="arrow-left" className="h-3.5 w-3.5" /> Back home
      </Link>
    </div>
  );
}
