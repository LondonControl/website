/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

// Props that exist only in framer-motion and must not be forwarded to DOM elements
const MOTION_PROP_KEYS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileInView',
  'whileFocus',
  'whileDrag',
  'viewport',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'onDragStart',
  'onDragEnd',
  'onDrag',
  'onAnimationStart',
  'onAnimationComplete',
]);

const filterMotionProps = (props: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(props).filter(([key]) => !MOTION_PROP_KEYS.has(key)),
  );

const createMotionComponent = (tag: string) => {
  const Component = React.forwardRef<HTMLElement, Record<string, any>>(
    ({ children, ...props }, ref) =>
      React.createElement(tag, { ref, ...filterMotionProps(props) }, children),
  );
  Component.displayName = `motion.${tag}`;
  return Component;
};

export const motion = {
  a: createMotionComponent('a'),
  article: createMotionComponent('article'),
  aside: createMotionComponent('aside'),
  button: createMotionComponent('button'),
  dd: createMotionComponent('dd'),
  div: createMotionComponent('div'),
  dl: createMotionComponent('dl'),
  dt: createMotionComponent('dt'),
  footer: createMotionComponent('footer'),
  form: createMotionComponent('form'),
  h1: createMotionComponent('h1'),
  h2: createMotionComponent('h2'),
  h3: createMotionComponent('h3'),
  header: createMotionComponent('header'),
  img: createMotionComponent('img'),
  input: createMotionComponent('input'),
  li: createMotionComponent('li'),
  main: createMotionComponent('main'),
  nav: createMotionComponent('nav'),
  ol: createMotionComponent('ol'),
  p: createMotionComponent('p'),
  path: createMotionComponent('path'),
  section: createMotionComponent('section'),
  span: createMotionComponent('span'),
  svg: createMotionComponent('svg'),
  ul: createMotionComponent('ul'),
};

export const AnimatePresence = ({
  children,
}: {
  children: React.ReactNode;
  mode?: string;
  initial?: boolean;
}) => <>{children}</>;

export const useAnimation = () => ({
  start: jest.fn().mockResolvedValue(undefined),
  stop: jest.fn(),
  set: jest.fn(),
  mount: jest.fn(),
});

export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: jest.fn(),
  onChange: jest.fn(),
  on: jest.fn(),
  clearListeners: jest.fn(),
});

export const useSpring = (initial: number) => useMotionValue(initial);
export const useTransform = jest.fn(() => useMotionValue(0));
export const useInView = jest.fn(() => true);
export const useScroll = jest.fn(() => ({
  scrollY: useMotionValue(0),
  scrollX: useMotionValue(0),
  scrollYProgress: useMotionValue(0),
  scrollXProgress: useMotionValue(0),
}));

export const easeOut = jest.fn();
export const easeIn = jest.fn();
export const easeInOut = jest.fn();
