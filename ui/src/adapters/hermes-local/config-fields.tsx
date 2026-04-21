import type { AdapterConfigFieldsProps } from "../types";
import {
  Field,
  DraftInput,
} from "../../components/agent-config-primitives";
import { ChoosePathButton } from "../../components/PathInstructionsModal";

const inputClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono placeholder:text-muted-foreground/40";
const selectClass =
  "w-full rounded-md border border-border px-2.5 py-1.5 bg-transparent outline-none text-sm font-mono text-foreground";
const instructionsFileHint =
  "Absolute path to a markdown file (e.g. AGENTS.md) that defines this agent's behavior. Injected into the system prompt at runtime.";
const modelHint =
  "Model used by this agent. Only models with a configured API key are shown. Leave empty to use the server default.";
const persistSessionHint =
  "Keep the Hermes session alive between heartbeats (default: on). Disable to force a fresh session on every run — useful to recover from a corrupted session ID.";

export function HermesLocalConfigFields({
  isCreate,
  values,
  set,
  config,
  eff,
  mark,
  models,
  hideInstructionsFile,
}: AdapterConfigFieldsProps) {
  const currentModel = isCreate
    ? (values!.model ?? "")
    : eff("adapterConfig", "model", String(config.model ?? ""));

  return (
    <>
      {!hideInstructionsFile && (
        <Field label="Agent instructions file" hint={instructionsFileHint}>
          <div className="flex items-center gap-2">
            <DraftInput
              value={
                isCreate
                  ? values!.instructionsFilePath ?? ""
                  : eff(
                      "adapterConfig",
                      "instructionsFilePath",
                      String(config.instructionsFilePath ?? ""),
                    )
              }
              onCommit={(v) =>
                isCreate
                  ? set!({ instructionsFilePath: v })
                  : mark("adapterConfig", "instructionsFilePath", v || undefined)
              }
              immediate
              className={inputClass}
              placeholder="/absolute/path/to/AGENTS.md"
            />
            <ChoosePathButton />
          </div>
        </Field>
      )}
      <Field label="Persist session" hint={persistSessionHint}>
        <select
          className={selectClass}
          value={
            isCreate
              ? String(values!.persistSession ?? "")
              : eff("adapterConfig", "persistSession", String(config.persistSession ?? ""))
          }
          onChange={(e) => {
            const raw = e.target.value;
            const v = raw === "" ? undefined : raw === "true";
            if (isCreate) {
              set!({ persistSession: v });
            } else {
              mark("adapterConfig", "persistSession", v);
            }
          }}
        >
          <option value="">Default (enabled)</option>
          <option value="true">Enabled</option>
          <option value="false">Disabled (fresh session each run)</option>
        </select>
      </Field>
      <Field label="Model" hint={modelHint}>
        {models && models.length > 0 ? (
          <select
            className={selectClass}
            value={currentModel}
            onChange={(e) => {
              const v = e.target.value;
              if (isCreate) {
                set!({ model: v || undefined });
              } else {
                mark("adapterConfig", "model", v || undefined);
              }
            }}
          >
            <option value="">Default (google/gemini-2.5-flash)</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        ) : (
          <DraftInput
            value={currentModel}
            onCommit={(v) =>
              isCreate
                ? set!({ model: v || undefined })
                : mark("adapterConfig", "model", v || undefined)
            }
            immediate
            className={inputClass}
            placeholder="google/gemini-2.5-flash (default)"
          />
        )}
      </Field>
    </>
  );
}
