import React, { useEffect, useState } from "react";
import RuntimeConfig from "./RuntimeConfig";

interface Props extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "alt"
> {
  src?: string;
  alt?: string;
  fallbackSrc?: string;
  textLine1?: string;
  textLine2?: string;
}

const AppLogo = ({
  src,
  alt = "Seatsurfing",
  fallbackSrc = "/ui/seatsurfing.svg",
  textLine1,
  textLine2,
  onError,
  className,
  style,
  ...imgProps
}: Props) => {
  const runtimeLogoUrl = RuntimeConfig.INFOS?.customLogoUrl ?? "";
  const runtimeLogoTextLine1 = RuntimeConfig.INFOS?.customLogoTextLine1 ?? "";
  const runtimeLogoTextLine2 = RuntimeConfig.INFOS?.customLogoTextLine2 ?? "";
  const [publicLogoUrl, setPublicLogoUrl] = useState("");
  const [publicLogoTextLine1, setPublicLogoTextLine1] = useState("");
  const [publicLogoTextLine2, setPublicLogoTextLine2] = useState("");
  const customLogoUrl = (
    src !== undefined ? src : runtimeLogoUrl || publicLogoUrl
  ).trim();
  const customLogoTextLine1 = (
    textLine1 !== undefined
      ? textLine1
      : runtimeLogoTextLine1 || publicLogoTextLine1
  ).trim();
  const customLogoTextLine2 = (
    textLine2 !== undefined
      ? textLine2
      : runtimeLogoTextLine2 || publicLogoTextLine2
  ).trim();
  const preferredSrc = customLogoUrl || fallbackSrc;
  const [currentSrc, setCurrentSrc] = useState(preferredSrc);
  const showLogoText =
    customLogoUrl !== "" &&
    (customLogoTextLine1 !== "" || customLogoTextLine2 !== "");

  useEffect(() => {
    setCurrentSrc(preferredSrc);
  }, [preferredSrc]);

  useEffect(() => {
    if (
      src !== undefined ||
      runtimeLogoUrl.trim() !== "" ||
      publicLogoUrl.trim() !== "" ||
      typeof window === "undefined"
    ) {
      return;
    }

    let cancelled = false;
    const loadPublicLogoUrl = async () => {
      const domain = window.location.host.split(":").shift() ?? "";
      let data: any = null;
      try {
        const response = await fetch(`/auth/org/${encodeURIComponent(domain)}`);
        if (response.ok) {
          data = await response.json();
        }
      } catch {
        // Fallback below.
      }
      if (!data) {
        try {
          const response = await fetch("/auth/singleorg");
          if (response.ok) {
            data = await response.json();
          }
        } catch {
          return;
        }
      }

      const logoUrl = (data?.customLogoUrl || "").trim();
      const logoTextLine1 = (data?.customLogoTextLine1 || "").trim();
      const logoTextLine2 = (data?.customLogoTextLine2 || "").trim();
      if (!cancelled) {
        RuntimeConfig.INFOS.customLogoUrl = logoUrl;
        RuntimeConfig.INFOS.customLogoTextLine1 = logoTextLine1;
        RuntimeConfig.INFOS.customLogoTextLine2 = logoTextLine2;
        setPublicLogoUrl(logoUrl);
        setPublicLogoTextLine1(logoTextLine1);
        setPublicLogoTextLine2(logoTextLine2);
      }
    };

    loadPublicLogoUrl();
    return () => {
      cancelled = true;
    };
  }, [src, runtimeLogoUrl, publicLogoUrl]);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) {
      onError(e);
    }
  };

  if (showLogoText) {
    return (
      <span className={className} style={style} aria-label={alt}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            lineHeight: 1.1,
            maxWidth: "100%",
          }}
        >
          <img
            {...imgProps}
            src={currentSrc}
            alt=""
            onError={handleError}
            style={{
              maxWidth: "110px",
              maxHeight: "64px",
              objectFit: "contain",
              flex: "0 0 auto",
            }}
          />
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              textAlign: "left",
              color: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            {customLogoTextLine1 !== "" && (
              <span style={{ fontSize: "1.15em", fontWeight: 700 }}>
                {customLogoTextLine1}
              </span>
            )}
            {customLogoTextLine2 !== "" && (
              <span style={{ fontSize: "0.78em", fontWeight: 500 }}>
                {customLogoTextLine2}
              </span>
            )}
          </span>
        </span>
      </span>
    );
  }

  return (
    <img
      {...imgProps}
      className={className}
      style={style}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

export default AppLogo;
