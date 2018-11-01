//# sourceURL=on-merge-req-created.js
'use strict';

//  Description
//
// This script does an automatic issue transition to "In progress" status if
// the issue is still in "Open" status when a merge/pull request has been created for the issue.
// It works on the assumption that an issue key is present in the title of the merge/pull request.
// First issue's key from the merge/pull request title will be taken as an issue for the transition.
// Issue's status will be changed on behalf of the issue's assignee.
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of open status in constant OPEN. By default "Open" is used.
// Set name of needed transition in constant IN_PROGRESS. By default "Start Progress" is used.
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
(function () {
    load(__DIR__ + 'utils.js');

    //set required statuses names
    var IN_PROGRESS = "Start Progress";
    var OPEN = "Open";

    //get needed components to execute main logic
    var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
    var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

    //extract input data from JSON to object
    var pullreq = JSON.parse(pullreqJson);
    //get first issue key present in request title
    var issueKey = getIssueKey(pullreq.title);
    //check that issue key is present
    if (issueKey == null)
        return;

    //find issue by key
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    // use issue's assignee as user
    var user = issue.getAssignee();
    // check that issue has OPEN status
    if (status.getName() !== OPEN)
        return;

    var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
    //retrieve new status id by his name from possible next statuses
    var newStatusId = getIdForStatusWithName(IN_PROGRESS, possibleActionsList);
    //if new status name is correct
    if (newStatusId == null)
        return;

    //get service to work with issue
    var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
    //validate changes
    var transitionValidationResult = issueService.validateTransition(
        user, issue.getId(), newStatusId, issueService.newIssueInputParameters()
    );
    //handle errors
    if (!transitionValidationResult.isValid()) {
        print("On-merge-req-created script execution:");
        print("repositoryName =", repositoryName);
        print("sourceBranch =", pullreq.sourceBranch);
        print("targetBranch =", pullreq.targetBranch);
        print("Errors during transition:");
        print(transitionValidationResult.getErrorCollection());
    } else {
        //do transition
        issueService.transition(user, transitionValidationResult);
    }
})();