//# sourceURL=utils.js
'use strict';

//get first issue key from stringField
function getIssueKey(stringField) {
    var regexp = /([A-Za-z][A-Za-z0-9_]{1,19}-\d+)/g;
    var keys = [];
    var result = regexp.exec(stringField);
    while (result) {
        keys.push(result[0]);
        result = regexp.exec(stringField);
    }
    return keys.length > 0 ? keys[0] : null;
}

//get accepted transitions from issue
function getAcceptedNextSteps(workflowManager, issue) {
    var status = issue.getStatus();
    var workFlow = workflowManager.getWorkflow(issue);
    var currentStep = workFlow.getLinkedStep(status);
    return currentStep.getActions();
}

//find status id by statusName among possibleActionsList
function getIdForStatusWithName(statusName, possibleActionsList) {
    for each(var actionDescriptor in possibleActionsList) {
        if (actionDescriptor.getName() === statusName) {
            return actionDescriptor.getId();
        }
    }
    return null;
}

//find status id by statusName among possibleActionsList
function getIdForStatusWithNameIgnoreCase(statusName, possibleActionsList) {
    for each (var actionDescriptor in possibleActionsList) {
       	if (actionDescriptor.getName().toLowerCase() === statusName.toLowerCase()) {
       	    return actionDescriptor.getId();
       	}
    }
    return null;
}

//get component by component full name
function getComponent(componentName) {
    var componentAccessor = Java.type("com.atlassian.jira.component.ComponentAccessor");
    var clazz = Java.type("java.lang.Class")
    return componentAccessor.getOSGiComponentInstanceOfType(clazz.forName(componentName));
}

//form error message
function formError(issue, i18nHelper, commandName, templateName) {

    function getIssueState(issue, i18nHelper) {
        return (issue.getStatusObject() == null) 
            ? i18nHelper.getText("git.repository.smartcommits.transition.error.unknownstatus") 
            : s.getName();
    };

    var errorHandler = Java.type("com.atlassian.jira.plugins.dvcs.smartcommits.model.CommitHookHandlerError");
    return errorHandler.fromSingleError(
        commandName, issue.getKey(), i18nHelper.getText(templateName, issue.getKey(), getIssueState(issue))
    );
}

// Returns a logger to write into the Jira logs
function getJiraLogger() {
    return Java.type("org.apache.log4j.Logger").getLogger("com.bigbrassband.jira.git.services.scripting.ScriptService");
}

