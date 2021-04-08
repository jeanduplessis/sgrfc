import { expect, test } from '@oclif/test';

describe('list', () => {
  test
    .stdout()
    .command(['list'])
    .it('runs list in paged mode', (ctx) => {
      expect(ctx.stdout).to.contain('list paged');
    });

  test
    .stdout()
    .command(['list', '-a'])
    .it('runs list and prints all', (ctx) => {
      expect(ctx.stdout).to.contain('list all');
    });

  test
    .stdout()
    .command(['list', '--all'])
    .it('runs list and prints all', (ctx) => {
      expect(ctx.stdout).to.contain('list all');
    });
});
