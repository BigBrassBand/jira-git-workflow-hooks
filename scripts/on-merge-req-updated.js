//# sourceURL=on-merge-req-created.js
'use strict';

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

var IN_PROGRESS = "In Progress";
var DONE = "Resolve Issue";

var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

var pullreq = JSON.parse(pullreqJson);
var issueKey = getIssueKey(pullreq.title);
if(issueKey !== null) {
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    var user = issue.getAssignee();
    if(status.getName() === IN_PROGRESS) {
        var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
        var newStatusId = getIdForStatusWithName(DONE, possibleActionsList);
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