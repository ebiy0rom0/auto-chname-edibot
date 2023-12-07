import { GoogleSpreadsheetWorksheet } from "npm:google-spreadsheet";
import { GoogleSheetWorkbook } from "./googleSheet.ts";
import { ken } from "../../client/ken.ts";

export class SheetTimelineHelper {
  private wb!: GoogleSheetWorkbook
  private sheet!: GoogleSpreadsheetWorksheet

  constructor () {
    (async () => {
      this.wb = await GoogleSheetWorkbook.getInstance()
      this.sheet = this.wb.sheetsByTitle("timeline")
      await this.sheet.loadHeaderRow()
    })()
  }

  // short hand
  private headers = () => this.sheet.headerValues

  private getDateOffset = async (date: string) => {
    const dateRow = (await this.sheet.getRows())[1]
    const headers = this.sheet.headerValues

    for (let i = 0; i < headers.length; i ++) {
      if (dateRow.get(headers[i]) === date) {
        return i
      }
    }
    return -1
  }

  private getUserRow = async (username: string) => {
    const userRow = (await this.sheet.getRows()).find(row => row.get("username") === username)
    if (userRow) return userRow

    const member = await ken.guild.memberByUsername(username)
    return this.addRow({ username: username, name: member!.displayName })
  }

  private addRow = async (data: string[] | Record<string, string | number | boolean>) => await this.sheet.addRow(data)

  setTimeline = async (date: string, userId: string, shift: boolean[]) => {
    const offset = await this.getDateOffset(date)
    if (offset < 0) throw Error(`Select date timeline offset is not found.[date=${date}]`)

    const userRow = await this.getUserRow(userId)
    shift.forEach((y, i) => {
      if (y) userRow!.set(this.headers()[offset + i], SUBMISSION_MARK)
    })
    userRow!.save()
  }
}

const SUBMISSION_MARK = "o"