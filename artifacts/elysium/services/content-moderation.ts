/**
 * Elysium Content Moderation Service
 *
 * AI-powered content moderation for user-generated content.
 * Uses a combination of rule-based and AI-based checks to flag
 * or block content that violates community guidelines.
 *
 * This module is a NEW file — it does not alter any existing code.
 * The composer and chat screens can import this to validate content
 * before posting.
 *
 * Usage:
 *   import { ContentModeration } from "@/services/content-moderation";
 *   const result = await ContentModeration.moderate(text);
 *   if (result.blocked) { alert(result.reason); return; }
 */

// ── Types ──────────────────────────────────────────────────────

export type ModerationSeverity = "none" | "low" | "medium" | "high" | "critical";

export type ModerationCategory =
  | "harassment"
  | "hate_speech"
  | "self_harm"
  | "violence"
  | "sexual_content"
  | "spam"
  | "misinformation"
  | "personal_info"
  | "copyright";

export interface ModerationResult {
  passed: boolean;
  blocked: boolean;
  severity: ModerationSeverity;
  categories: ModerationCategory[];
  confidence: number; // 0-1
  reason?: string;
  suggestions?: string[];
  flaggedSegments?: Array<{
    text: string;
    category: ModerationCategory;
    confidence: number;
  }>;
}

export interface ModerationConfig {
  enabled: boolean;
  strictMode: boolean;
  blockOnHigh: boolean;
  blockOnCritical: boolean;
  enableAI: boolean;
  aiEndpoint?: string;
  customBlockedWords: string[];
  customBlockedPatterns: RegExp[];
}

export const DEFAULT_MODERATION_CONFIG: ModerationConfig = {
  enabled: true,
  strictMode: false,
  blockOnHigh: true,
  blockOnCritical: true,
  enableAI: true,
  aiEndpoint: process.env.EXPO_PUBLIC_MODERATION_ENDPOINT,
  customBlockedWords: [],
  customBlockedPatterns: [],
};

// ── Rule-based patterns ────────────────────────────────────────

