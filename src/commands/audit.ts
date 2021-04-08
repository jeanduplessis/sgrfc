/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command';
import ApiHelper from '../lib/apihelper';
import cli from 'cli-ux';
import Rfc from '../types/rfc';

export default class Audit extends Command {
  static description =
    'Run an audit on all RFCs to identify problems.\nSee https://about.sourcegraph.com/handbook/communication/rfcs for more information.';

  static examples = [`$ sgrfc audit`];

  static flags = {
    help: flags.help({ char: 'h' }),
  };

  async run() {
    this.parse(Audit);

    const apiHelper: ApiHelper = new ApiHelper();

    cli.action.start('Authenticating');
    const auth = await apiHelper.authenticate();
    cli.action.stop();

    cli.action.start('Fetching RFC files');
    const rfcs: Rfc[] = await apiHelper.getAllRFCs();
    cli.action.stop();

    cli.action.start('Processing RFC files');

    const total = rfcs.length;
    const valid = rfcs.filter((rfc) => rfc.valid).length;
    const invalid = total - valid;
    const lastNumber = Math.max(...rfcs.map((rfc) => rfc.number || 0), 0);
    cli.action.stop();

    this.log(`Total RFCs: ${total}`);
    this.log(`Number of valid RFCs: ${valid}`);
    this.log(`Number of invalid RFCs: ${invalid}`);
    this.log(`Last valid RFC number: ${lastNumber}`);

    this.log(`Invalid RFCs:`);
    rfcs
      .filter((rfc) => !rfc.valid)
      .forEach((rfc) => {
        this.warn(rfc.toString());
      });
  }
}
