//# sourceURL=on-commit.js
'use strict';

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

function getUser(){
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

var IN_PROGRESS = "Start Progress";
var OPEN = "Open";

var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

var user = getUser();
var issueKey = getIssueKey(branchName);
if(issueKey !== null && user !== null) {
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();

    if(status.getName() === OPEN) {
        var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
        var newStatusId = getIdForStatusWithName(IN_PROGRESS, possibleActionsList);
        var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
        if(newStatusId) {
            var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
            var transitionValidationResult = issueService.validateTransition(
                user, issue.getId(), newStatusId, issueService.newIssueInputParameters()
            );
            if (transitionValidationResult.isValid()) {
                var transitionResult =  issueService.transition(user, transitionValidationResult);
            } else {
                print(transitionValidationResult.getErrorCollection());
            }
        }
    }
}
