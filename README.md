# Random Password Generator

A simple serverless function for Vercel that generates strong random passwords.

## Endpoint

- **GET /api/pass**: Returns a JSON object with a randomly generated strong password.

Example response:
```json
{
  "password": "Ab3!Xy9@ZkLp"
}
```

## Password Characteristics

- Length: 12 characters
- Includes: Uppercase letters, lowercase letters, numbers, and symbols
- Ensures at least one of each type

## Deployment to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Deploy: `vercel`
4. Access your domain at `https://your-domain.vercel.app/api/pass`

## Local Development

Run `vercel dev` to test locally.
