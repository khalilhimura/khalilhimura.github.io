---
title: "The Handoff Tax: Why I'm Building TFIS Loom"
source: "The Future Is Solo"
sourceUrl: "https://thefutureissolo.com/loom/"
publishedAt: 2026-10-19
summary: "One person directing many AI agents loses a little judgment at every handoff. TFIS Loom is my early experiment in keeping that judgment, sharing it with each agent, and staying in charge of what changes."
tags: ["Future Is Solo", "TFIS Loom", "AI agents", "judgment"]
media: []
crawlStatus: "manual-review"
---

![A human hand passing a brass key with a folded note to an abstract hand of glowing amber threads](/media/the-handoff-tax-2026-10-19.jpg)

**ONE HUMAN'S JUDGMENT. MANY AGENTS' CAPABILITY.**

That's the line I keep coming back to. Here's the problem behind it.

When you run a one-person company with AI, you don't work with one agent. You work with several. One researches. One builds. One reviews.

Every time work moves from me to an agent, or from one agent to the next, something leaks.

Each agent starts cold.

It asks questions I already answered. It suggests things I already ruled out. And slowly, quietly, it drifts away from decisions I made weeks ago.

So I explain again. I correct again. I re-brief again.

I call this the handoff tax. And the more agents I add, the more I pay.

That's the opposite of what the TFIS thesis promises.

A one-person company isn't one person doing ten people's jobs. It's one person designing a system so they don't have to.

But if I have to re-teach every agent every time, I'm not designing a system. I'm just a very busy translator between my own head and a row of chat windows.

The capability is there. What's missing is a place for my judgment to live.

**So I started building one. I call it TFIS Loom.**

The idea is simple to say and harder to build.

*My knowledge stays mine, and it stays portable.* Decisions, preferences, observations and references live as plain Markdown files. They're readable by me and not locked into one vendor's database. Each piece can point back to the source it came from, so a decision carries its evidence with it.

*Each agent gets focused context, not everything.* When a task starts, Loom pulls together what that task actually needs: the decisions that must be respected, the background those decisions depend on, and the sources behind them. If something required is missing, it says so instead of quietly carrying on.

*Agents can bring knowledge back.* This is the part I care about most. When an agent learns something worth keeping, it can propose a new note to Loom instead of letting it vanish when the session ends.

*But I stay in charge.* I set the policy for what agents may add. Anything that changes existing knowledge, or touches a decision, waits for me. I see the exact before and after, and I approve or reject it. Checkpoints record what was accepted from each source. A task that's already running keeps the version of the knowledge it started with. And if I need to, I can pause an agent or revoke its access.

That's the whole bet in one sentence: the agents bring capability, and the judgment stays with the human.

Not a smarter model. A better handoff.

**Where it is today**

Loom is an early experiment, and I'm building it in public.

Version 0.1 is live at [thefutureissolo.com/loom](https://thefutureissolo.com/loom/). It's a browser workbench and command-line tool for keeping portable knowledge, assembling context for a task, and reviewing changes.

Version 0.2.1 is a development checkpoint. It's where I first drafted the connection that lets agents read context from Loom.

Version 0.3, "capture and sync", is the current build on Cloudflare. It adds the loop above: agents proposing new notes, my policies and review, and checkpoints. It isn't the live release yet.

The next step is to run Loom on a real, recurring TFIS workflow with one owner and three agent roles: researcher, builder and reviewer. And to measure honestly whether it reduces how much of me each accepted piece of work takes.

I don't know the answer yet. That's why it's an experiment.

How much of your week goes into re-explaining decisions you've already made, to tools that should already know?

🤖🧠⛄️
