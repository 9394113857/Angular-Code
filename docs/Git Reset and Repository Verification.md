# 🔧 Git Reset and Repository Verification

## 📌 Purpose

This document explains how to:

* 🔄 Reset the local branch to a specific commit/SHA
* 🔍 Verify the current local commit
* 🌐 Verify the `origin/main` commit
* ✅ Confirm local `main` and `origin/main` point to the same commit
* 🧹 Understand `git reset --hard`
* 🚀 Understand when a force push is required
* 💾 Safely finish work and close VS Code

---

# 1️⃣ Check Current Git Status

Always check the repository before making changes:

```bash
git status
```

This shows:

* 🌿 Current branch
* 🔄 Whether the branch is ahead/behind `origin`
* ✏️ Modified files
* 📁 Untracked files
* 📦 Staged changes

Example:

```text
On branch main
Your branch is up to date with 'origin/main'.

nothing added to commit
```

---

# 2️⃣ Fetch Latest Remote Information

To update your local information about the remote repository:

```bash
git fetch origin
```

### 🧠 Important

`git fetch` downloads information about changes from the remote repository.

It does **not** automatically modify your working files.

---

# 3️⃣ Reset Local `main` to a Specific SHA

Suppose the required commit is:

```text
c7ff90a
```

You can reset the local branch to that commit:

```bash
git reset --hard c7ff90a
```

Or, if you want local `main` to exactly match the current remote-tracking `origin/main`:

```bash
git reset --hard origin/main
```

### ⚠️ Warning

`--hard` can discard changes in tracked files in the working directory.

Before using it, make sure any changes you want to keep are committed or stashed.

---

# 4️⃣ Verify the Local Commit

Use:

```bash
git rev-parse HEAD
```

Example:

```text
c7ff90a37cca785fc98db78b36753448a6ea3b11
```

### 🧠 Meaning

`HEAD` represents the commit currently checked out by your local repository.

So:

```text
HEAD
 ↓
Local main's current commit
```

---

# 5️⃣ Verify `origin/main`

Use:

```bash
git rev-parse origin/main
```

Example:

```text
c7ff90a37cca785fc98db78b36753448a6ea3b11
```

### 🧠 Meaning

`origin/main` is your local remote-tracking reference for the remote repository's `main` branch.

It represents the remote state known to your local Git repository after fetching.

---

# 6️⃣ Verify Both at the Same Time

You can print both SHA values with one command:

```bash
git rev-parse HEAD origin/main
```

Example:

```text
c7ff90a37cca785fc98db78b36753448a6ea3b11
c7ff90a37cca785fc98db78b36753448a6ea3b11
```

If both values are identical:

```text
LOCAL HEAD  = c7ff90a37cca...
ORIGIN MAIN = c7ff90a37cca...

✅ SAME COMMIT
```

This confirms that the local `HEAD` and `origin/main` currently point to the same commit.

---

# 7️⃣ Compare Local and Remote Commit Content

You can also run:

```bash
git diff HEAD origin/main
```

If there is no output, there is no content difference between those two commits.

Another useful command is:

```bash
git status
```

Git can report:

```text
Your branch is up to date with 'origin/main'.
```

---

# 8️⃣ Important Difference: Local Reset vs GitHub

This command:

```bash
git reset --hard c7ff90a
```

changes the **local branch**.

It does not automatically move GitHub's `main` branch.

For example:

```text
GitHub origin/main
        ↓
      newer commit

Local main
        ↓
      c7ff90a
```

After:

```bash
git reset --hard c7ff90a
```

the local branch points to `c7ff90a`, but GitHub may still point to the newer commit.

---

# 9️⃣ If You Intentionally Need to Move Remote `main`

If the intention is to rewrite the remote `main` branch to the local commit, a force push may be required:

```bash
git push --force-with-lease origin main
```

### ⚠️ Use Carefully

Force pushing can rewrite branch history and affect other people working on the branch.

`--force-with-lease` provides a safety check compared with a plain:

```bash
git push --force
```

Do not use either command unless you intentionally want to rewrite the remote branch.

