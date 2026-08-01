/**
 * Elysium Contact Import Service
 *
 * Wraps expo-contacts for phone contact import and matching.
 * Falls back to simulated contacts when native modules are unavailable.
 *
 * This module is a NEW file — it does not alter any existing code.
 * The onboarding "Find People" step and connections screen can import
 * this service to offer real phone contact import.
 *
 * Usage:
 *   import { ContactImport } from "@/services/contact-import";
 *   const contacts = await ContactImport.getPhoneContacts();
 *   const matches = await ContactImport.findElysiumUsers(contacts);
 */

import { Platform, Alert } from "react-native";

// ── Types ──────────────────────────────────────────────────────

export interface PhoneContact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumbers: string[];
  emails: string[];
  avatarUri?: string;
}

export interface ContactMatch {
  contact: PhoneContact;
  elysiumUserId: string;
  elysiumName: string;
  elysiumHandle: string;
  matchConfidence: number; // 0-1
  matchType: "phone" | "email" | "name";
}

export interface ImportResult {
  totalContacts: number;
  matchedUsers: ContactMatch[];
  importedCount: number;
  skippedCount: number;
}

// ── Service ────────────────────────────────────────────────────

class ContactImportServiceImpl {
  private cachedContacts: PhoneContact[] | null = null;
  private permissionGranted: boolean | null = null;

  /**
   * Check if contact import is available on this platform.
   */
  isAvailable(): boolean {
    if (Platform.OS === "web") return false;
    return Platform.OS === "ios" || Platform.OS === "android";
  }

  /**
   * Request permission to access contacts.
   * Returns true if granted.
   */
  async requestPermission(): Promise<boolean> {
    if (this.permissionGranted !== null) return this.permissionGranted;
    if (Platform.OS === "web") {
      this.permissionGranted = false;
      return false;
    }

    try {
      const { requestPermissionsAsync } = (await import("expo-contacts")) as any;
      const { status } = await requestPermissionsAsync();
      this.permissionGranted = status === "granted";
      return this.permissionGranted;
    } catch {
      this.permissionGranted = false;
      return false;
    }
  }

  /**
   * Get all phone contacts.
   * Returns cached results if available.
   */
  async getPhoneContacts(): Promise<PhoneContact[]> {
    if (this.cachedContacts) return this.cachedContacts;

    if (!this.isAvailable()) {
      return this.getSimulatedContacts();
    }

    const granted = await this.requestPermission();
    if (!granted) {
      Alert.alert(
        "Contacts Access",
        "Elysium needs access to your contacts to find your people. You can enable this in Settings.",
      );
      return [];
    }

    try {
      const { getContactsAsync, Fields } = (await import("expo-contacts")) as any;
      const { data } = await getContactsAsync({
        fields: [Fields.PhoneNumbers, Fields.Emails, Fields.FirstName, Fields.LastName],
        sort: "firstName",
      });

      const contacts: PhoneContact[] = data.map((c: any) => ({
        id: c.id ?? `sim-${Math.random().toString(36).slice(2)}`,
        firstName: c.firstName ?? "",
        lastName: c.lastName ?? "",
        phoneNumbers: (c.phoneNumbers ?? []).map((p: any) => p.number ?? "").filter(Boolean),
        emails: (c.emails ?? []).map((e: any) => e.email ?? "").filter(Boolean),
      }));

      this.cachedContacts = contacts;
      return contacts;
    } catch {
      return this.getSimulatedContacts();
    }
  }

  /**
   * Match phone contacts against Elysium users.
   * In a real app, this would call a server-side API.
   * For now, it uses fuzzy name matching against seed users.
   */
  async findElysiumUsers(
    contacts: PhoneContact[],
    elysiumUsers: Array<{ id: string; name: string; handle: string; city: string }>,
  ): Promise<ContactMatch[]> {
    const matches: ContactMatch[] = [];

    for (const contact of contacts) {
      const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase().trim();

      for (const user of elysiumUsers) {
        const userName = user.name.toLowerCase();
        const nameParts = userName.split(" ");

        // Check name match
        let confidence = 0;
        let matchType: ContactMatch["matchType"] = "name";

        if (fullName === userName) {
          confidence = 0.9;
          matchType = "name";
        } else if (fullName.includes(nameParts[0]) || nameParts[0].includes(contact.firstName.toLowerCase())) {
          confidence = 0.5;
          matchType = "name";
        }

        // Check phone match (would be server-side in production)
        // For now, we simulate with name-based matching

        if (confidence > 0.3) {
          matches.push({
            contact,
            elysiumUserId: user.id,
            elysiumName: user.name,
            elysiumHandle: user.handle,
            matchConfidence: confidence,
            matchType,
          });
        }
      }
    }

    // Sort by confidence, deduplicate by elysiumUserId
    const seen = new Set<string>();
    return matches
      .sort((a, b) => b.matchConfidence - a.matchConfidence)
      .filter((m) => {
        if (seen.has(m.elysiumUserId)) return false;
        seen.add(m.elysiumUserId);
        return true;
      });
  }

  /**
   * Import matched contacts — follow them on Elysium.
   * Returns the number of users imported.
   */
  async importContacts(
    matches: ContactMatch[],
    followFn: (userId: string) => void,
  ): Promise<ImportResult> {
    let importedCount = 0;
    let skippedCount = 0;

    for (const match of matches) {
      if (match.matchConfidence >= 0.5) {
        followFn(match.elysiumUserId);
        importedCount++;
      } else {
        skippedCount++;
      }
    }

    return {
      totalContacts: matches.length,
      matchedUsers: matches,
      importedCount,
      skippedCount,
    };
  }

  /**
   * Clear the cached contacts (e.g., after import).
   */
  clearCache(): void {
    this.cachedContacts = null;
  }

  // ── Simulated contacts for demo ───────────────────────────

  private getSimulatedContacts(): PhoneContact[] {
    return [
      { id: "sc-1", firstName: "Aria", lastName: "Volkov", phoneNumbers: ["+4912345678"], emails: ["aria@signal.berlin"] },
      { id: "sc-2", firstName: "Kenji", lastName: "Park", phoneNumbers: ["+8210111222"], emails: ["kenji@craft.dev"] },
      { id: "sc-3", firstName: "Noor", lastName: "Hadid", phoneNumbers: ["+9613456789"], emails: ["noor@atlas.poetry"] },
      { id: "sc-4", firstName: "Ines", lastName: "Castro", phoneNumbers: ["+5212345678"], emails: ["ines@glow.mx"] },
      { id: "sc-5", firstName: "Theo", lastName: "Marsh", phoneNumbers: ["+4412345678"], emails: ["theo@field.audio"] },
      { id: "sc-6", firstName: "Mira", lastName: "Okafor", phoneNumbers: ["+2341234567"], emails: ["mira@frame.lagos"] },
      { id: "sc-7", firstName: "Julien", lastName: "Marchand", phoneNumbers: ["+3312345678"], emails: ["julien@chef.lyon"] },
      { id: "sc-8", firstName: "Sam", lastName: "Rivera", phoneNumbers: ["+1415555123"], emails: ["sam@dev.io"] },
      { id: "sc-9", firstName: "Lena", lastName: "Schmidt", phoneNumbers: ["+491761234"], emails: ["lena@music.berlin"] },
      { id: "sc-10", firstName: "Kai", lastName: "Tanaka", phoneNumbers: ["+8131234567"], emails: ["kai@design.tokyo"] },
    ];
  }
}

export const ContactImport = new ContactImportServiceImpl();
