import { ImageResponse } from "next/og";

import { avatarDataUri, dark, ogFonts, ogSize } from "@/lib/og";

export const alt =
  "hanu 21 y.o. fullstack engineer with design eyes.";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const avatar = avatarDataUri();

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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: 780,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
            }}
          >
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 78,
                height: 78,
                borderRadius: 999,
                overflow: "hidden",
                border: `1px solid ${dark.line}`,
                backgroundColor: dark.bg,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatar} alt="" width={78} height={78} />
            </div>

            <span
              style={{
                fontFamily: "Jeju Myeongjo",
                fontSize: 74,
                lineHeight: 1,
                color: dark.fg,
              }}
            >
              hanu
            </span>
          </div>

          <p
            style={{
              margin: 0,
              marginTop: 28,
              maxWidth: 720,
              fontSize: 30,
              lineHeight: 1.45,
              textAlign: "center",
              color: dark.muted,
            }}
          >
            21 y.o. fullstack eng with design eyes.
          </p>
        </div>
      </div>
    ),
    { ...ogSize, fonts: ogFonts() },
  );
}
