export async function sendViewEvent(event) {
  try {
    await fetch('/events/view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
  } catch (err) {
    // לא מפילים את האפליקציה בגלל ניטור
    console.error('Failed to send view event', err);
  }
}

