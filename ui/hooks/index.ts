/**
 * TOC UI Hooks
 * Facade hooks that depend only on ITocUIStore contract
 */

// Core hooks
export { useTocState, _setTocUIContext } from './useTocState';
export { useActiveHeading } from './useActiveHeading';
export { useTocMode } from './useTocMode';
export { useNavigate, type NavigationDirection } from './useNavigate';
