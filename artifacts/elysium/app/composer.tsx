import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  AccessibilityInfo,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useResonance } from "@/context/ResonanceContext";
import { useServices } from "@/context/ServicesProvider";
import type { Post } from "@/lib/types";

const KINDS: {
  key: Post["kind"];
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
}[] = [
  { key: "classic", label: "Note", icon: "feather" },
  { key: "voice", label: "Voice", icon: "mic" },
  { key: "destiny", label: "Destiny", icon: "navigation" },
  { key: "project", label: "Project", icon: "layers" },
  { key: "poll", label: "Poll", icon: "bar-chart-2" },
  { key: "question", label: "Question", icon: "help-circle" },
  { key: "media", label: "Media", icon: "image" },
];

const SUGGESTED = [
  "Sound",
  "Healing",
  "Founders",
  "Travel",
  "Dev",
  "Poetry",
  "Sleep",
  "Berlin",
  "Lisbon",
];

type MediaAttachment = {
  id: string;
  type: "photo" | "video";
  uri: string;
};

export default function ComposerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addPost, addStory } = useResonance();
  const services = useServices();
  const [kind, setKind] = useState<Post["kind"]>("classic");
  const [body, setBody] = useState("");
  const [destinations, setDestinations] = useState<string[]>([]);
  const [mediaAttachments, setMediaAttachments] = useState<MediaAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [projectTasks, setProjectTasks] = useState<string[]>([""]);

  const submit = async () => {
    if (!body.trim() && mediaAttachments.length === 0) return;

    // Content moderation check
    const modResult = await services.moderateContent(body.trim());
    if (modResult.blocked) {
      Alert.alert(
        "Content needs revision",
        modResult.reason ?? "This content may violate community guidelines.",
      );
      return;
    }

    if (kind === "destiny") {
      addStory({ caption: body.trim(), destinations });
    } else {
      addPost({
        body: body.trim(),
        kind,
        destinations,
        nestedPostId: undefined,
      });
    }
    AccessibilityInfo.announceForAccessibility("Post published");
    router.back();
  };

  const toggleDest = (d: string) => {
    setDestinations((cur) =>
      cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d],
    );
  };

  const handleAddPhoto = useCallback(async () => {
    const result = await services.pickPhoto();
    if (result) {
      const newAttachment: MediaAttachment = {
        id: `media-${Date.now()}`,
        type: "photo",
        uri: result.uri,
      };
      setMediaAttachments((prev) => [...prev, newAttachment]);
      if (kind !== "media" && kind !== "destiny") {
        setKind("media");
      }
      AccessibilityInfo.announceForAccessibility("Photo added");
    }
  }, [kind, services]);

  const handleAddVideo = useCallback(async () => {
    const result = await services.pickVideo();
    if (result) {
      const newAttachment: MediaAttachment = {
        id: `media-${Date.now()}`,
        type: "video",
        uri: result.uri,
      };
      setMediaAttachments((prev) => [...prev, newAttachment]);
      if (kind !== "media" && kind !== "destiny") {
        setKind("media");
      }
      AccessibilityInfo.announceForAccessibility("Video added");
    }
  }, [kind, services]);

  const handleTakePhoto = useCallback(async () => {
    const result = await services.takePhoto();
    if (result) {
      const newAttachment: MediaAttachment = {
        id: `camera-${Date.now()}`,
        type: "photo",
        uri: result.uri,
      };
      setMediaAttachments((prev) => [...prev, newAttachment]);
      if (kind !== "media" && kind !== "destiny") {
        setKind("media");
      }
      AccessibilityInfo.announceForAccessibility("Photo captured");
    }
  }, [kind, services]);

  const removeMedia = useCallback((id: string) => {
    setMediaAttachments((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const addPollOption = useCallback(() => {
    if (pollOptions.length < 6) {
      setPollOptions((prev) => [...prev, ""]);
    }
  }, [pollOptions.length]);

  const updatePollOption = useCallback((index: number, value: string) => {
    setPollOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }, []);

  const removePollOption = useCallback((index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions((prev) => prev.filter((_, i) => i !== index));
    }
  }, [pollOptions.length]);

  const addProjectTask = useCallback(() => {
    setProjectTasks((prev) => [...prev, ""]);
  }, []);

  const updateProjectTask = useCallback((index: number, value: string) => {
    setProjectTasks((prev) => prev.map((t, i) => (i === index ? value : t)));
  }, []);

  const removeProjectTask = useCallback((index: number) => {
    if (projectTasks.length > 1) {
      setProjectTasks((prev) => prev.filter((_, i) => i !== index));
    }
  }, [projectTasks.length]);

  const handleVoiceRecord = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      setKind("voice");
      AccessibilityInfo.announceForAccessibility("Voice recording stopped");
    } else {
      setIsRecording(true);
      setRecordingSeconds(0);
      AccessibilityInfo.announceForAccessibility("Voice recording started");
    }
  }, [isRecording]);

  // Recording timer — ticks every second while recording
  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  const canSubmit = body.trim().length > 0 || mediaAttachments.length > 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { marginTop: insets.top + 8 }]} />
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityLabel="Cancel compose"
        >
          <Feather name="x" size={20} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>compose</Text>
        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          style={[
            styles.sendBtn,
            { backgroundColor: canSubmit ? colors.primary : colors.border },
          ]}
          accessibilityLabel="Publish post"
          accessibilityRole="button"
        >
          <Text style={styles.sendText}>release</Text>
        </Pressable>
      </View>

      <KeyboardAwareScrollView
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 80, gap: 16 }}
      >
        {/* Post type selector */}
        <View style={styles.kindRow} accessibilityLabel="Post type">
          {KINDS.map((k) => {
            const active = k.key === kind;
            return (
              <Pressable
                key={k.key}
                onPress={() => setKind(k.key)}
                style={[
                  styles.kindChip,
                  {
                    borderColor: active ? colors.primary : colors.border,
                    backgroundColor: active
                      ? colors.primary + "22"
                      : "rgba(245,240,255,0.04)",
                  },
                ]}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                accessibilityLabel={k.label}
              >
                <Feather
                  name={k.icon}
                  size={13}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  style={[
                    styles.kindText,
                    { color: active ? colors.primary : colors.mutedForeground },
                  ]}
                >
                  {k.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Text editor */}
        <View
          style={[
            styles.editor,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <TextInput
            value={body}
            onChangeText={setBody}
            multiline
            placeholder={
              kind === "voice"
                ? "describe your voice note — what's underneath the moment?"
                : kind === "destiny"
                  ? "the moment, in 1–2 sentences. tag where it should travel below."
                  : kind === "question"
                    ? "what are you curious about?"
                    : kind === "poll"
                      ? "ask something worth voting on..."
                      : kind === "project"
                        ? "what are you building? what do you need?"
                        : "what's resonating right now?"
            }
            placeholderTextColor={colors.subtle}
            style={[styles.input, { color: colors.text }]}
            accessibilityLabel="Post content"
          />
        </View>

        {/* Media attachments preview */}
        {mediaAttachments.length > 0 && (
          <View style={styles.mediaPreview}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              ATTACHMENTS · {mediaAttachments.length}
            </Text>
            <View style={styles.mediaRow}>
              {mediaAttachments.map((m) => (
                <View
                  key={m.id}
                  style={[styles.mediaThumb, { borderColor: colors.border, backgroundColor: colors.card }]}
                >
                  <Feather
                    name={m.type === "video" ? "film" : "image"}
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={[styles.mediaThumbLabel, { color: colors.mutedForeground }]}>
                    {m.type}
                  </Text>
                  <Pressable
                    onPress={() => removeMedia(m.id)}
                    style={styles.mediaRemove}
                    accessibilityLabel={`Remove ${m.type}`}
                  >
                    <Feather name="x" size={10} color="#fff" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Creator tools toolbar */}
        <View style={[styles.toolbar, { borderColor: colors.border }]}>
          <Pressable
            onPress={handleTakePhoto}
            style={styles.toolBtn}
            accessibilityLabel="Take photo with camera"
          >
            <Feather name="camera" size={18} color={colors.teal} />
            <Text style={[styles.toolLabel, { color: colors.mutedForeground }]}>Camera</Text>
          </Pressable>
          <Pressable
            onPress={handleAddPhoto}
            style={styles.toolBtn}
            accessibilityLabel="Add photo from gallery"
          >
            <Feather name="image" size={18} color={colors.primary} />
            <Text style={[styles.toolLabel, { color: colors.mutedForeground }]}>Photo</Text>
          </Pressable>
          <Pressable
            onPress={handleAddVideo}
            style={styles.toolBtn}
            accessibilityLabel="Add video"
          >
            <Feather name="film" size={18} color={colors.magenta} />
            <Text style={[styles.toolLabel, { color: colors.mutedForeground }]}>Video</Text>
          </Pressable>
          <Pressable
            onPress={handleVoiceRecord}
            style={styles.toolBtn}
            accessibilityLabel={isRecording ? "Stop recording" : "Record voice note"}
          >
            <Feather
              name="mic"
              size={18}
              color={isRecording ? colors.rose : colors.teal}
            />
            <Text style={[styles.toolLabel, { color: colors.mutedForeground }]}>
              {isRecording ? "Stop" : "Voice"}
            </Text>
          </Pressable>
        </View>

        {/* Voice recording panel */}
        {kind === "voice" && (
          <View
            style={[
              styles.voicePanel,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Pressable
              onPress={handleVoiceRecord}
              style={[styles.voiceCircle, { borderColor: isRecording ? colors.rose : colors.primary }]}
              accessibilityLabel={isRecording ? "Stop recording" : "Start recording"}
            >
              <Feather
                name={isRecording ? "square" : "mic"}
                size={28}
                color={isRecording ? colors.rose : colors.primary}
              />
            </Pressable>
            <Text style={[styles.voiceLabel, { color: colors.text }]}>
              {isRecording ? "recording..." : "tap to record"}
            </Text>
            <Text style={[styles.voiceHint, { color: colors.mutedForeground }]}>
              up to 60s · auto-transcribed for accessibility
            </Text>
          </View>
        )}

        {/* Poll builder */}
        {kind === "poll" && (
          <View style={{ gap: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              POLL OPTIONS
            </Text>
            {pollOptions.map((opt, i) => (
              <View key={i} style={[styles.pollOptionRow, { borderColor: colors.border }]}>
                <View style={[styles.pollOptionNum, { backgroundColor: colors.primary + "22" }]}>
                  <Text style={[styles.pollOptionNumText, { color: colors.primary }]}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <TextInput
                  value={opt}
                  onChangeText={(v) => updatePollOption(i, v)}
                  placeholder={`Option ${i + 1}`}
                  placeholderTextColor={colors.subtle}
                  style={[styles.pollOptionInput, { color: colors.text }]}
                  accessibilityLabel={`Poll option ${i + 1}`}
                />
                {pollOptions.length > 2 && (
                  <Pressable onPress={() => removePollOption(i)} accessibilityLabel="Remove option">
                    <Feather name="x" size={14} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            ))}
            {pollOptions.length < 6 && (
              <Pressable
                onPress={addPollOption}
                style={[styles.addOptionBtn, { borderColor: colors.border }]}
                accessibilityLabel="Add poll option"
              >
                <Feather name="plus" size={14} color={colors.primary} />
                <Text style={[styles.addOptionText, { color: colors.primary }]}>Add option</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Project task builder */}
        {kind === "project" && (
          <View style={{ gap: 8 }}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              PROJECT TASKS
            </Text>
            {projectTasks.map((task, i) => (
              <View key={i} style={[styles.taskRow, { borderColor: colors.border }]}>
                <View style={[styles.taskNum, { borderColor: colors.teal }]}>
                  <Text style={[styles.taskNumText, { color: colors.teal }]}>{i + 1}</Text>
                </View>
                <TextInput
                  value={task}
                  onChangeText={(v) => updateProjectTask(i, v)}
                  placeholder={`Task ${i + 1}`}
                  placeholderTextColor={colors.subtle}
                  style={[styles.taskInput, { color: colors.text }]}
                  accessibilityLabel={`Task ${i + 1}`}
                />
                {projectTasks.length > 1 && (
                  <Pressable onPress={() => removeProjectTask(i)} accessibilityLabel="Remove task">
                    <Feather name="x" size={14} color={colors.mutedForeground} />
                  </Pressable>
                )}
              </View>
            ))}
            <Pressable
              onPress={addProjectTask}
              style={[styles.addOptionBtn, { borderColor: colors.teal + "55" }]}
              accessibilityLabel="Add task"
            >
              <Feather name="plus" size={14} color={colors.teal} />
              <Text style={[styles.addOptionText, { color: colors.teal }]}>Add task</Text>
            </Pressable>
          </View>
        )}

        {/* Destinations */}
        <View>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            DESTINATIONS · where this should travel
          </Text>
          <View style={styles.destRow}>
            {SUGGESTED.map((d) => {
              const active = destinations.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => toggleDest(d)}
                  style={[
                    styles.dest,
                    {
                      borderColor: active ? colors.gold : colors.border,
                      backgroundColor: active
                        ? colors.gold + "22"
                        : "rgba(245,240,255,0.04)",
                    },
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: active }}
                  accessibilityLabel={`Destination ${d}`}
                >
                  <Text
                    style={[
                      styles.destText,
                      { color: active ? colors.gold : colors.mutedForeground },
                    ]}
                  >
                    {active ? "↗ " : "+ "}
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Accessibility note */}
        <View style={[styles.tip, { borderColor: colors.border }]}>
          <Feather name="info" size={12} color={colors.teal} />
          <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
            Resonance Engine will quietly nudge this to people whose energy
            aligns. Voice notes are auto-transcribed for accessibility.
          </Text>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(245,240,255,0.18)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245,240,255,0.06)",
  },
  headerTitle: { flex: 1, fontFamily: "Inter_700Bold", fontSize: 18 },
  sendBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  kindRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  kindChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  kindText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  editor: { padding: 16, borderRadius: 18, borderWidth: 1, minHeight: 160 },
  input: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
    minHeight: 130,
    textAlignVertical: "top",
  },
  mediaPreview: { gap: 8 },
  mediaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  mediaThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  mediaThumbLabel: { fontFamily: "Inter_500Medium", fontSize: 10, marginTop: 4 },
  mediaRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  toolBtn: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toolLabel: { fontFamily: "Inter_500Medium", fontSize: 10 },
  sectionLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  voicePanel: {
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  voiceCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  voiceLabel: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  voiceHint: { fontFamily: "Inter_400Regular", fontSize: 12 },
  pollOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  pollOptionNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pollOptionNumText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  pollOptionInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 4,
  },
  addOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addOptionText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  taskNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  taskNumText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  taskInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    paddingVertical: 4,
  },
  destRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  dest: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  destText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  tip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
});
