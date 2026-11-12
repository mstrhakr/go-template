import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { releaseInput, assertNewRelease } from './release.mjs';

const release = releaseInput(process.env.CHANNEL, process.env.RELEASE_TAG, process.env.RELEASE_SHA);
execFileSync('git', ['merge-base', '--is-ancestor', release.revision, 'origin/main']);
const pages = JSON.parse(execFileSync('gh', ['api', `repos/${process.env.GITHUB_REPOSITORY}/releases`, '--paginate', '--slurp'], { encoding: 'utf8' }));
assertNewRelease(release.channel, release.tag, pages.flat());
for (const [key, value] of Object.entries(release)) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);