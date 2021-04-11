/* eslint-disable no-console */
import { readFileSync } from 'fs';
import { google, Auth, drive_v3 } from 'googleapis';
import Rfc, { RfcStatus } from '../types/rfc';

export default class ApiHelper {
  static SCOPES = [
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive',
  ];

  static RFC_TEMPLATE_ID = '1vUp1A-j5xxnPn_rv3x3rWo8tbXJhIA5NggHLU6UofUc';

  static RFC_PUBLIC_FOLDER_ID = '1zP3FxdDlcSQGC1qvM9lHZRaHH4I9Jwwa';

  static RFC_PRIVATE_FOLDER_ID = '1KCq4tMLnVlC0a1rwGuU5OSCw6mdDxLuv';

  jwtClient: Auth.JWT | undefined;

  // TODO add error checking and safeguards
  async authenticate(): Promise<boolean> {
    const privateKeyFields = JSON.parse(
      readFileSync('privatekey.json').toString()
    );

    const { client_email, private_key } = privateKeyFields;

    const jwtClient = new Auth.JWT(
      client_email,
      undefined,
      private_key,
      ApiHelper.SCOPES
    );

    const auth = await jwtClient.authorize();

    if (auth) {
      this.jwtClient = jwtClient;
      return true;
    }

    return false;
  }

  // TODO add error checking and safeguards
  private async searchRFCs(pageToken?: string) {
    const auth = this.jwtClient;

    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      corpora: 'drive',
      driveId: '0AK4DcztHds_pUk9PVA',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageSize: 100,
      q:
        "name contains 'RFC' and parents in '1zP3FxdDlcSQGC1qvM9lHZRaHH4I9Jwwa' or name contains 'RFC' and parents in '1KCq4tMLnVlC0a1rwGuU5OSCw6mdDxLuv'",
      fields: 'nextPageToken, files(id, name, parents)',
      pageToken,
      orderBy: 'createdTime,name',
    });

    // if (!response || response.status !== 200) {
    //   console.log('The API returned an error: ' + response?.statusText);
    // }

    return response.data || undefined;
  }

  async getPagedRFCs(pageToken?: string): Promise<Record<string, any>> {
    const rfcs: Rfc[] = [];

    // eslint-disable-next-line no-await-in-loop
    const searchResponse: drive_v3.Schema$FileList = await this.searchRFCs(
      pageToken
    );

    if (searchResponse && searchResponse.files) {
      // eslint-disable-next-line no-await-in-loop
      for await (const file of searchResponse.files) {
        if (file.name && file.name.startsWith('RFC')) {
          rfcs.push(
            new Rfc(
              file.id as string,
              file.name,
              file.parents?.includes('1KCq4tMLnVlC0a1rwGuU5OSCw6mdDxLuv') // is the file from the private RFCs folder
            )
          );
        }
      }
    }

    return { rfcs, nextPageToken: searchResponse.nextPageToken };
  }

  async getAllRFCs(): Promise<Rfc[]> {
    const rfcs: Rfc[] = [];

    let pagedResponse;
    let pageToken: string | null | undefined;

    do {
      // eslint-disable-next-line no-await-in-loop
      pagedResponse = await this.getPagedRFCs(
        pageToken ? pageToken : undefined
      );

      pageToken = pagedResponse?.nextPageToken;

      rfcs.push(...pagedResponse.rfcs);
    } while (pageToken);

    rfcs.sort((a: Rfc, b: Rfc) => {
      if (a.number && b.number) {
        return a.number - b.number;
      }

      return 1;
    });

    return rfcs;
  }

  async nextRFCNumber(): Promise<number> {
    const rfcs: Rfc[] = await this.getAllRFCs();

    const lastRFC = rfcs.pop();

    console.log('last RFC: ', lastRFC?.toString());

    if (lastRFC?.number) {
      return lastRFC?.number + 1;
    }

    return -1;
  }

  async createRFC(
    number: number,
    title: string,
    status: RfcStatus = RfcStatus.WIP,
    isPrivate = false
  ): Promise<Rfc> {
    const rfc: Rfc = new Rfc(
      '',
      `RFC ${number} ${status}: ${title}`,
      isPrivate
    );

    console.log(rfc.toString());

    if (rfc.valid) {
      console.log('is valid');
      const copyTitle = `RFC ${rfc.number} ${rfc.status}: ${rfc.title}`;
      const auth = this.jwtClient;
      const drive = google.drive({ version: 'v3', auth });

      const copyRequest = {
        name: copyTitle,
        parents: [
          rfc.isPrivate
            ? ApiHelper.RFC_PRIVATE_FOLDER_ID
            : ApiHelper.RFC_PUBLIC_FOLDER_ID,
        ],
      };

      console.log('copyRequest: ', JSON.stringify(copyRequest, null, 2));

      const response = await drive.files.copy({
        fileId: ApiHelper.RFC_TEMPLATE_ID,
        supportsTeamDrives: true,
        requestBody: copyRequest,
      });

      if (response) {
        rfc.id = response.data.id as string;
      }
    }

    return rfc;
  }
}
