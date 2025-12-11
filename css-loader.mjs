export async function load(url, context, nextLoad) {
  // Ignore CSS imports
  if (url.endsWith('.css') || url.includes('.css?')) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    }
  }
  return nextLoad(url, context)
}
