---
title:  "Getting Started With Git"
date:   2025-08-15
summary: ""
tags:
---
# Learning Git
___


For help:

```bash
    git help
```

### 1. Setting up Git

Before that, For check

```bash
    git config --list --global
```

```bash
    git config --global user.name "iamprasadraju"
    git config --global user.email "gls.prasadraju@duck.com"
```

**(Optional)** Setting code editor

```bash
    git config --global core.editor "vim"
```
___

### 2.  Creating a Repository (local)

```bash
    mkdir <projectname>
    cd <projectname>

    // Initializing Repository
    git init
```
.git dir is created, it stores all the history

___

### 3. Tracking Changes

```bash
    git status
```

<blockquote>
    On branch main
    No commits yet
    nothing to commit (create/copy files and use "git add" to track)
</blockquote>

___


### 4. Adding a file to track

    Create a file ```README.md```

```bash
    git add <file>
```

Then check **git status**

___

### 5. Writing commit messages

```bash
    git commit -m "<commit messages"
```

<blockquote>
    Example:

    [main (root-commit) af6f22b] Initial commit
    1 file changed, 81 insertions(+)
    create mode 100644 README.md
</blockquote>

![gitworkflow img](https://swcarpentry.github.io/git-novice/fig/git-staging-area.svg)

If we modified any tracked file -> It will show *modified:<file>*

Check the difference/modified content by ```git diff <file>``` or ```git diff``` for all modified content in that Repository. ```git diff --staged``` for staged files.

<blockquote>
    diff --git a/guacamole.md b/guacamole.md
    index 315bf3a..b36abfd 100644
    --- a/guacamole.md
    +++ b/guacamole.md
    @@ -1,6 +1,6 @@
    # Guacamole
    ## Ingredients
    * avocado
    -* lemon
    +* lime
    * salt
    ## Instructions
</blockquote>


We can look at history of repo (just like logs):

```bash
    git log
```

<blockquote>
    Example:

    commit 005937fbe2a98fb83f0ade869025dc2636b4dad5 (HEAD -> main)
    Author: Alfredo Linguini <a.linguini@ratatouille.fr>
    Date:   Thu Aug 22 10:14:07 2013 -0400

        Modify guacamole to the traditional recipe

    commit 34961b159c27df3b475cfe4415d94a6d1fcd064d
    Author: Alfredo Linguini <a.linguini@ratatouille.fr>
    Date:   Thu Aug 22 10:07:21 2013 -0400

        Add ingredients for basic guacamole

    commit f22b25e3233b4645dabd0d81e651fe074bd8e73b
    Author: Alfredo Linguini <a.linguini@ratatouille.fr>
    Date:   Thu Aug 22 09:51:46 2013 -0400

        Create initial structure for a Guacamole recipe
</blockquote>

Useful code:

```bash
    # using -N, where N is the number of commits that you want to view
    git log -1

    # You can also reduce the quantity of information using the --oneline
    git log --oneline

     # --graph to display the commit history as a text-based graph
    git log --oneline --graph
```

![github workflow](https://swcarpentry.github.io/git-novice/fig/git-committing.svg)

___

### 6. Exploring History

```bash
    git diff HEAD <file>
```

Note that HEAD is the default option for git diff, so omitting it will not change the command’s output at all (give it a try). However, the real power of git diff lies in its ability to compare with previous commits. For example, by adding ~1 (where “~” is “tilde”, pronounced [til-duh]), we can look at the commit before HEAD.

```bash
    git diff HEAD~1 <file>
```

<blockquote>
    diff --git a/guacamole.md b/guacamole.md
    index df0654a..b36abfd 100644
    --- a/guacamole.md
    +++ b/guacamole.md
    @@ -1,3 +1,6 @@
    # Guacamole
    ## Ingredients
    +* avocado
    +* lime
    +* salt
    ## Instructions
</blockquote>

We could also use git show which shows us what changes we made at an older commit as well as the commit message, rather than the differences between a commit and our working directory that we see by using git diff.

```bash
    git show HEAD~2 guacamole.md
```

<blockquote>
    commit f22b25e3233b4645dabd0d81e651fe074bd8e73b
    Author: Alfredo Linguini <a.linguini@ratatouille.fr>
    Date:   Thu Aug 22 10:07:21 2013 -0400

        Create a template for recipe

    diff --git a/guacamole.md b/guacamole.md
    new file mode 100644
    index 0000000..df0654a
    --- /dev/null
    +++ b/guacamole.md
    @@ -0,0 +1,3 @@
    +# Guacamole
    +## Ingredients
    +## Instructions
</blockquote>

___

### 7. Restore a file

```bash
    git restore <file>
```

As you might guess from its name, ```git restore``` restores an old version of a file. By default, it recovers the version of the file recorded in HEAD, which is the last saved commit. If we want to go back even further, we can use a commit identifier instead, using -s option:

```bash
    git restore -s <commit_id> <file>
```

![githubworkflow-img](https://swcarpentry.github.io/git-novice/fig/git-restore.svg)

So, to put it all together, here’s how Git works in cartoon form:

![img](https://swcarpentry.github.io/git-novice/fig/git_staging.svg)

git diff and git log are very useful and they summarize a different part of the history for you. Is it possible to combine both? Let’s try the following:

```bash
    git log --patch <file>
```
___

### 8. Ignoring Things

The only thing Git notices now is the newly-created ```.gitignore``` file. You might think we wouldn’t want to track it, but everyone we’re sharing our repository with will probably want to ignore the same things that we’re ignoring. Let’s add and commit ```.gitignore```:

```bash
    git add .gitignore
    git commit -m "Ignore png files and the pictures folder."
    git status
```

<blockquote>
    On branch main
    nothing to commit, working tree clean
</blockquote>

If we really want to override our ignore settings, we can use git add -f to force Git to add something. For example, git add -f a.png. We can also always see the status of ignored files if we want:

Adding ignored file forcely ```git add -f <file>```

```bash
    git status --ignored
```
___


### 9. Remotes in github

- Create a remote repository at [Github](https://github.com/new)

- Connect local to remote repository (https) -> ```git remote add orgin <repo url>```

We can check that the command has worked by running ```git remote -v```:

```bash
    git remote -v
```

- Push local changes to a remote

```bash
    git push origin main
```

![img](https://swcarpentry.github.io/git-novice/fig/github-repo-after-first-push.svg)


<blockquote>
    You may see a `-u` option used with `git push` in some documentation. This option is synonymous with the `--set-upstream-to` option for the `git branch` command, and is used to associate the current branch with a remote branch so that the `git pull`command can be used without any arguments. To do this, simply use `git push -u origin main` once the remote has been set up.
</blockquote>

## SSH setup

1. Generate SSH key

```bash
    ssh-keygen -t ed25519 -C "gls.prasadraju@gmail.com"
```
Generate one Private and one Public Key


2. config SSH configuration

```bash
    # rename the private as you want
    mv id_ed25519 github

    # create .ssh dir if not exists
    mkdir ~/.ssh
    mv github ~/.SSH
```

- you will need to modify your ~/.ssh/config file to automatically load keys into the ssh-agent and store passphrases in your keychain.

```bash
vim ~/.ssh/config


# add this
Host github.com
    HostName github.com
    User github
    IdentityFile ~/.ssh/github
```

3. To verify the key is correctly set up with GitHub, test the connection using:

```bash
    ssh -T git@github.com
```
If successful, you’ll see a message like:

<blockquote>
    Hi iamprasadraju! You've successfully authenticated, but GitHub does not provide shell access.
</blockquote>
