export const repositorySettings = {
  has_issues: true, has_wiki: false, has_discussions: false,
  allow_merge_commit: false, allow_rebase_merge: false, allow_squash_merge: true,
  squash_merge_commit_title: 'PR_TITLE', squash_merge_commit_message: 'PR_BODY',
  delete_branch_on_merge: true, allow_auto_merge: false,
  security_and_analysis: { secret_scanning: { status: 'enabled' }, secret_scanning_push_protection: { status: 'enabled' } },
};