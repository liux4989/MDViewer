/**
 * Obsidian Navigator Interface
 * Defines the contract for navigation operations within Obsidian
 */

export interface IObsidianNavigator {
  /**
   * Navigate to a specific line in the active editor
   * @param line - The line number to navigate to (0-indexed)
   * @param options - Optional navigation options
   * @param options.center - Whether to center the line in the viewport (default: true)
   */
  goToLine(line: number, options?: { center?: boolean }): void;
}
