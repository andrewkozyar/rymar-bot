import { google } from 'googleapis';
import { BotEnum } from './types';

export const exportPaymentInfoToGoogleSheet = async (
  bot: BotEnum,
  values: any[][],
) => {
  if (process.env.GOOGLE_SHEETS_DATA && process.env.GOOGLE_SHEET_ID) {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'GOOGLE_SHEETS_DATA.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });

    const googleSheets = google.sheets({
      version: 'v4',
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    await googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      valueInputOption: 'USER_ENTERED',
      range: bot,
      requestBody: {
        values,
      },
    });
  }
};
