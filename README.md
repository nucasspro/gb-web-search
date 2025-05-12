# Search Engine Crawler API

A Next.js based API that crawls Google and Baidu search results, returning structured data and screenshots of the search results pages.

## Features

- Search results scraping from Google and Baidu
- Full-page screenshots of search results
- Cross-origin API accessible from any domain
- Visible browser mode to avoid CAPTCHAs
- Documentation and example client

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/gb-web-search.git
cd gb-web-search
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view the application

## API Usage

The API endpoint is accessible at `/api/search` and accepts a `query` parameter:

```
GET /api/search?query=example
```

For detailed documentation, visit the `/api-docs` page in the application.

## Deploying to Vercel

This application is designed to be deployed on Vercel.

### One-Click Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fgb-web-search)

### Manual Deployment

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install the Vercel CLI
```bash
npm install -g vercel
```

3. Login to Vercel
```bash
vercel login
```

4. Deploy the project
```bash
vercel
```

5. For production deployment
```bash
vercel --prod
```

### Configuration

The project includes a `vercel.json` file with optimized settings for the API:

- Increased memory allocation (3008MB) for the /api routes
- Extended execution timeout (60 seconds)
- CORS headers for all API responses

## Environment Variables

For Vercel deployment, set the following environment variable:

- `NEXT_PUBLIC_VERCEL_URL`: Set automatically by Vercel, used for API examples

## Technical Details

### Dependencies

- **Next.js**: React framework for server-rendered React applications
- **Puppeteer**: Headless Chrome Node.js API for browser automation
- **React**: JavaScript library for building user interfaces

### Implementation Notes

- Uses visible browser mode instead of headless to avoid CAPTCHAs
- Implements stealth techniques to bypass bot detection
- Captures full-page screenshots with scrolling
- Handles cross-origin requests with CORS headers

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Puppeteer team for their excellent browser automation tool
- Next.js team for the React framework
- Vercel for serverless deployment platform