//# sourceURL=duedate.js
'use strict';

//  Classes passed as parameters by default
//
//  The passed smart commit command
// command       : com.atlassian.jira.plugins.dvcs.smartcommits.model.CommitCommands.CommitCommand
//
//  The committer user
// user          : com.atlassian.jira.user.ApplicationUser
//
//  The issue specified in smart commit
// issue         : com.atlassian.jira.issue.MutableIssue
//
//  A command result to return execution errors
// commandResult : com.atlassian.jira.plugins.dvcs.smartcommits.model.CommandsResults.CommandResult
//
//  The commit revision ID
// revision : java.lang.String
//
//  The full commit message
// commitComment : java.lang.String
//
//  The commit timestamp (unixtime format)
// commitTime : long
//
//  An e-mail of the commit author
// authorEmail : java.lang.String
//
//  An author name of the commit
// authorName : java.lang.String
load(__DIR__ + '../utils.js');

var fixVersion = "2.0";
var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");

var status = issue.getStatus();
var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
var commandName = command.getCommandName().replace( /-/g, " " );
var newStatusId = getIdForStatusWithNameIgnoreCase(commandName, possibleActionsList);
if(newStatusId) {
    var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
    var versionManager = getComponent("com.atlassian.jira.project.version.VersionManager");
    var version = versionManager.getVersion(issue.getProjectObject().getId(), fixVersion);
    if(version) {
        issue.getFixVersions().clear();
        var issueInputParameters = issueService.newIssueInputParameters();
        issueInputParameters.setFixVersionIds([version.getId()]);
        var transitionValidationResult = issueService.validateTransition(
            user, issue.getId(), newStatusId, issueInputParameters
        );
        if (transitionValidationResult.isValid()) {
            var transitionResult =  issueService.transition(user, transitionValidationResult);
        } else {
            print(transitionValidationResult.getErrorCollection());
            // Report errors if any
            for each (var err in transitionValidationResult.getErrorCollection().getErrors()) {
            	commandResult.addError(err);
            }
            for each (var err in transitionValidationResult.getErrorCollection().getErrorMessages()) {
            	commandResult.addError(err);
            }
        }
    } else {
        //TODO send email
    }

} else {
//TODO send email
}



var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");

// Create parameters for update
var issueInputParameters = issueService.newIssueInputParameters();
issueInputParameters.setDueDate(command.getArguments().get(0));

// Call validate
var validateResult = issueService.validateUpdate(user, issue.getId(), issueInputParameters);

// Check for error and call the operation
if (!validateResult.getErrorCollection().hasAnyErrors()) {
	issueService.update(user, validateResult);
} else {
	// Report errors if any
	for each (var err in validateResult.getErrorCollection().getErrors()) {
		commandResult.addError(err);
	}
	for each (var err in validateResult.getErrorCollection().getErrorMessages()) {
		commandResult.addError(err);
	}
}
