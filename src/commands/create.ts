/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command';

export default class Create extends Command {
  static description = 'Create a new RFC';

  static examples = [`$ sgrfc create`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.parse(Create);

    this.log('Coming soon...');
  }
}
