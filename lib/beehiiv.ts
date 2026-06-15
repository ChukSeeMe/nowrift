export async function subscribeToBeehiiv(email: string) {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (!apiKey || !publicationId) {
    console.warn('Beehiiv environment variables missing. Skipping external sync.');
    return { id: 'mock_beehiiv_id' };
  }

  try {
    const res = await fetch(`https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: true,
        send_welcome_email: true,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Beehiiv API Error: ${errorText}`);
    }

    const json = await res.json();
    return { id: json?.data?.id || 'mock_beehiiv_id' };
  } catch (err) {
    console.error('Error syncing to Beehiiv:', err);
    throw err;
  }
}
