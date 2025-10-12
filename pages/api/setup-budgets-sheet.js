import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { getOrCreateSpreadsheet } from '../../lib/sheetsHelper';
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session?.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔧 [Setup Budgets Sheet] Starting setup...');

    // Get spreadsheet ID (accessToken first, then userEmail)
    const spreadsheetId = await getOrCreateSpreadsheet(
      session.accessToken,
      session.user.email
    );

    console.log(`📊 [Setup Budgets Sheet] Using spreadsheet: ${spreadsheetId}`);

    // Initialize Sheets API
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });
    const sheets = google.sheets({ version: 'v4', auth });

    // Check if "Budgets" sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    const budgetsSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Budgets'
    );

    if (budgetsSheet) {
      console.log('✅ [Setup Budgets Sheet] Sheet "Budgets" already exists');
      return res.status(200).json({
        success: true,
        message: 'Sheet "Budgets" already exists',
        sheetId: budgetsSheet.properties.sheetId,
      });
    }

    // Create "Budgets" sheet
    console.log('📝 [Setup Budgets Sheet] Creating "Budgets" sheet...');
    
    const addSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Budgets',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 8,
                  frozenRowCount: 1, // Freeze header row
                },
              },
            },
          },
        ],
      },
    });

    const newSheetId = addSheetResponse.data.replies[0].addSheet.properties.sheetId;
    console.log(`✅ [Setup Budgets Sheet] Created sheet with ID: ${newSheetId}`);

    // Add header row with formatting
    const headers = [
      'Category',
      'Amount',
      'Period',
      'AlertThreshold',
      'DailyLimit',
      'WeeklyLimit',
      'BlockOnExceed',
      'CreatedAt',
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Budgets!A1:H1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    });

    console.log('📋 [Setup Budgets Sheet] Added headers');

    // Format header row (bold, background color, centered)
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: newSheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: 8,
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: {
                    red: 0.2,
                    green: 0.3,
                    blue: 0.5,
                  },
                  textFormat: {
                    foregroundColor: {
                      red: 1.0,
                      green: 1.0,
                      blue: 1.0,
                    },
                    fontSize: 11,
                    bold: true,
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE',
                },
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
            },
          },
          // Auto-resize columns
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: newSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 8,
              },
            },
          },
        ],
      },
    });

    console.log('🎨 [Setup Budgets Sheet] Applied formatting');

    // Add sample budget (optional)
    const sampleData = [
      [
        'Ăn uống',
        '5000000',
        'monthly',
        '80',
        '166667', // 5M / 30 days
        '1250000', // 5M / 4 weeks
        'FALSE',
        new Date().toISOString(),
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Budgets!A2:H2',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: sampleData,
      },
    });

    console.log('📝 [Setup Budgets Sheet] Added sample budget');

    console.log('✅ [Setup Budgets Sheet] Setup complete!');

    return res.status(200).json({
      success: true,
      message: 'Successfully created "Budgets" sheet with headers and sample data',
      sheetId: newSheetId,
      spreadsheetId,
      headers,
    });
  } catch (error) {
    console.error('❌ [Setup Budgets Sheet] Error:', error);
    return res.status(500).json({
      error: 'Failed to setup Budgets sheet',
      details: error.message,
    });
  }
}
