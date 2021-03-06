// Format orchestrator errors
/* istanbul ignore next */
function formatError(e:any) {
  if (!e.error) {
    return e.message;
  }

  // PluginError
  if (typeof e.error.showStack === 'boolean') {
    return e.error.toString();
  }

  // Normal error
  if (e.error.stack) {
    return e.error.stack;
  }
  // Unknown (string, number, etc.)
  return new Error(String(e.error)).stack;
}

export default  formatError;
