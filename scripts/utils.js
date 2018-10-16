//# sourceURL=utils.js
'use strict';

function getIssueKey(stringField) {
	var regexp = /([A-Za-z][A-Za-z0-9_]{1,19}-\d+)/g;
    var keys = [];
    var result = regexp.exec(stringField);
    while (result) {
      keys.push(result[0]);
      result = regexp.exec(stringField);
    }
    return keys.length > 0 ? keys[0]: null;
}

function getAcceptedNextSteps(workflowManager, issue) {
    var status = issue.getStatus();
    var workFlow = workflowManager.getWorkflow(issue);
    var currentStep = workFlow.getLinkedStep(status);
    return currentStep.getActions();
}

function getIdForStatusWithName(statusName, possibleActionsList) {
    var actionId = 0;
    for each (var actionDescriptor in possibleActionsList) {
       	if(actionDescriptor.getName() === statusName) {
       	    return actionDescriptor.getId();
       	}
    }
    return null;
}

function getComponent(componentName) {
	var componentAccessor = Java.type("com.atlassian.jira.component.ComponentAccessor");
	var clazz = Java.type("java.lang.Class")
	return componentAccessor.getOSGiComponentInstanceOfType(clazz.forName(componentName));
}
