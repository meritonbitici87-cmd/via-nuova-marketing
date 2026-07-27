import { BusinessProfile, GenerationOptions } from "./prompts/types";
import { buildInstagramPrompt } from "./prompts/instagram";
import { buildFacebookPrompt } from "./prompts/facebook";
import { buildGoogleBusinessPrompt } from "./prompts/google-business";
import { buildBlogPrompt } from "./prompts/blog";
import { buildStoryPrompt } from "./prompts/story";
import { buildReelScriptPrompt } from "./prompts/reel-script";
import { buildTiktokScriptPrompt } from "./prompts/tiktok-script";
import { buildNewsletterPrompt } from "./prompts/newsletter";
import { buildAdCopyPrompt } from "./prompts/ad-copy";
import { buildMenuDescriptionPrompt } from "./prompts/menu-description";
import { buildOfferPrompt } from "./prompts/offer";
import { buildSeasonalCampaignPrompt } from "./prompts/seasonal-campaign";
import { buildHolidayPromoPrompt } from "./prompts/holiday-promo";
import { buildFaqPrompt } from "./prompts/faq";
import { buildBirthdayMessagePrompt } from "./prompts/birthday-message";
import { buildWinbackMessagePrompt } from "./prompts/winback-message";
import { buildPhotoShootGuidePrompt } from "./prompts/photo-shoot-guide";

// Zentrale Registry für alle "normalen" Content-Typen (alles außer Bewertungsantworten,
// die einen eigenen Flow haben, weil sie sich auf eine konkrete Review beziehen statt
// auf Wochentag/Anlass/Thema).
export const CONTENT_TYPES: Record<
  string,
  {
    build: (business: BusinessProfile, options: GenerationOptions) => string;
    requiredFields: (keyof GenerationOptions)[];
  }
> = {
  instagram: { build: buildInstagramPrompt, requiredFields: ["weekday"] },
  facebook: { build: buildFacebookPrompt, requiredFields: ["weekday"] },
  google_business: { build: buildGoogleBusinessPrompt, requiredFields: ["weekday"] },
  blog: { build: buildBlogPrompt, requiredFields: ["topic"] },
  story: { build: buildStoryPrompt, requiredFields: ["weekday"] },
  reel_script: { build: buildReelScriptPrompt, requiredFields: ["weekday"] },
  tiktok_script: { build: buildTiktokScriptPrompt, requiredFields: ["weekday"] },
  newsletter: { build: buildNewsletterPrompt, requiredFields: ["topic"] },
  ad_copy: { build: buildAdCopyPrompt, requiredFields: ["topic"] },
  menu_description: { build: buildMenuDescriptionPrompt, requiredFields: ["dishName"] },
  offer: { build: buildOfferPrompt, requiredFields: ["offerDetails"] },
  seasonal_campaign: { build: buildSeasonalCampaignPrompt, requiredFields: ["season"] },
  holiday_promo: { build: buildHolidayPromoPrompt, requiredFields: ["holiday"] },
  faq: { build: buildFaqPrompt, requiredFields: ["topic"] },
  customer_birthday: { build: buildBirthdayMessagePrompt, requiredFields: ["customerName"] },
  customer_winback: { build: buildWinbackMessagePrompt, requiredFields: ["customerName"] },
  photo_shoot_guide: { build: buildPhotoShootGuidePrompt, requiredFields: [] },
};

export function validateOptions(
  type: string,
  options: GenerationOptions
): string[] {
  const config = CONTENT_TYPES[type];
  if (!config) return [`Unbekannter Content-Typ "${type}".`];
  return config.requiredFields
    .filter((field) => !options[field])
    .map((field) => field as string);
}
