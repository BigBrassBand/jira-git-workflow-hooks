//# sourceURL=on-branch-created.js
'use strict';

//  Classes passed as parameters by default
//
//  A name of the branch.
// branchName : java.lang.String
//
//  The branch commit revision ID
// revision : java.lang.String
//
//  Our internal repository ID. It may be used as an opaque unique ID to distinguish repositories.
// repositoryId : java.lang.Integer
//
//  Display name of th repository.
// repositoryName : java.lang.String
//
// Origin of the repository (http/git URL for remote repositories or just a folder path for tracked repositories). It is empty for hosted repositories.
// repositoryOrigin : java.lang.String

load(__DIR__ + 'utils.js');

var IN_PROGRESS = "Start Progress";
var OPEN = "Open";

var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

var issueKey = getIssueKey(branchName);
if(issueKey !== null) {
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    var user = issue.getAssignee();
    if(status.getName() === OPEN) {
        var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
        var newStatusId = getIdForStatusWithName(IN_PROGRESS, possibleActionsList);
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

