# talc
Insta-CLI for your projects! 

Install via `npm install -g @evinism/talc`


## Overview:
Have you ever wanted your project to have it's own CLI? Now it can!

```
> talc build ui
nodejs: building... done!

> talc build server
building server via python...done!

> talc devserver
running docker-compose...success
dev server running at localhost:8080
```

Configuration via a `talc.yaml` file in the same directory

Think `package.json` scripts but hierarchical and intended to be language independent.

## Example:
Here's a sample `talc.yaml` file:

`talc.yaml`:
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

## Aliasing!
Let's say you don't like using the `talc` command, and want it instead to be `myproject build` to look and feel more professional, or that you want your CLI to be accessable from any working directory.

Running `talc meta alias` gives you the proper alias to put in your `.bashrc` to ensure that you can use the cli `myproject` from anywhere!

If you want, you can use this tool to distribute company-wide CLIs and tooling everywhere in your company.
