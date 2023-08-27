

## Getting Started

Install Pre-requisite libraries

```bash
npm i
```

Environmental Variables

```env
BASE_URL="https://localhost:3000"


# Project ID
PROJECT_ID=

# Private Key ID
PRIVATE_KEY_ID=

# Private Key 
PRIVATE_KEY=

# Client Email
CLIENT_EMAIL=

# Client ID
CLIENT_ID=

# Auth URI
AUTH_URI=

# Token URI
TOKEN_URI=

# Auth Provider x509 Cert URL
AUTH_PROVIDER_X509_CERT_URL=

# Client x509 Cert URL
CLIENT_X509_CERT_URL=

# Universe Domain
UNIVERSE_DOMAIN=
```
Place Google api credentials in an env file with the above keys
Ensure that the following services are enabled

Google Text To Speech
Google Speech To TExt
Google Vertex AI

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
