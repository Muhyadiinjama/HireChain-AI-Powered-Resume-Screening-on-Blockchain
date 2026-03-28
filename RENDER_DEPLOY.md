# Render Deployment Guide

This project is configured to deploy to Render with:

- `hirechain-api` as a Node web service from `server/`
- `hirechain-web` as a static site from `client/`

The shared Render blueprint is defined in [`render.yaml`](./render.yaml).

## 1. Push to GitHub

Push the whole repository to GitHub, including:

- `render.yaml`

## 2. Create the Render Blueprint

In Render:

1. Click `New +`
2. Choose `Blueprint`
3. Connect your GitHub repo
4. Render will detect `render.yaml`

This will create:

- `hirechain-api`
- `hirechain-web`

## 3. Fill in the server environment variables

Required for the API:

- `MONGO_URI`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `GEMINI_API_KEY`

Recommended:

- `CORS_ORIGIN`
  Set this to your Render frontend URL, for example:
  `https://hirechain-web.onrender.com`

Optional blockchain values:

- `BLOCKCHAIN_ENABLED`
- `BLOCKCHAIN_REQUIRE_ONCHAIN`
- `BLOCKCHAIN_RPC_URL`
- `BLOCKCHAIN_PRIVATE_KEY`
- `BLOCKCHAIN_CONTRACT_ADDRESS`
- `BLOCKCHAIN_CHAIN_ID`
- `BLOCKCHAIN_NETWORK`
- `BLOCKCHAIN_EXPLORER_URL`

If you are not ready for blockchain yet, keep:

```env
BLOCKCHAIN_ENABLED=false
BLOCKCHAIN_REQUIRE_ONCHAIN=false
```

## 4. Fill in the client environment variables

Required for the frontend:

- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Important:

- `VITE_API_URL` must point to your Render API URL and include `/api`
- Example:
  `https://hirechain-api.onrender.com/api`

## 5. Add your frontend domain to Firebase

In Firebase Authentication:

1. Open your Firebase project
2. Go to `Authentication`
3. Open `Settings`
4. Add your Render frontend domain to `Authorized domains`

Example:

- `hirechain-web.onrender.com`

If you use a custom domain later, add that too.

## 6. Redeploy the frontend after setting `VITE_API_URL`

If the frontend was built before the API URL was set correctly, redeploy the static site once after saving the env vars.

## 7. Verify after deploy

Check:

1. frontend opens successfully
2. login/register works
3. job list loads
4. create job works
5. apply flow works
6. AI screening result page works

## Important note about resume files

Right now resumes are uploaded to the local server filesystem with Multer.

That works locally and can work temporarily on Render, but Render web services use ephemeral disk storage. Uploaded files can disappear after restarts or redeploys.

If you want reliable production resume storage, move uploaded files to a persistent external service such as:

- Cloudinary
- AWS S3
- Firebase Storage
- Supabase Storage

The current deployment setup is fine for initial live demo hosting, but not ideal for long-term resume file persistence.