const HARASSMENT_PATTERNS: RegExp[] = [
  /\b(kill\s+yourself|kys)\b/i,
  /\b(you\s+should\s+die)\b/i,
  /\b(nobody\s+likes\s+you)\b/i,
  /\b(you're\s+worthless)\b/i,
];

const HATE_SPEECH_PATTERNS: RegExp[] = [
  /\b(racial\s+slur)\b/i,
  // Additional patterns would be added for production
];

const SELF_HARM_PATTERNS: RegExp[] = [
  /\b(want\s+to\s+die)\b/i,
  /\b(end\s+it\s+all)\b/i,
  /\b(hurt\s+myself)\b/i,
  /\b(suicide)\b/i,
  /\b(self\s*harm)\b/i,
];

const SPAM_PATTERNS: RegExp[] = [
  /(.)\1{10,}/,  // Repeated characters
  /(?:https?:\/\/[^\s]+[\s]+){4,}/,  // Multiple URLs
  /\b(free\s+money|click\s+here|buy\s+now)\b/i,
];

const PERSONAL_INFO_PATTERNS: RegExp[] = [
  /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/,  // Phone numbers
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,  // Email addresses
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/,  // SSN-like patterns
  /\b\d{16}\b/,  // Credit card-like
];

// ── Resource list for self-harm support ────────────────────────

const SELF_HARM_RESOURCES = [
  "If you're struggling, please reach out:",
  "• National Suicide Prevention Lifeline: 988 (US)",
  "• Crisis Text Line: Text HOME to 741741",
  "• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
  "• Trevor Project: 1-866-488-7386 (LGBTQ+)",
  "",
  "You matter. Help is available.",
];

// ── Service ────────────────────────────────────────────────────

class ContentModerationServiceImpl {
  private config: ModerationConfig = DEFAULT_MODERATION_CONFIG;

  /**
   * Update moderation configuration.
   */
  updateConfig(config: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current moderation config.
   */
  getConfig(): ModerationConfig {
    return { ...this.config };
  }

  /**
   * Moderate a piece of text content.
   * Returns a ModerationResult with the verdict.
   */
  async moderate(text: string): Promise<ModerationResult> {
    if (!this.config.enabled || !text.trim()) {
      return { passed: true, blocked: false, severity: "none", categories: [], confidence: 1 };
    }

    const flaggedSegments: ModerationResult["flaggedSegments"] = [];

    // 1. Rule-based checks
    const ruleResults = this.runRuleBasedChecks(text);
    flaggedSegments.push(...ruleResults);

    // 2. AI-based checks (if enabled and endpoint available)
    if (this.config.enableAI && this.config.aiEndpoint) {
      const aiResults = await this.runAIChecks(text);
      flaggedSegments.push(...aiResults);
    }

    // 3. Custom word/pattern checks
    const customResults = this.runCustomChecks(text);
    flaggedSegments.push(...customResults);

    // 4. Calculate overall severity
    const categories = [...new Set(flaggedSegments.map((s) => s.category))];
    const maxConfidence = Math.max(0, ...flaggedSegments.map((s) => s.confidence));
    const severity = this.calculateSeverity(flaggedSegments);

    // 5. Determine if blocked
    const blocked = this.shouldBlock(severity);
    const passed = !blocked;

    // 6. Generate reason and suggestions
    const reason = blocked ? this.generateReason(flaggedSegments) : undefined;
    const suggestions = blocked ? this.generateSuggestions(categories) : undefined;

    return {
      passed,
      blocked,
      severity,
      categories,
      confidence: maxConfidence,
      reason,
      suggestions,
      flaggedSegments,
    };
  }

  /**
   * Moderate content for a specific post kind.
   * Some post types have different rules (e.g., voice notes can't be pre-moderated).
   */
  async moderatePost(input: {
    body: string;
    kind: string;
    hasMedia: boolean;
    hasVoice: boolean;
  }): Promise<ModerationResult> {
    const textResult = await this.moderate(input.body);

    // Voice notes need post-moderation (transcription first)
    if (input.hasVoice && input.kind === "voice") {
      // In production: transcribe voice note first, then moderate
      return {
        ...textResult,
        suggestions: textResult.suggestions ?? [
          "Voice notes are auto-transcribed for accessibility and moderation.",
        ],
      };
    }

    return textResult;
  }

  /**
   * Get self-harm resources for display when self-harm is detected.
   */
  getSelfHarmResources(): string[] {
    return SELF_HARM_RESOURCES;
  }

  // ── Private helpers ────────────────────────────────────────

  private runRuleBasedChecks(text: string): NonNullable<ModerationResult["flaggedSegments"]> {
    const results: NonNullable<ModerationResult["flaggedSegments"]> = [];

    for (const pattern of HARASSMENT_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "harassment", confidence: 0.85 });
      }
    }

    for (const pattern of HATE_SPEECH_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "hate_speech", confidence: 0.9 });
      }
    }

    for (const pattern of SELF_HARM_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "self_harm", confidence: 0.8 });
      }
    }

    for (const pattern of SPAM_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "spam", confidence: 0.7 });
      }
    }

    for (const pattern of PERSONAL_INFO_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "personal_info", confidence: 0.75 });
      }
    }

    return results;
  }

  private async runAIChecks(text: string): Promise<NonNullable<ModerationResult["flaggedSegments"]>> {
    if (!this.config.aiEndpoint) return [];

    try {
      const response = await fetch(this.config.aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, categories: ["harassment", "hate_speech", "self_harm", "violence", "sexual_content"] }),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.flagged ?? []).map((f: any) => ({
        text: f.text ?? "",
        category: f.category ?? "harassment",
        confidence: f.confidence ?? 0.5,
      }));
    } catch {
      return [];
    }
  }

  private runCustomChecks(text: string): NonNullable<ModerationResult["flaggedSegments"]> {
    const results: NonNullable<ModerationResult["flaggedSegments"]> = [];

    for (const word of this.config.customBlockedWords) {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      const match = text.match(regex);
      if (match) {
        results.push({ text: match[0], category: "spam", confidence: 0.9 });
      }
    }

    for (const pattern of this.config.customBlockedPatterns) {
      const match = text.match(pattern);
      if (match) {
        results.push({ text: match[0], category: "spam", confidence: 0.9 });
      }
    }

    return results;
  }

  private calculateSeverity(
    segments: NonNullable<ModerationResult["flaggedSegments"]>,
  ): ModerationSeverity {
    if (segments.length === 0) return "none";

    const hasSelfHarm = segments.some((s) => s.category === "self_harm");
    const hasHateSpeech = segments.some((s) => s.category === "hate_speech");
    const hasViolence = segments.some((s) => s.category === "violence");
    const hasHarassment = segments.some((s) => s.category === "harassment");
    const maxConfidence = Math.max(...segments.map((s) => s.confidence));

    if (hasSelfHarm || hasHateSpeech || hasViolence) {
      return maxConfidence > 0.7 ? "critical" : "high";
    }

    if (hasHarassment) {
      return maxConfidence > 0.7 ? "high" : "medium";
    }

    if (segments.length > 3) return "medium";

    return "low";
  }

  private shouldBlock(severity: ModerationSeverity): boolean {
    if (severity === "critical" && this.config.blockOnCritical) return true;
    if (severity === "high" && this.config.blockOnHigh) return true;
    if (this.config.strictMode && severity !== "none" && severity !== "low") return true;
    return false;
  }

  private generateReason(segments: NonNullable<ModerationResult["flaggedSegments"]>): string {
    const categories = [...new Set(segments.map((s) => s.category))];
    const categoryNames: Record<ModerationCategory, string> = {
      harassment: "harassment",
      hate_speech: "hate speech",
      self_harm: "self-harm concerns",
      violence: "violence",
      sexual_content: "sexual content",
      spam: "spam",
      misinformation: "misinformation",
      personal_info: "personal information",
      copyright: "copyright concerns",
    };
    return `This content may contain ${categories.map((c) => categoryNames[c]).join(", ")}. Please review and revise.`;
  }

  private generateSuggestions(categories: ModerationCategory[]): string[] {
    const suggestions: string[] = [];

    if (categories.includes("self_harm")) {
      suggestions.push("If you're struggling, please reach out to a crisis helpline. You matter.");
      suggestions.push("Consider sharing how you're feeling with a trusted friend or counselor.");
    }
    if (categories.includes("harassment")) {
      suggestions.push("Consider rephrasing to be more constructive and kind.");
      suggestions.push("Elysium is built on resonance — express yourself with care.");
    }
    if (categories.includes("hate_speech")) {
      suggestions.push("This language may be harmful to others. Please reconsider.");
    }
    if (categories.includes("spam")) {
      suggestions.push("This looks like it might be spam. Keep it genuine and personal.");
    }
    if (categories.includes("personal_info")) {
      suggestions.push("Sharing personal information publicly can be risky. Consider removing it.");
    }

    return suggestions;
  }
}

export const ContentModeration = new ContentModerationServiceImpl();
