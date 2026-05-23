import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const title = url.searchParams.get("title") ?? "Unblock stuck builders";
  const fix = url.searchParams.get("fix") ?? "";
  const helper = url.searchParams.get("helper") ?? "";
  const category = url.searchParams.get("category") ?? "";
  const minutes = url.searchParams.get("minutes") ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          padding: "80px",
          fontFamily: "Inter, system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "22px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "9999px",
              backgroundColor: "#fafafa",
            }}
          />
          Cohort SOS · Cursor Boston · Summer 1
        </div>

        {category || minutes ? (
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "60px",
              fontSize: "18px",
              color: "#a1a1aa",
            }}
          >
            {category ? <span>{category}</span> : null}
            {category && minutes ? <span>·</span> : null}
            {minutes ? <span>Resolved in {minutes} min</span> : null}
          </div>
        ) : null}

        <div
          style={{
            fontSize: "72px",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            marginTop: "20px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {fix ? (
          <div
            style={{
              fontSize: "28px",
              color: "#d4d4d8",
              lineHeight: 1.35,
              marginTop: "32px",
              display: "flex",
              maxWidth: "1000px",
            }}
          >
            “{fix.length > 180 ? fix.slice(0, 180) + "…" : fix}”
          </div>
        ) : null}

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "20px",
            color: "#a1a1aa",
          }}
        >
          <span>cohort-sos.vercel.app</span>
          {helper ? <span>Fixed by {helper}</span> : null}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
