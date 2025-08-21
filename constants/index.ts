/**
 * Plugin constants and configuration values
 */

export const PLUGIN_ID = 'floating-toc';
export const PLUGIN_NAME = 'Floating TOC';

export const CSS_CLASSES = {
  OVERLAY: 'floating-toc-overlay',
  CONTAINER: 'floating-toc-container',
  HEADER: 'toc-header',
  LIST: 'toc-list',
  ITEM: 'toc-item',
  ITEM_ACTIVE: 'is-active',
  ITEM_WRAPPER: 'toc-item-wrapper',
  ITEM_TEXT: 'toc-item-text',
  ITEM_LEVEL: 'toc-item-level',
  ITEM_CHILDREN: 'toc-item-children',
  CONTROLS: 'toc-controls',
  CONTROL_BTN: 'toc-control-btn',
  EMPTY: 'toc-list-empty',
  EMPTY_MESSAGE: 'toc-empty-message'
} as const;

export const SELECTORS = {
  VIEW_CONTENT: '.view-content',
  MARKDOWN_VIEW: 'markdown'
} as const;

export const Z_INDEX = {
  OVERLAY: 1000,
  CONTAINER: 1001
} as const;

export const COMMANDS = {
  TOGGLE: 'toggle-floating-toc',
  REFRESH: 'refresh-toc'
} as const;