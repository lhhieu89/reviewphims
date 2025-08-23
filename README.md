# Review Phim - YouTube Video Browser

A modern, production-ready Next.js application for browsing and discovering YouTube videos with a focus on Vietnamese content. Built with Next.js 14, TypeScript, and Tailwind CSS with Docker deployment.

## Features

- 🎬 Browse trending videos in Vietnam
- 🔍 Search videos with pagination
- 📱 Responsive design (mobile-first)
- 🌙 Dark/light mode support
- ⚡ Server-side rendering with ISR
- 🔒 Secure API key handling
- 📊 SEO optimized with structured data
- 🚀 Rate limiting and error handling
- ♿ Accessibility features
- 🐳 Docker deployment ready
- 💊 Health check endpoint

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Icons**: Heroicons
- **Deployment**: Docker + Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- YouTube Data API v3 key

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd review-phim
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

4. Get a YouTube API key and configure environment:

#### Getting YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. (Optional) Restrict the API key:
   - Click on the API key to edit
   - Under "API restrictions", select "YouTube Data API v3"
   - Under "Application restrictions", you can restrict by HTTP referrers for production

#### Environment Configuration

Edit your `.env` file:

```env
YOUTUBE_API_KEY=your_actual_api_key_here
YOUTUBE_REGION_CODE=VN
SITE_URL=http://localhost:3000
```

For production (Docker):

```env
YOUTUBE_API_KEY=your_actual_api_key_here
YOUTUBE_REGION_CODE=VN
SITE_URL=https://your-domain.com:3001
```

5. Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

### Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm type-check` - Run TypeScript type checking

### Docker
- `pnpm docker:build` - Build Docker image
- `pnpm docker:run` - Run Docker container locally
- `pnpm docker:dev` - Start development with Docker Compose
- `pnpm docker:prod` - Start production with Docker Compose

### Deployment
- `pnpm deploy:staging` - Deploy to staging server
- `pnpm deploy:production` - Deploy to production server
- `pnpm rollback` - Rollback to previous version

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/youtube/       # API routes
│   ├── search/            # Search page
│   ├── video/[id]/        # Video detail page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── VideoCard.tsx
│   ├── VideoGrid.tsx
│   ├── SearchBar.tsx
│   └── Pagination.tsx
├── lib/                   # Utilities
│   ├── env.ts            # Environment validation
│   ├── youtube.ts        # YouTube API wrapper
│   ├── format.ts         # Formatting utilities
│   ├── rate-limiter.ts   # Rate limiting
│   └── utils.ts          # General utilities
└── types/                # TypeScript types
    └── youtube.ts        # YouTube API types
```

## API Endpoints

All YouTube API calls are handled server-side through these endpoints:

- `GET /api/youtube/most-popular` - Get trending videos
- `GET /api/youtube/search` - Search videos
- `GET /api/youtube/video` - Get video details
- `GET /api/youtube/channel` - Get channel details
- `GET /api/youtube/related` - Get related videos
- `GET /api/health` - Health check endpoint

## YouTube API Quota Management

The YouTube Data API v3 has daily quota limits. Here are strategies to optimize usage:

### Quota Costs (per request)

- `videos.list`: 1 unit per request
- `search.list`: 100 units per request
- `channels.list`: 1 unit per request

### Optimization Strategies

1. **Reduce API calls**:
   - Implement caching (already done with Next.js ISR)
   - Use `maxResults` parameter efficiently
   - Avoid unnecessary API calls

2. **Optimize `part` parameters**:

   ```javascript
   // Instead of requesting all parts:
   part: 'snippet,contentDetails,statistics,status';

   // Only request what you need:
   part: 'snippet,statistics';
   ```

3. **Monitor quota usage**:
   - Check Google Cloud Console for quota usage
   - Set up alerts for quota limits
   - Consider implementing quota-aware error handling

4. **Production considerations**:
   - Request quota increase if needed
   - Implement fallback mechanisms
   - Consider caching strategies (Redis, etc.)

## Deployment

### Docker (Recommended)

The application is containerized for easy deployment on any server with Docker.

#### Quick Deploy

1. **Deploy to staging:**
   ```bash
   ./scripts/deploy.sh staging YOUR-SERVER-IP USERNAME
   ```

2. **Deploy to production:**
   ```bash
   ./scripts/deploy.sh production YOUR-SERVER-IP USERNAME
   ```

3. **Rollback if needed:**
   ```bash
   ./scripts/rollback.sh YOUR-SERVER-IP USERNAME
   ```

#### Setup Requirements

- Docker and Docker Compose on target server
- SSH access to the server
- Port 3001 available (configurable)

#### Environment Configuration

Create `.env.staging` or `.env.production`:
```bash
NODE_ENV=production
YOUTUBE_API_KEY=your_actual_api_key_here
YOUTUBE_REGION_CODE=VN
SITE_URL=http://your-domain.com:3001
```

**📖 For detailed deployment guide, see: [README_DOCKER_DEPLOYMENT.md](README_DOCKER_DEPLOYMENT.md)**

### Other Platforms

The application can also be deployed to:

- Railway
- DigitalOcean App Platform  
- AWS ECS/Fargate
- Any Docker-compatible hosting service
- Traditional VPS with Docker

## Environment Variables

| Variable              | Description                     | Required | Default                 |
| --------------------- | ------------------------------- | -------- | ----------------------- |
| `YOUTUBE_API_KEY`     | YouTube Data API v3 key         | Yes      | -                       |
| `YOUTUBE_REGION_CODE` | Region code for trending videos | No       | `VN`                    |
| `SITE_URL`            | Base URL of your site           | No       | `http://localhost:3000` |

## Performance Features

- **ISR (Incremental Static Regeneration)**: Pages are cached and revalidated
- **Image Optimization**: Next.js Image component with WebP/AVIF support
- **Code Splitting**: Automatic code splitting by Next.js
- **Rate Limiting**: Prevents API abuse
- **Error Boundaries**: Graceful error handling
- **SEO Optimization**: Meta tags, structured data, sitemap
- **Docker Multi-stage Build**: Optimized production images
- **Health Checks**: Automatic container health monitoring

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Troubleshooting

### Common Issues

1. **YouTube API Key Issues**:
   - Ensure the API key is valid and has YouTube Data API v3 enabled
   - Check quota limits in Google Cloud Console
   - Verify API key restrictions

2. **Build Errors**:
   - Run `pnpm type-check` to identify TypeScript issues
   - Ensure all environment variables are set

3. **Rate Limiting**:
   - The app includes built-in rate limiting
   - Adjust limits in `src/lib/rate-limiter.ts` if needed

4. **CORS Issues**:
   - All YouTube API calls are server-side only
   - Client-side calls to YouTube API are not supported

### Getting Help

- Check the [Next.js documentation](https://nextjs.org/docs)
- Review [YouTube Data API documentation](https://developers.google.com/youtube/v3)
- Open an issue in the repository
