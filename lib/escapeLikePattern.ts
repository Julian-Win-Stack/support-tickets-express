/** Escape LIKE wildcards so user input is treated as literal. */
export function escapeLikePattern(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}
