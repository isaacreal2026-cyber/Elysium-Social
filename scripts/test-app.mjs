import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

test("Elysium Social App - Deep Scan & Verification", async (t) => {
  await t.test("All Expo App routes and screens exist and are valid", () => {
    const screens = [
      "app/index.tsx",
      "app/feed.tsx",
      "app/discover.tsx",
      "app/orbit.tsx",
      "app/gather.tsx",
      "app/me.tsx",
      "app/groups.tsx",
      "app/composer.tsx",
      "app/voice-party.tsx",
      "app/ai-chat.tsx",
      "app/payment.tsx",
      "app/notifications.tsx",
      "app/connections.tsx",
      "app/search.tsx",
      "app/post/[id].tsx",
      "app/profile/[id].tsx",
      "app/messages/[id].tsx",
      "app/hub/[id].tsx",
      "app/story/[id].tsx",
      "app/tag/[name].tsx",
      "app/_layout.tsx",
      "app/+not-found.tsx",
    ];

    for (const screen of screens) {
      const fullPath = path.join(root, "artifacts/elysium", screen);
      assert.ok(fs.existsSync(fullPath), `Screen ${screen} must exist on disk`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 50, `Screen ${screen} must have substantial code`);
      assert.ok(
        content.includes("export default function") ||
        content.includes("export function") ||
        content.includes("export default"),
        `Screen ${screen} must export a component`,
      );
    }
  });

  await t.test("All core UI Components exist and are exported", () => {
    const components = [
      "components/BottomTabBar.tsx",
      "components/PostCard.tsx",
      "components/ResonanceBar.tsx",
      "components/ScreenShell.tsx",
      "components/StarField.tsx",
      "components/StoryRail.tsx",
      "components/GlowOrb.tsx",
      "components/ErrorBoundary.tsx",
      "components/ErrorFallback.tsx",
    ];

    for (const comp of components) {
      const fullPath = path.join(root, "artifacts/elysium", comp);
      assert.ok(fs.existsSync(fullPath), `Component ${comp} must exist on disk`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 50, `Component ${comp} must have substantial code`);
    }
  });

  await t.test("Context and State Management integrity", () => {
    const ctxPath = path.join(root, "artifacts/elysium/context/ResonanceContext.tsx");
    assert.ok(fs.existsSync(ctxPath));
    const content = fs.readFileSync(ctxPath, "utf-8");
    assert.ok(content.includes("useResonance"), "ResonanceContext must export useResonance");
    assert.ok(content.includes("ResonanceProvider"), "ResonanceContext must export ResonanceProvider");
    assert.ok(content.includes("addPost"), "Context must support adding posts");
    assert.ok(content.includes("addComment"), "Context must support adding comments");
    assert.ok(content.includes("addStory"), "Context must support adding stories");
    assert.ok(content.includes("resonate"), "Context must support resonating with posts");
    assert.ok(content.includes("toggleFollow"), "Context must support following users");
    assert.ok(content.includes("toggleBookmark"), "Context must support bookmarking");
    assert.ok(content.includes("sendMessage"), "Context must support sending messages");
    assert.ok(content.includes("markStoryViewed"), "Context must support marking stories as viewed");
  });

  await t.test("Design Tokens & Palette Consistency", () => {
    const colorsPath = path.join(root, "artifacts/elysium/constants/colors.ts");
    assert.ok(fs.existsSync(colorsPath));
    const content = fs.readFileSync(colorsPath, "utf-8");
    assert.ok(content.includes("primary"), "Palette must define primary color");
    assert.ok(content.includes("gold"), "Palette must define gold color");
    assert.ok(content.includes("teal"), "Palette must define teal color");
    assert.ok(content.includes("magenta"), "Palette must define magenta color");
    assert.ok(content.includes("rose"), "Palette must define rose color");
    assert.ok(content.includes("radius: 22"), "Palette must define standard radius");
  });

  await t.test("Mockup Sandbox Components & Vite Setup", () => {
    const mockups = [
      "src/components/mockups/elysium-feed/ConstellationFeed.tsx",
      "src/components/mockups/elysium-feed/ResonancePulse.tsx",
      "src/components/mockups/elysium-feed/AmbientLayers.tsx",
      "src/components/mockups/elysium-feed/FrequencyBoard.tsx",
    ];

    for (const m of mockups) {
      const fullPath = path.join(root, "artifacts/mockup-sandbox", m);
      assert.ok(fs.existsSync(fullPath), `Mockup ${m} must exist`);
      const content = fs.readFileSync(fullPath, "utf-8");
      assert.ok(content.length > 50, `Mockup ${m} must have code`);
    }
  });

  await t.test("App Versioning & Anti-Clone Drift Metadata", () => {
    const appJsonPath = path.join(root, "artifacts/elysium/app.json");
    assert.ok(fs.existsSync(appJsonPath));
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    assert.equal(appJson.expo?.version, "2.4.0", "app.json should reflect updated version 2.4.0");

    const storagePath = path.join(root, "artifacts/elysium/lib/storage.ts");
    const storageContent = fs.readFileSync(storagePath, "utf-8");
    assert.ok(storageContent.includes('APP_VERSION = "2.4.0"'), "storage should define version 2.4.0");
    assert.ok(storageContent.includes("SCHEMA_VERSION = 3"), "storage should define schema v3");
  });
});
