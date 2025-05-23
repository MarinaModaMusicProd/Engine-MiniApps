import {HTMLMotionProps} from 'framer-motion';

export const PopoverAnimation: Pick<
  HTMLMotionProps<'div'>,
  'initial' | 'animate' | 'exit' | 'transition'
> = {
  initial: {opacity: 0, y: 5},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, y: 5},
  transition: {type: 'tween', duration: 0.125},
};
