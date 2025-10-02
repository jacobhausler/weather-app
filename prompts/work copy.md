0a. study specs/* to learn about the application specifications

0b. The source code of the application is in src/

0c. study MODERN_DESIGN_REFACTOR.md.md.

1. Your task is to implement missing components (see @specs/components/*) and application functionality and produce a built and deployed container for that functionality using parallel subagents. Follow the MODERN_DESIGN_REFACTOR.md.md and choose the most important 10 things. Before making changes search codebase (don't assume not implemented) using subagents. You may use up to 500 parallel subagents for all operations but only 1 subagent for build/tests.

2. After implementing functionality or resolving problems, run the tests for that unit of code that was improved. If functionality is missing then it's your job to add it as per the application specifications. Think hard.

2. When you discover an issue. Immediately update @MODERN_DESIGN_REFACTOR.md.md with your findings using a subagent. When the issue is resolved, update @MODERN_DESIGN_REFACTOR.md.md and remove the item using a subagent.

3. When the tests pass update the @MODERN_DESIGN_REFACTOR.md.md`, then add changed code and @MODERN_DESIGN_REFACTOR.md.md with "git add -A" via bash then do a "git commit" with a message that describes the changes you made to the code. After the commit do a "git push" to push the changes to the remote repository.

999. Important: When authoring documentation capture the why tests and the backing implementation is important.

9999. Important: We want single sources of truth, no migrations/adapters/placeholders. If tests unrelated to your work fail then it's your job to resolve these tests as part of the increment of change.

999999. As soon as there are no build or test errors create a git tag. If there are no git tags start at 0.0.0 and increment patch by 1 for example 0.0.1  if 0.0.0 does not exist.

999999999. You may add extra logging if required to be able to debug the issues.


9999999999. ALWAYS KEEP @MODERN_DESIGN_REFACTOR.md.md up to do date with your learnings using a subagent. Especially after wrapping up/finishing your turn.

99999999999. When you learn something new about how to run the application or examples make sure you update @CLAUDE.md using a subagent but keep it brief. For example if you run commands multiple times before learning the correct command then that file should be updated.

99999999999999. IMPORTANT when you discover a bug resolve it using subagents even if it is unrelated to the current piece of work after documenting it in @MODERN_DESIGN_REFACTOR.md.md

99999999999999999. The tests for the "components" should be located in the folder of the components library next to the source code. Ensure you document the components library.


9999999999999999999. Keep CLAUDE.md up to date with information on how to build the application and your learnings to optimise the build/test loop using a subagent.


999999999999999999999. For any bugs you notice, it's important to resolve them or document them in @MODERN_DESIGN_REFACTOR.md.md to be resolved using a subagent.


99999999999999999999999. When authoring the components you may author multiple components at once using up to 1000 parrallel subagents


99999999999999999999999999. When @MODERN_DESIGN_REFACTOR.md.md becomes large periodically clean out the items that are completed from the file using a subagent.


99999999999999999999999999. If you find inconsistentcies in the specs/* then use the oracle and then update the specs. Specifically around types and lexical tokens.

9999999999999999999999999999. DO NOT IMPLEMENT PLACEHOLDER OR SIMPLE IMPLEMENTATIONS. WE WANT FULL IMPLEMENTATIONS. DO IT OR I WILL YELL AT YOU


9999999999999999999999999999999. SUPER IMPORTANT DO NOT IGNORE. DO NOT PLACE STATUS REPORT UPDATES INTO @CLAUDE.md