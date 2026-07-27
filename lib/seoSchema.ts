interface BusinessForSchema {
  name: string;
  address: string;
  phone: string | null;
}

interface ReviewForSchema {
  rating: number;
  reviewText: string;
  reviewerName: string | null;
}

// Zerlegt die im Business gespeicherte Adresse ("Straße Hausnr., PLZ Stadt") in ein
// strukturiertes schema.org PostalAddress-Objekt. Falls das Format nicht passt, wird
// die Adresse als reiner String übernommen (immer noch gültiges schema.org, nur weniger
// strukturiert) statt Daten zu erfinden.
function buildAddress(address: string) {
  const match = address.match(/^(.+?),\s*(\d{4,5})\s+(.+)$/);
  if (!match) return address;
  const [, streetAddress, postalCode, addressLocality] = match;
  return {
    "@type": "PostalAddress",
    streetAddress: streetAddress.trim(),
    postalCode: postalCode.trim(),
    addressLocality: addressLocality.trim(),
    addressCountry: "DE",
  };
}

// Baut ein schema.org/JSON-LD-Objekt vom Typ "Restaurant" auf Basis der real gespeicherten
// Business- und Bewertungsdaten. Enthält bewusst NUR Felder, für die wir echte Daten haben
// (kein erfundenes priceRange/openingHours), damit die strukturierten Daten korrekt bleiben.
export function buildLocalBusinessSchema(
  business: BusinessForSchema,
  reviews: ReviewForSchema[]
) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: business.name,
    address: buildAddress(business.address),
    servesCuisine: "Italian",
  };

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(avgRating.toFixed(1)),
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    schema.review = reviews.slice(0, 10).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.reviewerName ?? "Anonym" },
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      reviewBody: r.reviewText,
    }));
  }

  return schema;
}

export function buildScriptTag(schema: Record<string, unknown>): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
