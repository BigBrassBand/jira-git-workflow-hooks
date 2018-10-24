//# sourceURL=on-branch-created.js
'use strict';

//  Description
//
// This script work as a handler that checks if an issue is in open status.
// If it is, then automatically transition to in progress.
// It works in suggestion that issue key is present in the name of created branch.
// First issue's key from the name of created branch will be taken as issue for transition.
// Issue's status will be changed on behalf of issue's assignee.
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of open status in constant OPEN. By default "Open" is used.
// Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.
//
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

//set required statuses names
var IN_PROGRESS = "Start Progress";
var OPEN = "Open";

//get needed components to execute main logic
var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

//get first issue key present in branchName
var issueKey = getIssueKey(branchName);
//check that issueKey is presenr in branch name
if (issueKey == null)
    exit();
//find issue by key
var issue = issueManager.getIssueByCurrentKey(issueKey);
var status = issue.getStatus();
// use issue's assignee as user
var user = issue.getAssignee();
// check that issue has OPEN status
if (status.getName() !== OPEN)
    exit();
var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
//retrieve new status id by his name from possible next statuses
var newStatusId = getIdForStatusWithName(IN_PROGRESS, possibleActionsList);
//if new status name is correct
if (newStatusId == null)
    exit();
//get service to work with issue
var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
//validate changes
var transitionValidationResult = issueService.validateTransition(
    user, issue.getId(), newStatusId, issueService.newIssueInputParameters()
);
if (!transitionValidationResult.isValid()) {
    print("On-branch-created script execution:");
    print("repositoryName =", repositoryName);
    print("branchName =", branchName);
    print("Errors during transition:");
    print(transitionValidationResult.getErrorCollection());
} else {
    issueService.transition(user, transitionValidationResult);
}