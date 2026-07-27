export interface BusinessProfile {
  name: string;
  address: string;
  specialties: string[];
  toneOfVoice: string;
}

// Nicht jeder Content-Typ braucht jedes Feld (Blog braucht z.B. "topic" statt "weekday").
// Die Route validiert je nach Typ, welche Felder Pflicht sind.
export interface GenerationOptions {
  weekday?: string;
  occasion?: string;
  topic?: string;
  dishName?: string;
  offerDetails?: string;
  season?: string;
  holiday?: string;
  customerName?: string;
  customerContext?: string;
}
