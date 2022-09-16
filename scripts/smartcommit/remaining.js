//# sourceURL=remaining.js
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

function getComponent(componentName) {
	var componentAccessor = Java.type("com.atlassian.jira.component.ComponentAccessor");
	var clazz = Java.type("java.lang.Class")
	return componentAccessor.getOSGiComponentInstanceOfType(clazz.forName(componentName));
}

var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");

// Create parameters for update
var issueInputParameters = issueService.newIssueInputParameters();
issueInputParameters.setRemainingEstimate(command.getArguments().get(0));

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
