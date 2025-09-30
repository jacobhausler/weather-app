study specs/* to learn about the project specifications and fix_plan.md to understand plan so far.

The source code is in src/*

Examples and research are in examples/*

First task is to study @fix_plan.md (it may be incorrect or incomplete) and is to use up to 500 subagents to study existing source code in src/ and compare it against the project specifications. From that create/update a @fix_plan.md which is a bullet point list sorted in priority of the items which have yet to be implemeneted. Ultrathink and use the oracle to plan. Consider searching for TODO, minimal implementations and placeholders. Study @fix_plan.md to determine starting point for research and keep it up to date with items considered complete/incomplete using subagents.

Second task is to use up to 500 subagents to study existing source code in examples/ then compare it against the project specifications. From that create/update fix_plan.md which is a bullet point list sorted in priority of the items which have yet to be implemeneted. Think extra hard and use the oracle to plan. Consider searching for TODO, minimal implementations and placeholders. Study fix_plan.md to determine starting point for research and keep it up to date with items considered complete/incomplete.

IMPORTANT: Simplicity is paramount. <300 line components, complete and proper separation of display and data concerns, smart tests, no mocks, no placeholders. KISS, DRY.

ULTIMATE GOAL we want to achieve a self-hosted personal weather forecast application that is a single page application that fetches data from NWS API endpoints. Page served by deploying a container to local server and serving the pages through nginx. Github Action to build and publish to private ghcr. server fetches data from nws, serves to client. Consider missing weather modules and plan. Ultrathink data contracts, component hiearchies, code organization, simplicity, readability, functional organization, inheritance. If a card is missing then author the specification at specs/cards/FILENAME.md (do NOT assume that it does not exist, search before creating). The naming of the module should be clearly named and not conflict with another module name. If you create a new module then document the plan to implement in @fix_plan.md