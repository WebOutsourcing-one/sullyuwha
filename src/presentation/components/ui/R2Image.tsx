"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import type { Image as ImageEntity } from "@/domain/value-objects/Image";
import { assetResolver } from "@/composition/assets";

interface R2ImageProps {
  image: ImageEntity;
  sizes: string;
  className?: string;
  priority?: boolean;
}

const FALLBACK_SRC = "/placeholder.png";
const LOADING_SRC = "/loding.png";

export function R2Image({ image, sizes, className, priority }: R2ImageProps) {
  const resolvedUrl = assetResolver.resolve(image.asset, image.ext);
  const [imgSrc, setImgSrc] = useState(FALLBACK_SRC);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (resolvedUrl) {
      setImgSrc(resolvedUrl);
    } else {
      setIsLoading(false);
    }
  }, [resolvedUrl]);

  const handleError = () => {
    setImgSrc(FALLBACK_SRC);
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && (
        <div
          role="img"
          aria-label={image.alt}
          className={`absolute inset-0 ${className ?? ""}`}
        >
          <NextImage
            src={LOADING_SRC}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      )}
      <NextImage
        src={imgSrc}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={image.ext === "gif"}
        className={`object-cover ${className ?? ""}`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
      />
    </>
  );
}

function LoadingPlaceholder({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={`absolute inset-0 ${className ?? ""}`}
    >
      <NextImage
        src="/loding.png"
        alt=""
        fill
        className="object-cover"
      />
    </div>
  );
}

function FallbackPlaceholder({
  alt,
  className,
}: {
  alt: string;
  className?: string;
}) {
  return (
    <div
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      className={`absolute inset-0 ${className ?? ""}`}
    >
      <NextImage
        src="/placeholder.png"
        alt=""
        fill
        className="object-cover"
      />
    </div>
  );
}
