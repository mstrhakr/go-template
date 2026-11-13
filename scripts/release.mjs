import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import semver from 'semver';

export function releaseInput(channel, tag, revision) {
  if (!['normal', 'beta', 'rc'].includes(channel)) throw new Error('Unsupported release channel');
  const match = /^v0\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(beta|rc)\.([1-9]\d*))?$/.exec(tag);
  if (!match || (match[3] ?? 'normal') !== channel) throw new Error('Expected v0.x.y, v0.x.y-beta.N, or v0.x.y-rc.N matching the channel; v1 requires an explicit policy change');
  if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('An exact full commit SHA is required');
  return { channel, tag, revision, version: tag.slice(1) };
}

export function assertNewRelease(channel, tag, releases) {
  const version = tag.slice(1);
  for (const release of releases) {
    if (release.draft) continue;
    if (release.tag_name === tag) throw new Error('Published release already exists; never overwrite it');
    const previous = release.tag_name.replace(/^v/, '');
    if (!semver.valid(previous)) continue;
    const previousChannel = semver.prerelease(previous)?.[0] ?? 'normal';
    if ((previousChannel === 'normal' || previousChannel === channel) && !semver.gt(version, previous)) {
      throw new Error(`Release must be newer than ${release.tag_name}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = releaseInput(process.env.CHANNEL, process.env.RELEASE_TAG, process.env.RELEASE_SHA);
  for (const [key, value] of Object.entries(result)) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}