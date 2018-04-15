'use strict'

const _ = require('lodash')
const gitHelpers = require('../lib/git-helpers')

const env = process.env

/**
 * Last commit is a lockfile update
 */
function isLockfileUpdate () {
  const reUpdateLockfile = /^chore\(package\): update lockfile*$/mi
  const lastCommitMessage = gitHelpers.getLastCommitMessage()
  return reUpdateLockfile.test(lastCommitMessage)
}

// For use in workflows, the .git directory needs to be saved to cache after updating the lockfile
// and the cache needs to be restored in a later job before uploading the lockfile
module.exports = {
  repoSlug: `${env.CIRCLE_PROJECT_USERNAME}/${env.CIRCLE_PROJECT_REPONAME}`,
  branchName: env.CIRCLE_BRANCH,
  // CIRCLE_PREVIOUS_BUILD_NUM is null on the first job of the first workflow on the branch
  // CIRCLE_WORKFLOW_UPSTREAM_JOB_IDS is null on the first job of every workflow on the branch
  // (update on first job of first workflow) or (upload when not first job in workflow and last commit is lockfile update)
  firstPush: !env.CIRCLE_PREVIOUS_BUILD_NUM || (env.CIRCLE_WORKFLOW_UPSTREAM_JOB_IDS && isLockfileUpdate()),
  correctBuild: _.isEmpty(env.CI_PULL_REQUEST),
  uploadBuild: env.CIRCLE_NODE_INDEX === `${env.BUILD_LEADER_ID || 0}`
}
