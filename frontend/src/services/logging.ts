export async function reportFrontendError(payload: any) {
  try {
    await fetch('http://localhost:5000/api/logs/frontend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    // best-effort: log to console if remote logging fails
    console.error('Failed to send frontend log', e);
  }
}
