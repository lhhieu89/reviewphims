interface StructuredDataProps {
  type: 'website' | 'video' | 'article';
  data: {
    url: string;
    name?: string;
    title?: string;
    description?: string;
    image?: string;
    author?: string;
    datePublished?: string;
    dateModified?: string;
    duration?: string;
    thumbnailUrl?: string;
    uploadDate?: string;
    embedUrl?: string;
    publisher?: {
      name: string;
      logo?: string;
    };
  };
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData;

  switch (type) {
    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name || 'Review Phim',
        description: data.description,
        url: data.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
        publisher: {
          '@type': 'Organization',
          name: data.publisher?.name || 'Review Phim',
          logo: {
            '@type': 'ImageObject',
            url: data.publisher?.logo || `${data.url}/icon-512.png`,
          },
        },
      };
      break;

    case 'video':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: data.title,
        description: data.description,
        thumbnailUrl: data.thumbnailUrl,
        uploadDate: data.uploadDate || data.datePublished,
        duration: data.duration,
        embedUrl: data.embedUrl,
        contentUrl: data.url,
        publisher: {
          '@type': 'Organization',
          name: data.publisher?.name || 'YouTube',
        },
        author: {
          '@type': 'Person',
          name: data.author,
        },
      };
      break;

    case 'article':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        url: data.url,
        datePublished: data.datePublished,
        dateModified: data.dateModified || data.datePublished,
        author: {
          '@type': 'Person',
          name: data.author,
        },
        publisher: {
          '@type': 'Organization',
          name: data.publisher?.name || 'Review Phim',
          logo: {
            '@type': 'ImageObject',
            url: data.publisher?.logo || `${data.url}/icon-512.png`,
          },
        },
      };
      break;

    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
