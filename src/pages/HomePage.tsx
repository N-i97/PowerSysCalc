import { Hero } from '../components/home/Hero';
import { CategoryGrid, FeaturedCalculators, QuickAccess, EngineeringPrinciples, StandardsStrip } from '../components/home/HomeSections';

export function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedCalculators />
      <QuickAccess />
      <EngineeringPrinciples />
      <StandardsStrip />
    </>
  );
}
