# jira-git-workflow-hooks
[Git Integration for Jira](https://marketplace.atlassian.com/apps/4984/git-integration-for-jira) JavaScript Hooks.

*Required version of Git Integration for Jira: 2.20 and above.*

# Script paths and locations

Script engine searches for scripts in `<Jira-HOME>/data/git-plugin/scripts`
folder.

Smart commit scripts are expected to be in
`<Jira-HOME>/data/git-plugin/scripts/smartcommit` folder.


There is a cache for disk script lookup results. Script engine checks for `.js`
file modification timestamp and if it has changed (or even it has gone away)
then the disk script will be reloaded. Also there is a 5 seconds
interval after the last check when the script engine does not re-check script on
disk and just uses the cached script. It reduces the number of disk operations
when a lot of scripts are executed in a small period of time.

 

# List of implemented events for scripts

The Git Integration for Jira plugin executes scripts on some predefined events.
The below list shows all implemented events and the corresponding script names:

-   `smartcommit/<command-name>`

-   `on-commit`

-   `on-branch-created`

-   `on-branch-updated`

-   `on-branch-deleted`

-   `on-merge-req-created`

-   `on-merge-req-updated`

-   `on-user-resolution`


# Scripts description

* [**on-branch-created script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-branch-created.js)
  
  **Description**

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a branch has been created for the issue.
  It works on the assumption that an issue key is present in the name of the created branch.
  First issue's key from the created branch name will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  **Applying**

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.


* [**on-commit script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-commit.js)

  **Description**

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a commit has been created for the issue.
  It works on the assumption that an issue key is present in the comment of commit.
  First issue's key from the comment of commit will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  **Applying**

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.


* [**on-merge-req-created script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-merge-req-created.js)
  
  **Description**

  This script does an automatic issue transition to "In progress" status if
  the issue is still in "Open" status when a merge/pull request has been created for the issue.
  It works on the assumption that an issue key is present in the title of the merge/pull request.
  First issue's key from the merge/pull request title will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.

  **Applying**

  Set name of open status in constant OPEN. By default "Open" is used.
  Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.


* [**on-merge-req-updated script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-merge-req-updated.js)
  
  **Description**

  This script does an automatic issue transition to "Done" status if
  the issue is still in "In progress" status when a merge/pull request has been updated for the issue.
  It works on the assumption that an issue key is present in the title of the merge/pull request.
  First issue's key from the merge/pull request title will be taken as an issue for the transition.
  Issue's status will be changed on behalf of the issue's assignee.
  Please take into account that 'Fix version' field remains empty.

  **Applying**

  Set name of in progress status in constant IN_PROGRESS. By default "In Progress" is used.
  Set name of needed transition in constant DONE. By default "Resolve Issue" is used.
  Set name of needed request state in constant REQUEST_STATE. By default "merged" is used.


* [**on-user-resolution script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/on-user-resolution.js)
  
  **Description**

  This script work as a handler that force all commits to be processed by a Jira user called smartcommituser.
  If smartcommituser is unavailable, then return an error.

  **Applying**

  Set name of smart commit user in constant SMARTCOMMIT_USER_NAME. By default "smartcommituser" is used.
  

* [**associate-by-branch**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/associate-by-branch.js)

  **Description**
  
  This script auto associates the commit to the issue key listed in the branch name.
  It works on the assumption that an issue key is not present in the comment of commit.
  First issue's key from the branch name will be taken as an issue for the association.
  
  **Applying**
  
  Rename this script to the "on-commit.js" and put it in the "scripts" folder.


* [**time script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/time.js)
  
  **Description**

  Generates a work log entry(the #time command), the work log is generated with the commit time as
  the finish.

  **Applying**

  Set i18n key for appropriate message in constant ERROR_MESSAGE.
  

* [**done script**](https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/done.js)
  
  **Description**

  This script work as a handler that sets version when transitioning to done.
  Version should be present in version input argument.
  Command should look like #done version=2.0.
  Please take into account that:
  issue will have only one version and resolution remains empty after transition.

  **Applying**

  Set appropriate keys for error messages in constants: NO_STATUS, NO_ALLOWED_ACTIONS_TEMPLATE, UNKNOWN_VERSION.
  Command name will be used as transition name.

* [**duedate script**](https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/duedate.js)

  **Description**

  TBD

  **Applying**

  TBD


* [**original script**](https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/original.js)

  **Description**

  TBD

  **Applying**

  TBD


* [**priority script**](https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/priority.js)

  **Description**

  TBD

  **Applying**

  TBD


* [**remaining script**](https://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/smartcommit/remaining.js)

  **Description**

  TBD

  **Applying**

  TBD


* [**utils script**](http://github.com/BigBrassBand/jira-git-workflow-hooks/blob/master/scripts/utils.js)
  
  **Description**

  Utility script used in most of other scripts.

  **Applying**

  Add row below for regular scripts.
  ```javascript
  load(__DIR__ + 'utils.js');
  ```

  Add row below for smart commits scripts.
  ```javascript
  load(__DIR__ + '../utils.js');
  ```
# Script debugging
  
It is possible to connect Nashorn debugger to Jira and debug scripts which is run through the script service. 
To achieve it please do the next:
  * Build NCDbg. Sources can be found [here](https://github.com/provegard/ncdbg).
  * Jira should be run with enabled debugger, i.e. the next arguments should be passed:  
    `-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=localhost: *port*`  
    `atlas-debug` command can be used as already has debugger enabled.
  * Run ncdbg using the next command line: `bin/ncdbg -c localhost: *port*`  
    Default Jira port 5005 can be used in case of using atlas-debug command.
  * Google Chrome DevTools or [Visual Studio Code](https://code.visualstudio.com/) can be used for debugging.
  * Next steps for Visual Studio Code are described [here](https://github.com/provegard/ncdbg/blob/master/docs/VSCode.md)
  * In case of some issues with Google Chrome DevTools [Issues Page](https://github.com/provegard/ncdbg/issues) and [Troubleshooting Page](https://github.com/provegard/ncdbg/blob/master/docs/Troubleshooting.md) will be very usefull.  
  
In particular, if breakpoints will not work correctly in Google Chrome DevTools you should remove `v8only` query param from url generated by ncdbg( [details here](https://github.com/provegard/ncdbg/issues/100) ).

