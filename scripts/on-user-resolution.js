//# sourceURL=on-user-resolution.js
'use strict';

//  Description
//
// This script work as a handler that force all commits to be processed by a Jira user called smartcommituser.
// If smartcommituser is unavailable, then return an error.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Set name of smart commit user in constant SMARTCOMMIT_USER_NAME. By default "smartcommituser" is used.
//
//  Classes passed as parameters by default
//
//  The commit revision ID.
// revision : java.lang.String
//
//  The full commit message.
// commitComment : java.lang.String
//
//  The commit timestamp (unixtime format).
// commitTime : long
//
//  An e-mail of the commit author.
// authorEmail : java.lang.String
//
//  An author name of the commit.
// authorName : java.lang.String
//
//  A resolution result to return to the plugin.
// resolutionResult : com.bigbrassband.jira.git.services.scripting.UserResolutionResult
//  Has the next methods:
//    setUser(com.atlassian.jira.user.ApplicationUser user)
//    setResultCode(com.bigbrassband.jira.git.services.scripting.UserResolutionResult.ResultCode resultCode) -- USER_FOUND, USE_STANDARD_SEARCH, ERROR
//    setErrorMessage(java.lang.String errorMessage)

//set name of smart commits' user
var SMARTCOMMIT_USER_NAME = "smartcommituser";

//get needed components to execute main logic
var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
var crowdService = getComponent("com.atlassian.jira.plugins.dvcs.smartcommits.GitPluginCompatibilityCrowdService");
var resultCode = Java.type("com.bigbrassband.jira.git.services.scripting.UserResolutionResult.ResultCode");

//find user by user name
var users = crowdService.getUsersByName(SMARTCOMMIT_USER_NAME);
//user was not found
if (users.isEmpty()) {
    resolutionResult.setErrorMessage("Unknown Jira user:" + SMARTCOMMIT_USER_NAME);
    resolutionResult.setResultCode(resultCode.ERROR);
} else if (users.size() > 1) {
    //several users were found
    resolutionResult.setErrorMessage("Ambiguous jira user");
    resolutionResult.setResultCode(resultCode.ERROR);
} else {
    //single user was found
    resolutionResult.setUser(users.get(0));
    resolutionResult.setResultCode(resultCode.USER_FOUND);
}