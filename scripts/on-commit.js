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

    //get user by authorEmail, authorName
    function getUser() {
        var crowdService = getComponent(
            "com.atlassian.jira.plugins.dvcs.smartcommits.GitPluginCompatibilityCrowdService"
        );
        var users = crowdService.getUserByEmailOrNull(authorEmail, authorName);

        if (users.isEmpty()) {
            print("Unknown Jira user");
        } else if (users.size() > 1) {
            print("Ambiguous jira user");
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
    var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");
    var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
    //check that issue key is present in the commit comment
    if (!commitProperties.issueCommit)
        return;

    //get first issue key present in the commit comment
    var issueKey = getIssueKey(commitComment);
    var user = getUser();
    //validate user and issueKey
    if (issueKey == null || user == null)
        return;

    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    //check status name
    if (status.getName() !== OPEN)
        return;

    var possibleActionsList = getPossibleNextActions(workflowManager, issue);
    var newStatusId = getStatusIdForActionName(IN_PROGRESS, possibleActionsList);
    //check new status name
    if (newStatusId == null)
        return;

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
    } else {
        // do transition
        issueService.transition(user, transitionValidationResult);
    }
})();