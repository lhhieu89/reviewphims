// Keywords for different types of movie reviews
export const REVIEW_KEYWORDS = {
  general: ['Review phim 2025'],
  costume_drama: ['review phim cung đấu', 'review phim cung đấu 2025'],
  trailers: ['phim moi 2025 trailer', 'teaser phim moi'],
};

export const MOVIE_CATEGORIES = {
  ACTION: 'hành động',
  HORROR: 'kinh dị',
  ROMANCE: 'tình cảm',
  COMEDY: 'hài',
  ANIMATION: 'hoạt hình',
  THRILLER: 'tâm lý',
  DRAMA: 'chính kịch',
};

// Get random keyword from a category
export function getRandomKeyword(
  category: keyof typeof REVIEW_KEYWORDS
): string {
  const keywords = REVIEW_KEYWORDS[category];
  return keywords[Math.floor(Math.random() * keywords.length)];
}

// Get mixed keywords for variety
export function getMixedKeywords(): string[] {
  return [
    getRandomKeyword('general'),
    getRandomKeyword('costume_drama'),
    getRandomKeyword('trailers'),
  ];
}

// YouTube Categories for Entertainment
export const YOUTUBE_CATEGORIES = {
  ENTERTAINMENT: '24',
  FILM_ANIMATION: '1',
  PEOPLE_BLOGS: '22', // Many reviewers use this
};
