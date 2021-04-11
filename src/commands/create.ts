/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command';
import cli from 'cli-ux';
import ApiHelper from '../lib/apihelper';
import Rfc, { RfcStatus } from '../types/rfc';

export default class Create extends Command {
  static description = 'Create a new RFC';

  static examples = [`$ sgrfc create`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.parse(Create);

    const isPublic: boolean = await cli.confirm(
      'Is this a public RFC? (yes/no)'
    );
    const title = await cli.prompt('What is the title of the RFC?');

    const apiHelper: ApiHelper = new ApiHelper();
    cli.action.start('Authenticating');
    const auth = await apiHelper.authenticate();
    cli.action.stop();

    const number = await apiHelper.nextRFCNumber();

    if (number === -1) {
      throw new Error(
        'Invalid state: could not find the number of the last RFC'
      );
    }

    const rfc: Rfc = await apiHelper.createRFC(
      number,
      title,
      RfcStatus.WIP,
      !isPublic
    );

    console.log(rfc.toString());

    cli.url(
      `Click to open the RFC: https://docs.google.com/document/d/${rfc.id}/edit`,
      `https://docs.google.com/document/d/${rfc.id}/edit`
    );
  }
}
