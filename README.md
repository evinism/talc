# Talc: Insta-CLI for your projects! 

Install via `npm install -g @evinism/talc`

## Overview
Have you ever wanted your project to have it's own custom CLI? Now it can!

```
> talc build ui
nodejs: building... done!

> talc build server
building server via python...done!

> talc devserver
running docker-compose...success
dev server running at localhost:8080
```

Configuration is specified via a `talc.yaml` file located in the same directory where you run the `talc` command.

Think `package.json` scripts but hierarchical and intended to be language independent.

## Example
Here's a sample `talc.yaml` file:

```yaml
doc: Project CLI!
commands:
  - name: build
    doc: Build a subproject!
    commands:
      - name: ui
        doc: Build the UI subproject
        shell:
          "cd ./ui && yarn build"
      - name: server
        doc: Build the server subproject
        shell:
          "cd ./server && yarn build"
      - name: all
        doc: Build everything
        shell:
          "talc build ui && talc build server"
  - name: deploy
    doc: Deploy an environment
    commands:
      - name: cool-env
        doc: Deploy cool-env
        shell:
          "run_some_deploy_command"
  - name: say 
    doc: output something to the terminal!
    shell:
      "echo"
```

## Aliases
Talc allows you to easily create and use custom, CWD-independent, commands. For example, if you want to use `myproject foo bar` rather than `talc foo bar`, you can run `talc meta alias` to get the proper alias to put in your `.bashrc` or `.zshrc` file. The primary advantage is that you can use the `myproject` command from anywhere, regardless of your working directory!

```
> talc meta alias
Add the following line to your aliases file:
alias myproject="TALCDIR=/Users/evinsellin/myproject talc"
```

One of the major advantages of this is the ability to create company-wide CLIs for easy internal tooling and documentation!
