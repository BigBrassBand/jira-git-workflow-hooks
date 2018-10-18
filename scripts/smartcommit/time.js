//# sourceURL=time.js
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

function getCommitTimeInMillis(){
   return (commitTime != null ? commitTime : (new Date()).getTime()) * 1000;
}

function isCommandArgsPresent(){
   return command.getArguments().length > 0 && command.getArguments().get(0).trim().length > 0;
}

function getWorklogParametersBuilder(){
   var WorklogParametersImpl = Java.type(
   "com.atlassian.jira.bc.issue.worklog.WorklogInputParametersImpl"
   );
   return new WorklogParametersImpl.Builder();
}

function getDurationAndCommentFromArgs(){
   var worklog = command.getArguments().get(0);
   var JiraWorklogUtil = Java.type("com.atlassian.jira.plugins.dvcs.smartcommits.JiraWorklogUtil");
   return JiraWorklogUtil.splitWorklogToDurationAndComment(worklog);
}

function getDurationInMillis(durationString){
    var PeriodFormatterBuilder = Java.type("org.joda.time.format.PeriodFormatterBuilder");
    var formatter = new PeriodFormatterBuilder()
         .appendWeeks().appendSuffix("w ")
         .appendDays().appendSuffix("d ")
         .appendHours().appendSuffix("h ")
         .appendMinutes().appendSuffix("m")
         .toFormatter();
    return formatter.parsePeriod(durationString).toStandardDuration().getMillis();
}

var ERROR_MESSAGE = "git.repository.smartcommits.error.exception-during-command-processing";

var JiraServiceContextImpl = Java.type("com.atlassian.jira.bc.JiraServiceContextImpl");
var worklogService = getComponent("com.atlassian.jira.bc.issue.worklog.WorklogService");
var i18nResolver = getComponent("com.atlassian.sal.api.message.I18nResolver");
var Date = Java.type("java.util.Date");

if(isCommandArgsPresent()) {
    var jiraContext = new JiraServiceContextImpl(user);
    var durationAndComment = getDurationAndCommentFromArgs();
    var worklogParametersBuilder = getWorklogParametersBuilder();
    var durationTime = getDurationInMillis(durationAndComment.duration);
    var finishTime = getCommitTimeInMillis();
    var worklogParameters = worklogParametersBuilder.issue(issue)
        .timeSpent(durationAndComment.duration)
        .comment(durationAndComment.comment)
        .startDate(new Date(finishTime - durationTime)).build();
    var result = worklogService.validateCreate(jiraContext, worklogParameters);
    if (!jiraContext.getErrorCollection().hasAnyErrors()) {
        worklogService.createAndAutoAdjustRemainingEstimate(jiraContext, result, true);
    } else {
        // Report errors if any
        for each (var err in jiraServiceContext.getErrorCollection().getErrors()) {
            commandResult.addError(err);
        }
        for each (var err in jiraServiceContext.getErrorCollection().getErrorMessages()) {
            commandResult.addError(err);
        }
    }
} else {
     commandResult.addError(i18nResolver.getText(ERROR_MESSAGE, command.getCommandName()));
}