//# sourceURL=on-commit.js
'use strict';

//  Description
//
// This script work as a handler that checks if an issue is in open status.
// If it is, then automatically transition to in progress.
// It works in suggestion that issue key is present in the branch name.
// First issue's key from the branch name will be taken as issue for transition.
// Issue's status will be changed on behalf of author of commit.
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

load(__DIR__ + 'utils.js');

//get user by authorEmail, authorName
function getUser() {
    var crowdService = getComponent("com.atlassian.jira.plugins.dvcs.smartcommits.GitPluginCompatibilityCrowdService");
    var users = crowdService.getUserByEmailOrNull(authorEmail, authorName);

    if (users.isEmpty()) {
        print("Unknown Jira user");
    } else if (users.size() > 1) {
        print("Ambiguous jira user");
    } else {
        return users.get(0);
    }
}

//set required statuses names
var IN_PROGRESS = "Start Progress";
var OPEN = "Open";

//get needed components to execute main logic
var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");
var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");

var user = getUser();
//get first issue key present in the branch name
var issueKey = getIssueKey(branchName);

//validate user
if (issueKey == null && user == null)
    exit();
var issue = issueManager.getIssueByCurrentKey(issueKey);
var status = issue.getStatus();

//check status name
if (status.getName() !== OPEN)
    exit();
var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
var newStatusId = getIdForStatusWithName(IN_PROGRESS, possibleActionsList);

//check new status name
if (newStatusId == null)
    exit();
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