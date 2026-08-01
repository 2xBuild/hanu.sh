import { ImageResponse } from "next/og";

import { light, ogFonts, ogSize } from "@/lib/og";

export const alt = "ui.hanu.sh — interface components by hanu";
export const size = ogSize;
export const contentType = "image/png";

const CARD_W = 560;
const CARD_H = 367; // 52px header + 315px 16:9 stage
const STAGE_H = 315;

/** The stack, flattened: the live component slides these apart, so the still
 *  just freezes slot 0 and the two cards peeking out behind it. */
const stack = [
  { width: 407, top: 93, height: 54, tint: 0.4 },
  { width: 422, top: 103, height: 58, tint: 0.55 },
];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: light.bg,
          fontFamily: "General Sans",
        }}
      >
        {/* Satori ignores the `inset` shorthand, so these are sized explicitly. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            backgroundImage:
              "radial-gradient(circle at 84% 0%, rgba(99,102,241,0.14), rgba(99,102,241,0) 52%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            backgroundImage:
              "radial-gradient(circle at 0% 104%, rgba(100,116,139,0.12), rgba(100,116,139,0) 46%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 60,
            width: "100%",
            height: "100%",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 432 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  backgroundColor: light.accent,
                }}
              />
              <span style={{ fontSize: 22, color: light.muted }}>hanu.sh</span>
            </div>

            <div
              style={{
                display: "flex",
                marginTop: 22,
                fontFamily: "Jeju Myeongjo",
                fontSize: 64,
                lineHeight: 1.1,
              }}
            >
              <span style={{ color: light.fg }}>ui</span>
              {/* The serif's full-width periods leave craters at this size. */}
              <span style={{ color: "#94a3b8", letterSpacing: "-0.055em" }}>
                .hanu.sh
              </span>
            </div>

            <p
              style={{
                margin: 0,
                marginTop: 22,
                fontSize: 24,
                lineHeight: 1.5,
                color: light.muted,
              }}
            >
              Interface components I build and reuse. Animated, accessible, and
              ready to copy straight off the card.
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
              {["React", "Tailwind", "Copy & paste"].map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "7px 15px",
                    borderRadius: 999,
                    border: `1px solid ${light.line}`,
                    backgroundColor: "#ffffff",
                    fontSize: 19,
                    lineHeight: 1.2,
                    color: "#475569",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              position: "relative",
              width: CARD_W,
              height: CARD_H,
            }}
          >
            {/* Hints at the rest of the directory without inventing content. */}
            <div
              style={{
                position: "absolute",
                top: -14,
                left: 20,
                width: CARD_W,
                height: CARD_H,
                borderRadius: 20,
                border: `1px solid ${light.line}`,
                backgroundColor: "rgba(255,255,255,0.55)",
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                width: CARD_W,
                height: CARD_H,
                borderRadius: 20,
                overflow: "hidden",
                border: `1px solid ${light.line}`,
                backgroundColor: "#ffffff",
                boxShadow: "0 24px 60px rgba(15,23,42,0.10)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: 52,
                  padding: "0 20px",
                  borderBottom: "1px solid #f1f5f9",
                }}
              >
                <span style={{ fontSize: 17, color: "#475569" }}>
                  Notification Stack
                </span>
                <svg
                  width={19}
                  height={19}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
              </div>

              <div
                style={{
                  display: "flex",
                  position: "relative",
                  width: CARD_W,
                  height: STAGE_H,
                  backgroundImage:
                    "linear-gradient(135deg, #f8fafc 0%, #eef2f7 55%, #eef2ff 100%)",
                }}
              >
                {stack.map((card) => (
                  <div
                    key={card.top}
                    style={{
                      position: "absolute",
                      top: card.top,
                      left: (CARD_W - card.width) / 2,
                      width: card.width,
                      height: card.height,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.6)",
                      backgroundColor: `rgba(255,255,255,${card.tint})`,
                    }}
                  />
                ))}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    position: "absolute",
                    top: 113,
                    left: (CARD_W - 437) / 2,
                    width: 437,
                    height: 62,
                    padding: "0 14px",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.7)",
                    backgroundColor: "rgba(255,255,255,0.75)",
                    boxShadow: "0 12px 26px rgba(100,116,139,0.16)",
                  }}
                >
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#64748b"
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                  </svg>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: "#1e293b",
                      }}
                    >
                      Maya
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        lineHeight: 1.3,
                        color: "#64748b",
                      }}
                    >
                      Are we still meeting at seven?
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      padding: 4,
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.7)",
                      backgroundColor: "rgba(255,255,255,0.65)",
                      boxShadow: "0 6px 16px rgba(100,116,139,0.14)",
                    }}
                  >
                    {["0.5×", "1×", "2×", "4×"].map((speed) => {
                      const active = speed === "1×";

                      return (
                        <div
                          key={speed}
                          style={{
                            display: "flex",
                            padding: "3px 9px",
                            borderRadius: 999,
                            fontSize: 13,
                            lineHeight: 1.4,
                            color: active ? "#0f172a" : "#64748b",
                            backgroundColor: active ? "#ffffff" : "transparent",
                          }}
                        >
                          {speed}
                        </div>
                      );
                    })}

                    <div
                      style={{
                        width: 1,
                        height: 15,
                        marginLeft: 4,
                        marginRight: 4,
                        backgroundColor: "rgba(148,163,184,0.4)",
                      }}
                    />

                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z" />
                    </svg>

                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginLeft: 6 }}
                    >
                      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                      <line x1="22" x2="16" y1="9" y2="15" />
                      <line x1="16" x2="22" y1="9" y2="15" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: ogFonts() },
  );
}
