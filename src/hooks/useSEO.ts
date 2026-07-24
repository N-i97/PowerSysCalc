import { useEffect } from 'react';

interface SeoOptions {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
}

export function useSEO({ title, description, keywords = [], canonicalPath }: SeoOptions) {
  useEffect(() => {
    const prev = {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
      kw:   document.querySelector('meta[name="keywords"]')?.getAttribute('content') ?? '',
      ogT:  document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '',
      ogD:  document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? '',
      ogU:  document.querySelector('meta[property="og:url"]')?.getAttribute('content') ?? '',
    };

    document.title = title;
    setMeta('name', 'description', description);
    if (keywords.length) setMeta('name', 'keywords', keywords.join(', '));
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    if (canonicalPath) {
      setMeta('property', 'og:url', new URL(canonicalPath, window.location.origin).toString());
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = new URL(canonicalPath, window.location.origin).toString();
    }

    return () => {
      document.title = prev.title;
      setMeta('name', 'description', prev.desc);
      setMeta('name', 'keywords', prev.kw);
      setMeta('property', 'og:title', prev.ogT);
      setMeta('property', 'og:description', prev.ogD);
      setMeta('property', 'og:url', prev.ogU);
    };
  }, [title, description, keywords.join(','), canonicalPath]);
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}
