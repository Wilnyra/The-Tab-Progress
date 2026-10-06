// Allowlist sanitizer for SVG markup that is injected as HTML.
// Parses as image/svg+xml, keeps only known-safe elements and attributes,
// drops every on* handler, every href/xlink:href and every url(...)
// reference. Any <script> or <foreignObject> rejects the whole input.

const ALLOWED_ELEMENTS: ReadonlySet<string> = new Set([
  'svg',
  'g',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'defs',
  'clipPath',
  'style',
  'title',
])

const REJECTED_ELEMENTS: ReadonlySet<string> = new Set([
  'script',
  'foreignObject',
])

const ALLOWED_ATTRIBUTES: ReadonlySet<string> = new Set([
  'xmlns',
  'class',
  'viewBox',
  'preserveAspectRatio',
  'width',
  'height',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'd',
  'points',
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-opacity',
  'opacity',
  'transform',
  'style',
  'overflow',
  'role',
  'aria-label',
  'aria-hidden',
  'focusable',
  'data-activity',
  'data-dur',
  'data-attach',
])

// url() is the only way CSS can reach the network or another document;
// the rest guard against legacy script vectors.
const UNSAFE_CSS = /url\s*\(|@import|expression\s*\(|javascript:|behavior\s*:/i

const isUnsafeValue = (value: string): boolean =>
  UNSAFE_CSS.test(value) || /^\s*(javascript|data|vbscript):/i.test(value)

const sanitizeElement = (el: Element): void => {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name
    const drop =
      !ALLOWED_ATTRIBUTES.has(name) ||
      /^on/i.test(name) ||
      /href$/i.test(name) ||
      isUnsafeValue(attr.value)
    if (drop) el.removeAttribute(name)
  }
  for (const child of Array.from(el.children)) {
    if (!ALLOWED_ELEMENTS.has(child.localName)) {
      child.remove()
      continue
    }
    if (child.localName === 'style') {
      // a <style> may hold only plain CSS text
      const css = child.textContent ?? ''
      if (child.children.length > 0 || UNSAFE_CSS.test(css)) {
        child.remove()
        continue
      }
    }
    sanitizeElement(child)
  }
}

/**
 * Returns sanitized SVG markup, or an empty string when the input is not a
 * well-formed <svg> document or contains a rejected element.
 */
export const sanitizeSvg = (markup: string): string => {
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
  const root = doc.documentElement
  if (
    root.localName !== 'svg' ||
    doc.getElementsByTagName('parsererror').length > 0
  ) {
    return ''
  }
  for (const name of REJECTED_ELEMENTS) {
    if (doc.getElementsByTagName(name).length > 0) return ''
  }
  sanitizeElement(root)
  return new XMLSerializer().serializeToString(root)
}
