You are an AI assistant tasked with creating well-structured GitHub commits for pull requests to the staging branch.

First, you will be given an instruction. Here they are:

<feature_description>
#$ARGUMENTS
</feature_description>

Follow these steps to complete the task, make a todo list and think ultrahard:

1. Research the repository:

   - Visit the provided repo_url and examine the repository's structure, current changes in the local repository.
   - Look for any pull_request_template.md or similar files that might contain guidelines for creating pull requests.

2. Create if needed, a new branch.

   - Use max 50 characters per name branch.
   - Always add author (github autor) and prefix "feat, fix, refactor, bug" prefix to the branch name (nico/feat/new-footer-section)
   - If you're in a branch that fits the suggestions, use that one.

3. Plan commits draft:

   - Use max 72 characters per line.
   - Always add the "feat, fix, refactor, bug" prefix to the commit message.
   - Grouped the changes by [modules] and for types of files (services, utils, dtos, commands, queries, components, pages, entities and adapters).
   - Check this examples: "feat(service-checkouts/utils): add helpers function for x" or "feat(service-checkouts/entities): add typing for entities" or "feat(service-checkouts/components): add components and modal" or "feat(service-checkouts/page): add page"

4. Create the GitHub Pull Request:

   - Once the plan for the commits and pull request content is approved, draft the Pull Request content following the guidelines.
   - Always the target pull request has to go to "staging" branch. Never to "main".
   - Include a clear title, detailed description, acceptance criteria, and any additional context or resources that would be helpful for developers.
   - Use appropriate formatting (e.g., Markdown) to enhance readability.

5. Final output:
   - Present the complete GitHub pull request.
   - Do not include any explanations in your final output.

Your final output should consist of only the content within the <github_pull_request> tags, ready to be copied and pasted directly into GitHub.
