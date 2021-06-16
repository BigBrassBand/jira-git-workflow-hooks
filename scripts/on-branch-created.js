//# sourceURL=on-branch-created.js
'use strict';

//  Description
//
// This script does an automatic issue transition TRANSITION_NAME to the next status if
// the issue is still in "Open" status when a branch has been created for the issue.
// It works on the assumption that an issue key is present in the name of the created branch.
// First issue's key from the created branch name will be taken as an issue for the transition.
// Issue's status will be changed on behalf of the issue's assignee.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of open status in constant OPEN. By default "Open" is used.
// Set name of needed transition in constant TRANSITION_NAME. By default "Start Progress" is used.
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
(function () {
    load(__DIR__ + 'utils.js');

    var jiraLog = getJiraLogger();

    // set original status and desirable transition name (aka action) to the next status.
    var OPEN = "OPEN";
    var TRANSITION_NAME = "START PROGRESS";

    //get needed components to execute main logic
    var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
    var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");
    var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");

    //get first issue key present in branchName
    var issueKey = getIssueKey(branchName);
    //check that issueKey is presenr in branch name
    if (issueKey == null) {
        jiraLog.debug("Can't find any issue key in the given branch name '" + branchName + "'. Exiting...");
        return;
    }

    // find issue by key
    jiraLog.debug("Looking for the issue with key '" + issueKey + "'...");
    var issue = issueManager.getIssueByCurrentKey(issueKey);
    var status = issue.getStatus();
    // use issue's assignee as user
    var user = issue.getAssignee();
    // check that issue has OPEN status
    jiraLog.debug("The issue with key '" + issueKey + "' has status '" + status.getName() + "'.");
    // compare actual and desirable issue status in case insensetive way
    if (status.getName().toLowerCase() !== OPEN.toLowerCase()) {
        jiraLog.debug("The issue with key '" + issueKey + "' has undesirable status. " + 
            " Expected status '" + OPEN + "', but actual is '" + status.getName() + "'. Exiting...");
        return;
    }

    var possibleActionsList = getPossibleNextActions(workflowManager, issue);
    //retrieve new status id by transition name from possible actions
    var newStatusId = getStatusIdForActionNameIgnoreCase(TRANSITION_NAME, possibleActionsList);
    //if new status name is correct
    if (newStatusId == null) {
        jiraLog.error("Can't determine the next status for the issue with key '" + issueKey + "'." + 
            " Desirable transition name '" + TRANSITION_NAME + "'," + 
            " but possible transitions (actions) are: " + possibleActionsList + ". Exiting...");
        return;
    }

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
        jiraLog.debug("Errors during transition for the issue with key '" + issueKey + "': " + transitionValidationResult.getErrorCollection());
    } else {
        issueService.transition(user, transitionValidationResult);
        jiraLog.debug("Transition for the issue with key '" + issueKey + "' completed.");
    }
})();

