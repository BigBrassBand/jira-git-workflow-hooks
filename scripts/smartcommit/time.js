//# sourceURL=time.js
'use strict';

//  Description
//
// Generates a work log entry
// (the #time command), the work log is generated with the commit time as
// the finish.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set i18n key for appropriate message in constant ERROR_MESSAGE.
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

//get commit time in millis
function getCommitTimeInMillis() {
    return (commitTime != null ? commitTime : (new Date()).getTime()) * 1000;
}
//check that command args are present
function isCommandArgsPresent() {
    return command.getArguments().length > 0 && command.getArguments().get(0).trim().length > 0;
}
//get builder for worklog parameters
function getWorklogParametersBuilder() {
    var WorklogParametersImpl = Java.type(
        "com.atlassian.jira.bc.issue.worklog.WorklogInputParametersImpl"
    );
    return new WorklogParametersImpl.Builder();
}
//get duration and comment from input args
function getDurationAndCommentFromArgs() {
    var worklog = command.getArguments().get(0);
    var JiraWorklogUtil = Java.type("com.atlassian.jira.plugins.dvcs.smartcommits.JiraWorklogUtil");
    return JiraWorklogUtil.splitWorklogToDurationAndComment(worklog);
}
//get duration in millis
function getDurationInMillis(durationString) {
    var jiraDateUtil = getComponent("com.atlassian.core.util.DateUtils");
    var duration = jiraUtil.getDuration(durationString) * 1000;
    return duration;
}
// i18n key for error message
var ERROR_MESSAGE = "git.repository.smartcommits.error.exception-during-command-processing";

//get needed components to execute main logic
var JiraServiceContextImpl = Java.type("com.atlassian.jira.bc.JiraServiceContextImpl");
var worklogService = getComponent("com.atlassian.jira.bc.issue.worklog.WorklogService");
var i18nResolver = getComponent("com.atlassian.sal.api.message.I18nResolver");
var Date = Java.type("java.util.Date");

//check that command arguments are present
if (isCommandArgsPresent() === false) {
    commandResult.addError(i18nResolver.getText(ERROR_MESSAGE, command.getCommandName()));
    exit();
}

//get Jira context
var jiraContext = new JiraServiceContextImpl(user);
//get duration and comment from input params
var durationAndComment = getDurationAndCommentFromArgs();
//get worklog params builder
var worklogParametersBuilder = getWorklogParametersBuilder();
//convert time params in milliseconds
var durationTime = getDurationInMillis(durationAndComment.duration);
var finishTime = getCommitTimeInMillis();
//create worklog params
var worklogParameters = worklogParametersBuilder.issue(issue)
    .timeSpent(durationAndComment.duration)
    .comment(durationAndComment.comment)
    .startDate(new Date(finishTime - durationTime)).build();
//validate changes
var result = worklogService.validateCreate(jiraContext, worklogParameters);
if (jiraContext.getErrorCollection().hasAnyErrors()) {
    // Report errors if any
    for each(var err in jiraServiceContext.getErrorCollection().getErrors()) {
        commandResult.addError(err);
    }
    for each(var err in jiraServiceContext.getErrorCollection().getErrorMessages()) {
        commandResult.addError(err);
    }
} else {
    worklogService.createAndAutoAdjustRemainingEstimate(jiraContext, result, true);
}