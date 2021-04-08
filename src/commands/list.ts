/* eslint-disable no-await-in-loop */
import { Command, flags } from '@oclif/command';
import GoogleApiHelper from '../lib/googleapi';
import cli from 'cli-ux';

export default class List extends Command {
  static description = 'List all RFCs';

  static examples = [`$ sgrfc list`, `$ sgrfc list -a|--all`];

  static flags = {
    help: flags.help({ char: 'h' }),

    // flag with no value (-a, --all)
    all: flags.boolean({ char: 'a' }),
  };

  async run() {
    const { flags } = this.parse(List);

    const all = flags.all ?? false;

    const googleApiHelper: GoogleApiHelper = new GoogleApiHelper();
    cli.action.start('Authenticating');
    const auth = await googleApiHelper.authenticate();
    cli.action.stop();

    // TODO handle auth error

    if (all) {
      cli.action.start('Fetching RFC files');
      const files: string[] = await googleApiHelper.getAllRFCs();
      cli.action.stop();
      files.forEach((file) => {
        this.log(file);
      });
    } else {
      let pagedResponse;
      let pageToken: string | null | undefined;

      do {
        pagedResponse = await googleApiHelper.getPagedRFCs(
          pageToken ? pageToken : undefined
        );

        pageToken = pagedResponse.nextPageToken;

        pagedResponse.files.forEach((file: string) => {
          this.log(file);
        });

        if (pageToken) {
          await cli.anykey();
        }
      } while (pagedResponse?.nextPageToken);
    }
  }
}
