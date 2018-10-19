//# sourceURL=on-user-resolution.js
'use strict';

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

function getComponent(componentName) {
	var componentAccessor = Java.type("com.atlassian.jira.component.ComponentAccessor");
	var clazz = Java.type("java.lang.Class")
	return componentAccessor.getOSGiComponentInstanceOfType(clazz.forName(componentName));
}

// this user has to have admin rights
var SMARTCOMMIT_USER_NAME = "smartcommituser";

var issueService = getComponent("com.atlassian.jira.bc.issue.IssueService");
var crowdService = getComponent("com.atlassian.jira.plugins.dvcs.smartcommits.GitPluginCompatibilityCrowdService");
var resultCode = Java.type("com.bigbrassband.jira.git.services.scripting.UserResolutionResult.ResultCode");

var users = crowdService.getUsersByName(SMARTCOMMIT_USER_NAME);

if (users.isEmpty()) {
	resolutionResult.setErrorMessage("Unknown Jira user:" + SMARTCOMMIT_USER_NAME);
	resolutionResult.setResultCode(resultCode.ERROR);
} else if (users.size() > 1) {
  	resolutionResult.setErrorMessage("Ambiguous jira user");
  	resolutionResult.setResultCode(resultCode.ERROR);
} else {
  	resolutionResult.setUser(users.get(0));
  	resolutionResult.setResultCode(resultCode.USER_FOUND);
}
