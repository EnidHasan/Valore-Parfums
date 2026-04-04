# Netlify Deployment Guide

This guide explains how to deploy the project to Netlify using the dedicated deployment branch and environment configuration.

## 1. Branch for Deployment
- Use the `deploy/netlify` branch for all Netlify-specific deployment changes.

## 2. Environment Variables
- The `.env.netlify` file contains all required environment variables for Netlify.
- Make sure to add these variables in the Netlify dashboard under Site settings > Environment variables.

## 3. Build Settings
- Set the build command to: `npm run build`
- Set the publish directory to: `valore-parfums/.next`

## 4. Next.js Configuration
- No special changes are required in `next.config.ts` for Netlify unless you need Netlify-specific logic.
- If needed, you can use `process.env.NEXT_PUBLIC_ENV === 'netlify'` to add Netlify-specific configuration.

## 5. Deployment Steps
1. Push your changes to the `deploy/netlify` branch.
2. Connect your repository to Netlify and select the `deploy/netlify` branch.
3. Add the environment variables from `.env.netlify` to Netlify's dashboard.
4. Trigger a deploy.

---

For advanced customization, refer to the [Netlify Next.js documentation](https://docs.netlify.com/integrations/frameworks/next-js/).
