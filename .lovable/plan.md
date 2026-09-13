# Set up "creionescu website" Git repository

## Goal
Turn the current Lovable project into a standalone Git repository named "creionescu website", without adding any new website features yet.

## Plan

1. **Detach from Lovable template gitdir**
   - The current `.git` is a gitlink pointing to a shared template pool. Remove it and run `git init` to create a fresh, standalone local repository.

2. **Name the project**
   - Update `package.json` `name` to `"creionescu-website"`.
   - Update the root route metadata title/description from "Lovable App" / "Lovable Generated Project" to "Creionescu Website" so the repo's default identity matches the requested name.

3. **Make initial commit**
   - Stage all existing project files (respecting `.gitignore`).
   - Commit with message: `chore: initial commit for creionescu website`.

4. **Prepare for remote (optional, pending your preference)**
   - If you want this pushed to GitHub, the next step would be to create a remote repository named `creionescu-website` and push the initial commit. This requires your GitHub credentials and approval, so it is left as a follow-up step unless you confirm you want it done now.

## Outcome
A clean, standalone local Git repo named for the project, ready for you to develop in and push to a remote host of your choice.