# jira-git-workflow-hooks
Git Integration for Jira JavaScript Hooks

# https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-branch-created.js
  Description

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a branch has been created for the issue.
  It works on the assumption that an issue key is present in the name of the created branch.
  First issue's key from the created branch name will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  Applying

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.

# https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-commit.js
  Description

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a commit has been created for the issue.
  It works on the assumption that an issue key is present in the comment of commit.
  First issue's key from the comment of commit will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  Applying

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.

https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-merge-req-created.js
  Description

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a merge/pull request has been created for the issue.
  It works on the assumption that an issue key is present in the title of the merge/pull request.
  First issue's key from the merge/pull request title will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  Applying

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.

https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-merge-req-updated.js
  Description

  This script does an automatic issue transition to "Done" status if
  the issue is still in "In progress" status when a merge/pull request has been updated for the issue.
  It works on the assumption that an issue key is present in the title of the merge/pull request.
  First issue's key from the merge/pull request title will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.
  Please take into account that 'Fix version' field remains empty.

  Applying

  Set name of in progress status in constant IN_PROGRESS. By default "In Progress" is used.
  Set name of needed transition in constant DONE. By default "Resolve Issue" is used.
  Set name of needed request state in constant REQUEST_STATE. By default "merged" is used.

https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-user-resolution.js
  Description

  This script work as a handler that force all commits to be processed by a Jira user called smartcommituser.
  If smartcommituser is unavailable, then return an error.

  Applying

  Set name of smart commit user in constant SMARTCOMMIT_USER_NAME. By default "smartcommituser" is used.

https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/time.js
  Description

  Generates a work log entry(the #time command), the work log is generated with the commit time as
  the finish.

  Applying

  Set i18n key for appropriate message in constant ERROR_MESSAGE.

https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/utils.js
  Description

  Utility script used in most of other scripts.

  Applying

  Add row below for regular scripts.
  load(__DIR__ + 'utils.js');

  Add row below for smart commits scripts.
  load(__DIR__ + '../utils.js');

