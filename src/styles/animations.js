import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Animate masonry grid items on scroll.
 * Call this after the grid is rendered.
 * @param {string} containerSelector - CSS selector for the grid container
 * @param {string} itemSelector      - CSS selector for each card inside the grid
 */
export function initMasonryScrollAnim(containerSelector = '.art-grid', itemSelector = '.art-grid__item') {
  const items = gsap.utils.toArray(`${containerSelector} ${itemSelector}`);
  if (!items.length) return;

  items.forEach((item, i) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 92%',
          toggleActions: 'play none none none',
        },
        delay: (i % 4) * 0.08, // stagger per column
      }
    );
  });
}

/**
 * Animate the hero copy elements on load.
 */
export function initHeroEntrance(selectors = ['.hero__label', '.hero__title', '.hero__subtitle', '.hero__ctas']) {
  gsap.fromTo(
    selectors,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.12,
      duration: 0.9,
      ease: 'expo.out',
      delay: 0.2,
    }
  );
}

/**
 * Animate any section heading when it enters the viewport.
 */
export function initSectionHeadings(selector = '[data-anim="heading"]') {
  const els = gsap.utils.toArray(selector);
  els.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
        },
      }
    );
  });
}

/**
 * Kill all ScrollTrigger instances — call on component unmount.
 */
export function killAllTriggers() {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export { gsap, ScrollTrigger };
