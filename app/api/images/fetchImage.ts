const PEXELS_API = process.env.PEXELS_API_KEY;

export async function fetchImageUrl(query: string) {
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(
        query
      )}&per_page=1`,
      {
        headers: {
          Authorization: PEXELS_API || "",
        },
      }
    );

    if (!res.ok) {
      console.error("Pexels API error", await res.text());
    }

    const data = await res.json();
    return data?.photos?.[0].src?.medium || null;
  } catch (err) {
    console.error("Image fetch error", err);
    return null;
  }
}
