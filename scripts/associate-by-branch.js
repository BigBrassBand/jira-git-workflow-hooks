//# sourceURL=on-commit.js
'use strict';

//  Description
//
// This script auto associates the commit to the issue key listed in the branch name.
// It works on the assumption that an issue key is not present in the comment of commit.
// First issue's key from the branch name will be taken as an issue for the association.
//
// https://github.com/BigBrassBand/jira-git-workflow-hooks
//
//  Applying
// Rename this script to the "on-commit.js" and put it in the "scripts" folder.
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
//  A name of the branch where the commit belongs to.
//  Please note that commit is processed only once and branchName is a first branch where the commit is found.
// branchName : java.lang.String
//
//  An object with several commit properties and flags.
// commitProperties : com.bigbrassband.jira.git.services.indexer.revisions.CommitProcessor.CommitProperties
//   issueCommit         -- true if the commit has issue keys in its comment message.
//   newForRepoAndCommit -- true if the commit is seen for the first time for this repository. It seems it is always true.
//   initialIndex        -- true if the script is called during an initial repository reindex. It seems it is always false.
(function () {
    load(__DIR__ + 'utils.js');

    //get needed components to execute main logic
    var issueChangesService = getComponent(
        "com.bigbrassband.jira.git.services.indexer.revisions.CommitIssueChangesService"
    );
    //check that issue key is present in the commit comment
    if (commitProperties.issueCommit)
        return;

    //get first issue key present in the branch name
    var issueKey = getIssueKey(branchName);
    //validate issueKey
    if (issueKey == null)
        return;

    issueChangesService.writeChange(authorName, issueKey, revision, true, commitTime);
})();