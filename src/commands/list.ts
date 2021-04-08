/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command';
import ApiHelper from '../lib/apihelper';
import cli from 'cli-ux';
import Rfc from '../types/rfc';

export default class List extends Command {
  static description = 'List all RFCs';

  static examples = [
    `$ sgrfc list`,
    `$ sgrfc list -a|--all`,
    `$ sgrfc list -i|--invalid`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),

    // flag with no value (-a, --all)
    all: flags.boolean({ char: 'a' }),

    // flag with no value (-i, --invalid)
    invalid: flags.boolean({ char: 'i' }),
  };

  async run() {
    const { flags } = this.parse(List);

    const all = flags.all ?? false;
    const invalid = flags.invalid ?? false;

    const apiHelper: ApiHelper = new ApiHelper();
    cli.action.start('Authenticating');
    const auth = await apiHelper.authenticate();
    cli.action.stop();

    // TODO handle auth error

    if (all) {
      cli.action.start('Fetching RFC files');
      const rfcs: Rfc[] = await apiHelper.getAllRFCs();
      cli.action.stop();
      rfcs.forEach((rfc) => {
        if (!invalid || rfc.valid) {
          this.log(rfc.toString());
        }
      });
    } else {
      let pagedResponse;
      let pageToken: string | null | undefined;

      do {
        pagedResponse = await apiHelper.getPagedRFCs(
          pageToken ? pageToken : undefined
        );

        pageToken = pagedResponse.nextPageToken;

        pagedResponse.rfcs.forEach((rfc: Rfc) => {
          this.log(rfc.toString());
        });

        if (pageToken) {
          await cli.anykey();
        }
      } while (pagedResponse?.nextPageToken);
    }
  }
}