---

# 🔟 Temporary Protection with Git Stash

If you have local changes that you want to temporarily protect:

```bash
git stash push -m "temporary-changes"
```

You can later restore them with:

```bash
git stash pop
```

If you decide you no longer need the stash:

```bash
git stash drop
```

### Example

```text
Working changes
      ↓
   git stash
      ↓
Temporary saved copy
      ↓
Do Git operations
      ↓
git stash pop
      ↓
Changes restored
```

If you intentionally no longer need the changes:

```text
git stash drop
```

deletes that stash entry.

---

# 1️⃣1️⃣ Example: Synchronize Local `main`

A common workflow is:

```bash
git status
git fetch origin
git reset --hard origin/main
git status
```

Then verify:

```bash
git rev-parse HEAD origin/main
```

Expected:

```text
SAME SHA
SAME SHA
```

Therefore:

```text
LOCAL main     = origin/main
       ✅
```

---

# 1️⃣2️⃣ Untracked Files

If `git status` shows:

```text
Untracked files:

docs/FastAPI Commands/
docs/code-format-prompt.txt
```

those files are not currently tracked by Git.

They are separate from the committed repository history.

Do not use:

```bash
git add .
```

unless you intentionally want to stage all of them.

You can inspect them manually first.

---

# 1️⃣3️⃣ Closing VS Code

There is no special Git command required to close VS Code.

After checking your work:

```bash
git status
```

you can simply close VS Code.

Closing VS Code does **not**:

* ❌ reset Git
* ❌ commit changes
* ❌ push changes
* ❌ pull changes
* ❌ delete the repository

The Git repository remains in the project folder.

---

# 🧠 Simple Mental Model

```text
                GitHub
                  │
                  ▼
             origin/main
                  │
                  │ fetch
                  ▼
             Local Git
                  │
                  ▼
                HEAD
                  │
                  ▼
          Working Directory
                  │
                  ▼
               VS Code
```

### 🔄 Reset

```text
git reset --hard <SHA>
        ↓
Move local branch/working tree
```

### 🌐 Fetch

```text
git fetch origin
        ↓
Update remote-tracking information
```

### 🔍 Verify

```text
git rev-parse HEAD origin/main
        ↓
Compare commit SHAs
```

### 📦 Stash

```text
git stash
        ↓
Temporarily save local changes
```

### 🗑️ Drop stash

```text
git stash drop
        ↓
Delete the saved stash
```

### 🚀 Push

```text
git push
        ↓
Send commits to GitHub
```

### 🛑 Close VS Code

```text
git status
      ↓
Review state
      ↓
Close VS Code
```

---

# ⭐ Quick Command Reference

| Purpose              | Command                                   |
| -------------------- | ----------------------------------------- |
| 📋 Check status      | `git status`                              |
| 🌐 Fetch remote      | `git fetch origin`                        |
| 🔄 Reset to SHA      | `git reset --hard <SHA>`                  |
| 🔄 Match remote main | `git reset --hard origin/main`            |
| 🔍 Local SHA         | `git rev-parse HEAD`                      |
| 🌐 Remote SHA        | `git rev-parse origin/main`               |
| 🔍 Both SHAs         | `git rev-parse HEAD origin/main`          |
| 🆚 Compare commits   | `git diff HEAD origin/main`               |
| 📦 Stash changes     | `git stash`                               |
| 📦 Stash with name   | `git stash push -m "message"`             |
| ♻️ Restore stash     | `git stash pop`                           |
| 🗑️ Delete stash     | `git stash drop`                          |
| 🚀 Push              | `git push origin main`                    |
| ⚠️ Force safely      | `git push --force-with-lease origin main` |

---

# 🎯 Example Based on This Project

Current desired baseline:

```text
Branch: main

Commit:
c7ff90a37cca785fc98db78b36753448a6ea3b11

Local:
HEAD → c7ff90a37cca...

Remote:
origin/main → c7ff90a37cca...

Status:
✅ Local main and origin/main point to the same commit.
```

This commit can be used as a known baseline for future development and testing.
