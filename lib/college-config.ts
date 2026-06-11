import fs from "fs";
import path from "path";

export interface CollegeConfig {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  phone: string;
}

/**
 * Reads college details from .env file.
 * Handles both standard dotenv (KEY=VALUE) and colon format (KEY:"VALUE").
 */
export function getCollegeConfig(): CollegeConfig {
  const config: Record<string, string> = {};

  try {
    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        // Match KEY=VALUE or KEY:"VALUE" or KEY:VALUE
        const match = trimmed.match(/^([A-Z_]+)[=:](.*)$/);
        if (match) {
          const key = match[1].trim();
          let val = match[2].trim();
          // Strip wrapping quotes
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1);
          }
          if (key.startsWith("COLLEGE_")) {
            config[key] = val;
          }
        }
      }
    }
  } catch {
    // Silently fall back to defaults
  }

  return {
    name: config.COLLEGE_NAME || "SANT SANDHYA DAS MAHILA COLLEGE",
    address: config.COLLEGE_ADDRESS || "BARH",
    city: config.COLLEGE_CITY || "PATNA",
    state: config.COLLEGE_STATE || "BIHAR",
    pincode: config.COLLEGE_PINCODE || "803213",
    email: config.COLLEGE_EMAIL || "ssdm@gmail.com",
    phone: config.COLLEGE_PHONE || "XXXXXXXXXX",
  };
}
