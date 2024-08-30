# Welcome to Remix!

- 📖 [Remix docs](https://remix.run/docs)

## Installation

Install new project:

```shellscript
npx create-remix@latest ./my-app --template https://github.com/perivar/RemixFirebaseTemplate
```

## Linting (ESLint)

Linting (ESLint):

```shellscript
yarn lint
```

or

```shellscript
yarn lint-fix
```

## Checking formatting (Prettier)

Check formatting (Prettier):

```shellscript
yarn format
```

or

```shellscript
yarn format-fix
```

## Development

Run the dev server:

```shellscript
yarn dev
```

## Deployment

First, build your app for production:

```sh
yarn build
```

Then run the app in production mode:

```sh
yarn start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `yarn build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.

## Adding more Shadcn-ui components

This template comes with Shadcn and Dark Mode already installed
To add more ui components use:

```shellscript
npx shadcn-ui@latest add input label select
```
