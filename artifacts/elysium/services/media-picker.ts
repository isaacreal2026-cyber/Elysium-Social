/**
 * Elysium Media Picker Service
 *
 * Wraps expo-image-picker and expo-camera for real photo/video capture.
 * Falls back to simulated URIs when native modules are unavailable.
 *
 * This module is a NEW file — it does not alter any existing code.
 * The composer screen can import this to replace simulated media URIs
 * with real ones from the device camera or gallery.
 *
 * Usage:
 *   import { MediaPicker } from "@/services/media-picker";
 *   const uri = await MediaPicker.pickPhoto();
 *   const uri = await MediaPicker.takePhoto();
 *   const uri = await MediaPicker.pickVideo();
 *   const uri = await MediaPicker.takeVideo();
 */

import { Platform, Linking, Alert } from "react-native";

// ── Types ──────────────────────────────────────────────────────

export type MediaType = "photo" | "video";

export interface MediaResult {
  uri: string;
  type: MediaType;
  width: number;
  height: number;
  fileSize?: number;
  durationMs?: number; // for video
  fileName?: string;
}

export interface MediaPickerOptions {
  allowsEditing?: boolean;
  quality?: number; // 0-1
  aspect?: [number, number];
  videoMaxDurationSeconds?: number;
}

const DEFAULT_OPTIONS: MediaPickerOptions = {
  allowsEditing: true,
  quality: 0.8,
  aspect: [4, 3],
  videoMaxDurationSeconds: 60,
};

// ── Service ────────────────────────────────────────────────────

class MediaPickerServiceImpl {
  private cameraAvailable: boolean | null = null;

  /**
   * Pick a photo from the device gallery.
   * Returns null if the user cancels.
   */
  async pickPhoto(options?: MediaPickerOptions): Promise<MediaResult | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (Platform.OS === "web") {
      return this.webFilePicker("photo");
    }

    try {
      const { launchImageLibraryAsync, MediaTypeOptions } = (await import("expo-image-picker")) as any;
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: opts.allowsEditing,
        quality: opts.quality,
        aspect: opts.aspect,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "photo" as const,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize ?? undefined,
        fileName: asset.fileName ?? undefined,
      };
    } catch {
      // Fallback: simulated
      return this.simulatedResult("photo");
    }
  }

  /**
   * Take a photo with the device camera.
   * Returns null if the user cancels.
   */
  async takePhoto(options?: MediaPickerOptions): Promise<MediaResult | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (Platform.OS === "web") {
      // Web cameras: use the MediaDevices API
      Alert.alert("Camera", "Camera access requires a native app. Opening gallery instead.");
      return this.pickPhoto(opts);
    }

    // Check camera availability
    const available = await this.isCameraAvailable();
    if (!available) {
      Alert.alert("Camera", "Camera is not available on this device.");
      return null;
    }

    try {
      const { launchCameraAsync, MediaTypeOptions } = (await import("expo-image-picker")) as any;
      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: opts.allowsEditing,
        quality: opts.quality,
        aspect: opts.aspect,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "photo" as const,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize ?? undefined,
        fileName: asset.fileName ?? undefined,
      };
    } catch {
      return this.simulatedResult("photo");
    }
  }

  /**
   * Pick a video from the device gallery.
   * Returns null if the user cancels.
   */
  async pickVideo(options?: MediaPickerOptions): Promise<MediaResult | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (Platform.OS === "web") {
      return this.webFilePicker("video");
    }

    try {
      const { launchImageLibraryAsync, MediaTypeOptions } = (await import("expo-image-picker")) as any;
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Videos,
        allowsEditing: opts.allowsEditing,
        quality: opts.quality,
        videoMaxDuration: opts.videoMaxDurationSeconds,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "video" as const,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize ?? undefined,
        durationMs: asset.duration ?? undefined,
        fileName: asset.fileName ?? undefined,
      };
    } catch {
      return this.simulatedResult("video");
    }
  }

  /**
   * Record a video with the device camera.
   * Returns null if the user cancels.
   */
  async takeVideo(options?: MediaPickerOptions): Promise<MediaResult | null> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    if (Platform.OS === "web") {
      Alert.alert("Camera", "Video recording requires a native app. Opening gallery instead.");
      return this.pickVideo(opts);
    }

    const available = await this.isCameraAvailable();
    if (!available) {
      Alert.alert("Camera", "Camera is not available on this device.");
      return null;
    }

    try {
      const { launchCameraAsync, MediaTypeOptions } = (await import("expo-image-picker")) as any;
      const result = await launchCameraAsync({
        mediaTypes: MediaTypeOptions.Videos,
        allowsEditing: opts.allowsEditing,
        quality: opts.quality,
        videoMaxDuration: opts.videoMaxDurationSeconds,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: "video" as const,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize ?? undefined,
        durationMs: asset.duration ?? undefined,
        fileName: asset.fileName ?? undefined,
      };
    } catch {
      return this.simulatedResult("video");
    }
  }

  /**
   * Check if the device camera is available.
   */
  async isCameraAvailable(): Promise<boolean> {
    if (this.cameraAvailable !== null) return this.cameraAvailable;
    if (Platform.OS === "web") {
      this.cameraAvailable = !!(navigator?.mediaDevices?.getUserMedia);
      return this.cameraAvailable;
    }

    try {
      const picker = await import("expo-image-picker");
      // isAvailableAsync is available on some versions
      if (typeof (picker as any).isAvailableAsync === "function") {
        this.cameraAvailable = !!(await (picker as any).isAvailableAsync());
      } else {
        // Assume camera is available on native platforms
        this.cameraAvailable = true;
      }
      return !!this.cameraAvailable;
    } catch {
      this.cameraAvailable = false;
      return false;
    }
  }

  /**
   * Open device settings for camera permissions.
   */
  async openSettings(): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      const picker = await import("expo-image-picker");
      if (typeof (picker as any).openSettingsAsync === "function") {
        await (picker as any).openSettingsAsync();
      } else {
        // Fallback: open app settings
        Linking.openSettings?.();
      }
    } catch {
      // Fallback: open app settings
      Linking.openSettings?.();
    }
  }

  // ── Private helpers ────────────────────────────────────────

  private simulatedResult(type: MediaType): MediaResult {
    return {
      uri: `simulated://${type}-${Date.now()}`,
      type,
      width: 1080,
      height: 1080,
      fileSize: type === "photo" ? 2_500_000 : 15_000_000,
      fileName: type === "photo" ? `elysium_${Date.now()}.jpg` : `elysium_${Date.now()}.mp4`,
    };
  }

  private webFilePicker(type: MediaType): Promise<MediaResult | null> {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = type === "photo" ? "image/*" : "video/*";
      input.style.display = "none";
      document.body.appendChild(input);

      input.onchange = () => {
        const file = input.files?.[0];
        document.body.removeChild(input);
        if (!file) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(file);
        resolve({
          uri: url,
          type,
          width: 1080,
          height: 1080,
          fileSize: file.size,
          fileName: file.name,
        });
      };

      input.oncancel = () => {
        document.body.removeChild(input);
        resolve(null);
      };

      input.click();
    });
  }
}

export const MediaPicker = new MediaPickerServiceImpl();
