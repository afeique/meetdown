# Meetdown

*© 2025 Meetdown, Inc.*

## `asdf` Version Manager

To manage NodeJS versions, we decided to use [`asdf`](https://asdf-vm.com/) over [`volta`](https://docs.volta.sh/guide/getting-started).

The `asdf` utility is a language-agnost version manager. It is akin to python version management utilities like `conda`. We tried using `volta` first, but we kept running into errors when trying to pin a specific NodeJS version to the project.

As a result, we switched to `asdf`.

If preferred, it is entirely possible to use a system-level NodeJS installation for development. In this case, `npm` or `yarn` or some other *package* manager should be used. 

**TODO:** instructions for setting up project using system-wide NodeJS.

## Install `asdf`

### macOS and `zsh`

Follow the [asdf getting started guide](https://asdf-vm.com/guide/getting-started.html).  
1. Run `brew upgrade` if necessary
1. Run `brew install asdf`
1. Add to `.zshrc`: `export PATH="${ASDF_DATA_DIR:-$HOME/.asdf}/shims:$PATH"`
1. Install the [asdf oh-my-zsh plugin](https://github.com/kiurchv/asdf.plugin.zsh)

**Install `oh-my-zsh` plugin**

It's difficult to get the `asdf` plugin working as an antigen bundle. 
Consequently, the `asdf` plugin for `oh-my-zsh` is used instead.

Clone the `asdf` plugin repo:  
```
git clone https://github.com/kiurchv/asdf.plugin.zsh $HOME/.oh-my-zsh/custom/plugins/asdf
```

Then load the plugin in `.zshrc` by adding the following line:  
```
plugins+=(asdf)
```

Setup `asdf` autocompletion by addin the following lines to the bottom of `.zshrc`:  
```
# append completions to fpath
fpath=(${ASDF_DATA_DIR:-$HOME/.asdf}/completions $fpath)

# initialise completions with zsh's compinit
autoload -Uz compinit && compinit
```

### Use NodeJS with `asdf`

Install the latest NodeJS via the CLI using `asdf`:  
```
# Add plugin to asdf
asdf plugin add nodejs

# Install the latest v24.x.x
asdf install nodejs latest:24
```

## Integrate with Github

### Setup SSH and GPG

If you haven't already, setup an SSH key on github for pulling and committing, 
and setup a GPG key for signing commits.

1. [Check for existing SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/checking-for-existing-ssh-keys)
1. [Generate a new SSH key if needed and add it to `ssh-agent`](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)
1. [Generate a new GPG key if needed](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key)
1. [Add your SSH key to github](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
1. [Add your GPG key to github](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account)
1. [How to sign commits using `-S` flag](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits)

### Clone Remote Repository

Github defaults to calling the `master` branch `main`. We will stick with this nomenclature.

Clone the remote repository to a directory:  
```
git clone git@github.com/afeique/meetdown.git ~/projects/meetdown
```

Add github's public key to `~/.ssh/known_hosts` if necessary.

### Alternative: Use `git pull`

Alternatively, create the project directory, set the remote origin repository
(via SSH), and pull the latest version from origin:  
```
mkdir ~/projects/meetdown
cd ~/projects/meetdown
git remote add origin git@github.com:afeique/meetdown.git
git pull
```

### Install NodeJS Using `asdf`

Navigate to the project directory and install the version of NodeJS listed in `.tool_versions`:  
```
cd ~/projects/meetdown
asdf install
```

We are currently using the latest NodeJS v24.x.x, so that should be installed.

### Changing NodeJS Versions

Navigate to the project directory, install the desired NodeJS version, and set it in
`.tool_versions`. In this example, we are changing to the latest version of 22.x.x:  
```
cd ~/projects/meetdown
asdf install nodejs latest:22
asdf set nodejs latest:22
```

We can then switch back to using the latest version of NodeJS v24.x.x:  
```
asdf set nodejs latest:24
```

## Project Initialization

These are instructions for setting up a new NextJS project and committing it to github. 

This has already been done, so you shouldn't have to do this. This documentation is 
included primarily for reference purposes.

Create the meetdown project using `npx`:  
```
# Move into directory where project will be stored
cd ~/projects

# Set NodeJS to latest v24.x.x in .tool-versions of the `current directory`
asdf set nodejs latest:24

# Create the meetdown project and its corresponding directory
npx create-next-app@latest -e with-supabase
```

This should create the `~/projects/meetdown` directory. Once that is done,
add the remote repository via SSH, make the initial (signed `-S`) commit 
and push it `-u` upstream to branch `main`:  
```
git remote add origin git@github.com
git add --all
git commit -S -m "Initial commit"
git push -u origin main
```

# NextJS with Supabase

## Features

- Works across the entire [Next.js](https://nextjs.org) stack
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - It just works!
- supabase-ssr. A package to configure Supabase Auth to use cookies
- Styling with [Tailwind CSS](https://tailwindcss.com)
- Components with [shadcn/ui](https://ui.shadcn.com/)
- Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project

## Demo

You can view a fully working demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/).

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://app.supabase.com/project/_/settings/api)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
