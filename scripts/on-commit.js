//# sourceURL=on-commit.js
'use strict';

//  Description
//
// This script does an automatic issue transition to "In progress" status if
// the issue is still in "Open" status when a commit has been created for the issue.
// It works on the assumption that an issue key is present in the comment of commit.
// First issue's key from the comment of commit will be taken as an issue for the transition.
// Issue's status will be changed on behalf of the issue's assignee.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of open status in constant OPEN. By default "Open" is used.
// Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.
//
//  Classes passed as parameters by default
//
//  The commit revision ID.
// revision : java.lang.String
//
//  The full commit message.
// commitComment : java.lang.String
//
//  The commit timestamp (unixtime format).
// commitTime : long
//
//  An e-mail of the commit author.
// authorEmail : java.lang.String
//
//  An author name of the commit.
// authorName : java.lang.String
//
//  A name of the branch where the commit belongs to.
//  Please note that commit is processed only once and branchName is a first branch where the commit is found.
// branchName : java.lang.String
//
//  An object with several commit properties and flags.
// commitProperties : com.bigbrassband.jira.git.services.indexer.revisions.CommitProcessor.CommitProperties
//   issueCommit         -- true if the commit has issue keys in its comment message.
//   newForRepoAndCommit -- true if the commit is seen for the first time for this repository. It seems it is always true.
//   initialIndex        -- true if the script is called during an initial repository reindex. It seems it is always false.
(function () {
    load(__DIR__ + 'utils.js');

    var jiraLog = getJiraLogger();

    //get user by authorEmail, authorName
    function getUser() {
        var users = getComponentAccessor().getUserSearchService().findUsersByEmail(authorEmail);
        if (users.isEmpty()) {
            jiraLog.debug("Unknown Jira user");
        } else if (users.size() > 1) {
            jiraLog.debug("Ambiguous jira user");
        } else {
            return users.get(0);
        }
        return null;
    }

    //set required statuses names
    var IN_PROGRESS = "Start Progress";
    var OPEN = "Open";

    //get needed components to execute main logic
    var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
    var issueService = getComponentAccessor().getIssueService();
    //check that issue key is present in the commit comment
    if (!commitProperties.issueCommit)
        return;

    //get first issue key present in the commit comment
    var issueKey = getIssueKey(commitComment);
    //validate user and issueKey
    if (issueKey == null) {
        jiraLog.debug("Can't find any issue key in the given commit comment '" + commitComment + "'. Exiting...");
        return;
    }
    var user = getUser();
    if (user == null) {
        jiraLog.debug("Can't find any user by given email '" + authorEmail + "'. Exiting...");
        return;
    }

    // find issue by key
    jiraLog.debug("Looking for the issue with key '" + issueKey + "'...");
    var issue = issueService.getIssue(user, issueKey).getIssue();
//    issue.setAssignee(user);
    var status = issue.getStatus();
    // check that issue has OPEN status
    jiraLog.debug("The issue with key '" + issueKey + "' has status '" + status.getName() + "'.");
    // compare actual and desirable issue status in case insensitive way
    if (status.getName().toLowerCase() !== OPEN.toLowerCase()) {
        jiraLog.debug("The issue with key '" + issueKey + "' has undesirable status. " +
            " Expected status '" + OPEN + "', but actual is '" + status.getName() + "'. Exiting...");
        return;
    }

    var possibleActionsList = getPossibleNextActions(workflowManager, issue);
    //retrieve new status id by transition name from possible actions
    var newStatusId = getStatusIdForActionNameIgnoreCase(IN_PROGRESS, possibleActionsList);
    //if new status name is correct
    if (newStatusId == null) {
        jiraLog.error("Can't determine the next status for the issue with key '" + issueKey + "'." +
            " Desirable transition name '" + IN_PROGRESS + "'," +
            " but possible transitions (actions) are: " + possibleActionsList + ". Exiting...");
        return;
    } else {
        jiraLog.debug("It's determined the next status id: " + newStatusId);
    }

    //validate transition
    var transitionValidationResult = issueService.validateTransition(
        user, issue.getId(), newStatusId, issueService.newIssueInputParameters()
    );
    if (!transitionValidationResult.isValid()) {
        print("On-commit script execution:");
        print("branchName =", branchName);
        print("revision =", revision);
        print("Errors during transition:");
        print(transitionValidationResult.getErrorCollection());
        jiraLog.debug("Errors during transition for the issue with key '" + issueKey + "': " + transitionValidationResult.getErrorCollection());
    } else {
        // do transition
        issueService.transition(user, transitionValidationResult);
        jiraLog.debug("Transition for the issue with key '" + issueKey + "' completed.");
    }
})();