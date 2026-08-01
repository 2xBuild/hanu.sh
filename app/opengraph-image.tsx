import { ImageResponse } from "next/og";

import { avatarDataUri, dark, ogFonts, ogSize } from "@/lib/og";
import { projects } from "@/lib/projects";

export const alt =
  "hanu — 21 y.o. fullstack engineer with design eyes";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const avatar = avatarDataUri();
  const shipped = projects.filter((p) => p.visibility !== "closed");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: dark.bg,
          fontFamily: "General Sans",
        }}
      >
        {/* Accent bloom behind the wordmark, echoing the blue underline.
            Satori ignores the `inset` shorthand, so these are sized explicitly. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: ogSize.width,
            height: ogSize.height,
            backgroundImage:
              "radial-gradient(circle at 16% 2%, rgba(96,165,250,0.13), rgba(96,165,250,0) 38%)",
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
              "radial-gradient(circle at 100% 106%, rgba(96,165,250,0.08), rgba(96,165,250,0) 32%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: 72,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  backgroundColor: dark.accent,
                }}
              />
              <span style={{ fontSize: 24, color: dark.muted }}>hanu.sh</span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 20px",
                borderRadius: 999,
                border: `1px solid ${dark.line}`,
                backgroundColor: "rgba(255,255,255,0.045)",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: "#4ade80",
                }}
              />
              <span style={{ fontSize: 21, color: "rgba(230,230,230,0.82)" }}>
                open for work
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <span
              style={{
                fontFamily: "Jeju Myeongjo",
                fontSize: 104,
                lineHeight: 1,
                color: dark.fg,
              }}
            >
              im
            </span>

            <div
              style={{
                display: "flex",
                position: "relative",
                width: 92,
                height: 92,
                borderRadius: 999,
                overflow: "hidden",
                border: `1px solid ${dark.line}`,
                backgroundColor: "#000",
              }}
            >
              {/* Zoomed past the artwork's own padding so the mascot fills the
                  circle at feed-thumbnail size. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatar}
                alt=""
                width={120}
                height={120}
                style={{ position: "absolute", top: -14, left: -14 }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontFamily: "Jeju Myeongjo",
                  fontSize: 104,
                  lineHeight: 1,
                  color: dark.fg,
                }}
              >
                hanu
              </span>
              {/* The site's double underline, drawn — Satori has no
                  text-decoration-style: double. */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                  marginTop: 14,
                }}
              >
                <div style={{ height: 3, backgroundColor: dark.accent }} />
                <div style={{ height: 3, backgroundColor: dark.accent }} />
              </div>
            </div>
          </div>

          <p
            style={{
              margin: 0,
              marginTop: 40,
              maxWidth: 800,
              fontSize: 31,
              lineHeight: 1.45,
              color: "rgba(230,230,230,0.7)",
            }}
          >
            21 y.o. fullstack eng with design eyes. i build interfaces, tools,
            and side projects for the web.
          </p>

          <div style={{ display: "flex", flex: 1 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ height: 1, backgroundColor: "#1e1e1e" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {shipped.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    padding: "9px 20px",
                    borderRadius: 999,
                    border: "1px solid #262626",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    fontFamily: "Jeju Myeongjo",
                    fontSize: 26,
                    lineHeight: 1.2,
                    color:
                      p.visibility === "active"
                        ? "rgba(230,230,230,0.92)"
                        : "rgba(230,230,230,0.5)",
                  }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: ogFonts() },
  );
}
