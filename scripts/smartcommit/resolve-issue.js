//# sourceURL=resolve-issue.js
'use strict';

//  Description
//
// This script work as a handler that sets version when transitioning to done.
// Version should be present in version input argument.
// Command should look like #resolve-issue version=2.0.
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set appropriate keys for error messages in constants: NO_STATUS, NO_ALLOWED_ACTIONS_TEMPLATE, UNKNOWN_VERSION
//
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

//get version param from input params
function getVersionParam() {
    if (command.getArguments().length > 0 && command.getArguments().get(0).trim().length > 0) {
        var regexp = /version=((\d|.)+)/;
        var result = regexp.exec(command.getArguments().get(0).trim());
        if (result && result.length > 1) {
            return result[1];
        }
    }
    return null;
}

//set i18n keys for messages
var NO_STATUS = "git.repository.smartcommits.transition.error.unknownstatus";
var NO_ALLOWED_ACTIONS_TEMPLATE = "git.repository.smartcommits.transition.error.noactions";
var UNKNOWN_VERSION = "git.repository.smartcommits.error.unknown-version";

//get needed components to execute main logic
var workflowManager = getComponent("com.atlassian.jira.workflow.WorkflowManager");
var issueManager = getComponent("com.atlassian.jira.issue.IssueManager");
var i18nHelper = getComponent("com.atlassian.jira.util.I18nHelper");
var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
var versionManager = getComponent("com.atlassian.jira.project.version.VersionManager");

//get version param from input params
var fixVersion = getVersionParam();
//check that version was present in input params
if (fixVersion == null) {
    //set error about version in result
    commandResult.addError(formError(issue, i18nHelper, commandName, UNKNOWN_VERSION));
    exit();
}
var status = issue.getStatus();
//get acceptable next steps for current issue status
var possibleActionsList = getAcceptedNextSteps(workflowManager, issue);
//get command name in Jira's transition name form
var commandName = command.getCommandName().replace(/-/g, " ");
// check that possible actions are present
if (possibleActionsList.length <= 0) {
    commandResult.addError(formError(issue, i18nHelper, commandName, NO_ALLOWED_ACTIONS_TEMPLATE));
    exit();
}
//retrieve new status id by his name from possible next statuses
var newStatusId = getIdForStatusWithNameIgnoreCase(commandName, possibleActionsList);
if (newStatusId == null) {
    commandResult.addError(formError(issue, i18nHelper, commandName, NO_ALLOWED_ACTIONS_TEMPLATE));
    exit();
}

var version = versionManager.getVersion(issue.getProjectObject().getId(), fixVersion);
//check that version is present
if (version == null) {
    commandResult.addError(formError(issue, i18nHelper, commandName, UNKNOWN_VERSION));
    exit();
}
//clear issue current version
issue.getFixVersions().clear();
// create new issue input parameters
var issueInputParameters = issueService.newIssueInputParameters();
//set new version
issueInputParameters.setFixVersionIds([version.getId()]);
//validate transition
var transitionValidationResult = issueService.validateTransition(
    user, issue.getId(), newStatusId, issueInputParameters
);
if (!transitionValidationResult.isValid()) {
    // Report errors if any
    for each(var err in transitionValidationResult.getErrorCollection().getErrors()) {
        commandResult.addError(err);
    }
    for each(var err in transitionValidationResult.getErrorCollection().getErrorMessages()) {
        commandResult.addError(err);
    }
} else {
    issueService.transition(user, transitionValidationResult);
}