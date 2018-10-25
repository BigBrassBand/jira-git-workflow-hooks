//# sourceURL=on-merge-req-created.js
'use strict';
//  Description
//
// This script work as a handler that checks if an issue is in in progress status.
// If it is, then automatically transition to done.
// It works in suggestion that issue key is present in the title of merge request.
// First issue's key from merge/pull request title will be taken as issue for transition.
// Issue's status will be changed on behalf of issue's assignee.
// Take into account that Fix version retains empty.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of in progress status in constant IN_PROGRESS. By default "In Progress" is used.
// Set name of needed transition in constant DONE. By default "Resolve Issue" is used.
//
//  Classes passed as parameters by default
//
//  A JSON object which contains the merge request data.
// pullreqJson : org.json.JSONObject
//  Contains the next fields:
//    "requestId"    -- ID of this merge request.
//    "requestState" -- Text representation of the current request state.
//    "title"        -- Text title of the merge request.
//    "description"  -- Text description of the merge request.
//    "sourceBranch" -- Source (base) branch for the merge request.
//    "targetBranch" -- Target branch for the merge request.
//    "repoId"       -- Our internal opaque repository ID. It is different from "repositoryId" for technical reasons.
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
var IN_PROGRESS = "In Progress";
var DONE = "Resolve Issue";

//get needed components to execute main logic
var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

//extract input data from JSON to object
var pullreq = JSON.parse(pullreqJson);
//get first issue key present in request title
var issueKey = getIssueKey(pullreq.title);
if (issueKey !== null) {
    //find issue by key
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    // use issue's assignee as user
    var user = issue.getAssignee();
     // check that issue has IN_PROGRESS status
    if (status.getName() === IN_PROGRESS) {
        var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
        //retrieve new status id by his name from possible next statuses
        var newStatusId = getIdForStatusWithName(DONE, possibleActionsList);
        //if new status name is correct
        if (newStatusId) {
            //get service to work with issue
            var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
            //validate changes
            var transitionValidationResult = issueService.validateTransition(
                user, issue.getId(), newStatusId, issueService.newIssueInputParameters()
            );
            if (transitionValidationResult.isValid()) {
                var transitionResult = issueService.transition(user, transitionValidationResult);
            } else {
                print("On-merge-req-updated script execution:");
                print("repositoryName =", repositoryName);
                print("sourceBranch =", pullreq.sourceBranch);
                print("targetBranch =", pullreq.targetBranch);
                print("Errors during transition:");
                print(transitionValidationResult.getErrorCollection());
            }
        }
    }
}