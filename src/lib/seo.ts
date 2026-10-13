import { useEffect } from 'react';
import { APP_NAME } from './constants';

export interface SeoProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
  noindex?: boolean;
}

export function updatePageMeta({
  title,
  description,
  ogImage,
  canonical,
  noindex = false,
}: SeoProps) {
  // Update document title
  const fullTitle = title ? `${title} — ${APP_NAME}` : `${APP_NAME} — Cinematic Movie Discovery & Torrent Catalog`;
  document.title = fullTitle;

  // Update meta description
  let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  if (description) {
    metaDesc.content = description;
  }

  // Update og:title
  let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = fullTitle;

  // Update og:description
  let ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  if (description) {
    ogDesc.content = description;
  }

  // Update og:image if provided
  if (ogImage) {
    let ogImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (!ogImg) {
      ogImg = document.createElement('meta');
      ogImg.setAttribute('property', 'og:image');
      document.head.appendChild(ogImg);
    }
    ogImg.content = ogImage;
  }

  // Robots meta tag
  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (!robots) {
    robots = document.createElement('meta');
    robots.name = 'robots';
    document.head.appendChild(robots);
  }
  robots.content = noindex ? 'noindex, nofollow' : 'index, follow';

  // Canonical link
  let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) {
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonical;
  } else if (linkCanonical) {
    linkCanonical.remove();
  }
}

export function useSeo(props: SeoProps) {
  useEffect(() => {
    updatePageMeta(props);
  }, [props.title, props.description, props.ogImage, props.canonical, props.noindex]);
}
