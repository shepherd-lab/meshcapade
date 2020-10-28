const superagent = require("superagent")
const fs = require("fs-extra")
const util = require("util")
const exec = util.promisify(require("child_process").exec)
const mkdirp = require("mkdirp")

const getFileName = (path: string) => {
  const parts = path.split("/") // todo: change for windows?
  return parts.pop()
}

const write = (path: string, content: string) => fs.writeFileSync(path, content, "utf8")
const read = (path: string) => fs.readFileSync(path, "utf8")
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const readDir = (dir: string) => fs.readdirSync(dir).filter((file: string) => file !== ".DS_Store")

declare type gender = "male" | "female"

interface AlignmentOptions {
  gender: gender
  input_units?: string
  input_hands?: string
  up_axis?: string
  look_axis?: string
  output_pose?: string
  output_hands?: string
  resolution?: string
}

declare type assetId = string
declare type alignmentId = string
declare type objectFile = any
declare type token = string
declare type filePath = string
declare type url = string

interface uploadInstructionsInterface {
  url: url
  expires_in: number
}

interface CreateAssetResponse {
  asset_id?: assetId
  asset_type?: string
  filename?: string
  state?: string
  upload?: uploadInstructionsInterface
}

interface UploadAssetResponse {}

interface VerifyAssetResponse {}

interface AlignmentResponse {
  asset_id?: assetId
  sub_id?: string // alignment/b87f9436-cb24-11e8-a7d4-6261940306cf
  parameters?: Object
  asset_type?: string
  filename?: string
  state?: string
}

interface DownloadInfo {
  url: url
  filesize: number
  expires_in: number
}

interface StatusResponse {
  download?: DownloadInfo
}

class Meshcapade {
  constructor(token: token, filePath: string, batchFolderName: string) {
    if (!token) {
      throw new Error(`Get a token first from ${this.loginUrl}`)
    }
    this.token = token
    this._batchFolderName = batchFolderName
    this._batchName = getFileName(batchFolderName.replace(/\/$/, ""))
    this._jobId = getFileName(filePath)
  }

  public token: string
  private _jobId: string
  private _batchName: string
  private _batchFolderName: string

  // public rootUrl = "https://api-eu.meshcapade.com/ganymede-beta"
  // public loginUrl = "https://meshcapade.com/login/eu.html"
  public rootUrl = "https://api.ganymede.meshcapade.com/ganymede"
  public loginUrl = "https://api.ganymede.meshcapade.com/ganymede/login.html"

  private verbose = true
  private _logging = true
  _print(message) {
    if (this.verbose) console.log(message)
  }

  private _log(step: string, obj: Object) {
    const folder = `${this._logsDir}/${this._jobId}`
    if (!fs.existsSync(folder)) mkdirp.sync(folder)

    write(`${folder}/${step}.json`, JSON.stringify(obj, undefined, 2))
  }

  async _post(url: url, body: any, step: string) {
    const response = await superagent
      .post(`${this.rootUrl}${url}`)
      .send(body)
      .set("Authorization", this.token)
      .set("Content-Type", "application/json")

    if (this._logging) this._log(step, { post: url, request: body, response })
    return response
  }

  async _get(url: url, step: string) {
    const response = await superagent
      .get(`${this.rootUrl}${url}`)
      .set("Authorization", this.token)
      .set("Content-Type", "application/json")

    if (this._logging) this._log(step, { get: url, response })
    return response
  }

  async createAsset(filePath: filePath): Promise<CreateAssetResponse> {
    const filename = getFileName(filePath)
    this._print(`Creating asset`)
    const res = await this._post(
      "/asset",
      {
        filename,
      },
      "createAsset"
    )
    return JSON.parse(res.text)
  }

  async uploadAsset(filePath: filePath, signedPutUrl: url): Promise<UploadAssetResponse> {
    this._print(`Uploading asset`)
    const command = `curl -sXPUT --upload-file ${filePath} "${signedPutUrl}"`
    const { stdout, stderr } = await exec(command)
    if (this._logging) this._log("uploadAsset", { put: signedPutUrl, FILE: filePath, stderr, stdout })
    return {}
  }

  async verifyAsset(assetId: assetId): Promise<VerifyAssetResponse> {
    this._print(`Verifying asset`)
    const res = await this._get(`/asset/${assetId}`, "verifyAsset")
    return JSON.parse(res.text)
  }

  async requestAlignment(assetId: assetId, alignmentOptions: AlignmentOptions): Promise<AlignmentResponse> {
    this._print(`Requesting Alignment`)
    const res = await this._post(`/asset/${assetId}/alignment`, alignmentOptions, "requestAlignment")
    return JSON.parse(res.text)
  }

  async checkStatus(assetId: assetId, sub_id: string): Promise<StatusResponse> {
    this._print(`Checking Status`)
    try {
      const res = await this._get(`/asset/${assetId}/${sub_id}`, `checkStatus`)
      const parsed = JSON.parse(res.text)
      if (parsed.state === "error") throw new Error(`Error: checkStatus: ${parsed.message}`)
      return parsed
    } catch (err) {
      console.log(err)
    }
  }

  async downloadResult(url: url, outputFilePath: filePath) {
    this._print(`Downloading '${url}'`)
    const command = `curl -sXGET "${url}" >> ${outputFilePath}`
    const { stdout, stderr } = await exec(command)
    console.log("Download success!")
    if (this._logging) this._log("downloadResult", { GET: url, FILE: url, stderr, stdout })
    return {}
  }

  async awaitUntilReady(asset_id: string, sub_id: string): Promise<StatusResponse> {
    let statusResponse = await this.checkStatus(asset_id, sub_id)
    const sleepDuration = 60
    while (!statusResponse.download) {
      this._print(`Alignment not ready. Sleeping for ${sleepDuration} seconds.`)
      await sleep(sleepDuration * 1000)
      statusResponse = await this.checkStatus(asset_id, sub_id)
    }
    return statusResponse
  }

  private get _logsDir() {
    return `${this._batchFolderName}/logs/`
  }

  private _getJobInProgressForThisFile(fileName: string): AlignmentResponse | undefined {
    const folder = readDir(this._logsDir).find((folder) => folder === fileName)
    const alignmentPath = `${this._logsDir}${folder}/requestAlignment.json`
    if (folder && fs.existsSync(alignmentPath)) return JSON.parse(JSON.parse(read(alignmentPath)).response.text)
  }

  private _extractInfoFromCheckStatusResponseToDisk(fileName: string, outPutFilePath: string) {
    const infoPath = outPutFilePath + ".info.json"
    if (fs.existsSync(infoPath)) return undefined
    const info = JSON.parse(JSON.parse(read(`${this._logsDir}/${fileName}/checkStatus.json`)).response.text).info
    write(infoPath, JSON.stringify(info, undefined, 2))
    this._print(`Saving info for '${fileName}'`)
    this._print(`Appending info to '${fileName}'`)
  }

  async checkExistingJobOrStartNewAlignment(filePath: filePath, outPutFilePath: filePath, options: AlignmentOptions) {
    const fileName = getFileName(filePath)
    if (fs.existsSync(outPutFilePath)) {
      this._print(`Output file found for '${filePath}'.`)
      try {
        this._extractInfoFromCheckStatusResponseToDisk(fileName, outPutFilePath)
      } catch (err) {
        console.log(err)
        console.log(`Error getting info for "${outPutFilePath}"`)
      }
      return undefined
    }

    const pendingJobInfo = this._getJobInProgressForThisFile(fileName)
    if (pendingJobInfo) {
      this._print(`Existing request found for '${filePath}'. Checking status...`)
      const statusResponse = await this.awaitUntilReady(pendingJobInfo.asset_id, pendingJobInfo.sub_id)
      const downloadResponse = await this.downloadResult(statusResponse.download.url, outPutFilePath)
      return downloadResponse
    } else {
      this._print(`No request found for '${filePath}'. Starting new job...`)
      return this.align(filePath, outPutFilePath, options)
    }
  }

  async deleteLogsFolder() {
    const folder = `${this._logsDir}${this._jobId}/`
    if (folder.length < 30) throw new Error("Something went wrong.")
    const trash = __dirname + `/trash/${this._batchName}/${this._jobId}`
    if (fs.existsSync(trash)) {
      console.log(`trash exists deleting ${folder}`)
      await fs.remove(folder)
      return
    }
    console.log(`moving folder ${folder} to trash ${trash}`)
    await fs.move(folder, trash)
  }

  static deletePending(batchFolderName: string) {
    batchFolderName = batchFolderName.endsWith("/") ? batchFolderName.substr(0, batchFolderName.length - 1) : batchFolderName
    const inputFolder = `${batchFolderName}/inputs`
    const results = fs
      .readdirSync(inputFolder)
      .filter((filePath) => filePath.endsWith(".ply") || filePath.endsWith(".obj"))
      .map(async (filePath) => {
        const inputFilePath = `${inputFolder}/${filePath}`
        const outPutFilePath = `${batchFolderName}/outputs/${filePath}.output.obj`
        if (fs.existsSync(outPutFilePath)) return true
        const session = new Meshcapade("noTokenNeeded", inputFilePath, batchFolderName)
        await session.deleteLogsFolder()
      })
  }

  static async runBatch(batchFolderName: string, authorizationResponse: any) {
    batchFolderName = batchFolderName.endsWith("/") ? batchFolderName.substr(0, batchFolderName.length - 1) : batchFolderName
    const options = require(`${batchFolderName}/options`)

    const inputFolder = `${batchFolderName}/inputs`
    const results = fs
      .readdirSync(inputFolder)
      .filter((filePath) => filePath.endsWith(".ply") || filePath.endsWith(".obj"))
      .map((filePath) => {
        const inputFilePath = `${inputFolder}/${filePath}`
        const outPutFilePath = `${batchFolderName}/outputs/${filePath}.output.obj`
        const session = new Meshcapade(authorizationResponse.token, inputFilePath, batchFolderName)
        return session.checkExistingJobOrStartNewAlignment(inputFilePath, outPutFilePath, options)
      })

    await Promise.all(results)
    Meshcapade.concatOutputFiles(batchFolderName)
  }

  static concatOutputFiles(batchFolder: filePath) {
    const outputFolder = batchFolder + "/outputs/"
    const destination = batchFolder + "/results.json"
    const rows = readDir(outputFolder)
      .filter((file) => file.endsWith(".json"))
      .map((fileName) => {
        let obj
        const id = fileName.replace(".output.obj.info.json", "")
        try {
          obj = JSON.parse(read(outputFolder + fileName))
          const newObj = obj.body_measurements.measurements
          newObj.id = id
          newObj.gender = obj.body_measurements.gender
          newObj.units = obj.body_measurements.units
          return newObj
        } catch (err) {
          console.log(`Error with '${fileName}'`)
          console.log(err)
          return {
            id,
          }
        }
      })
    write(destination, JSON.stringify(rows))
  }

  async align(filePath: filePath, outPutFilePath: filePath, options: AlignmentOptions) {
    const createAssetResponse = await this.createAsset(filePath)
    const uploadResponse = await this.uploadAsset(filePath, createAssetResponse.upload.url)
    const verifyResponse = await this.verifyAsset(createAssetResponse.asset_id)
    const alignmentResponse = await this.requestAlignment(createAssetResponse.asset_id, options)
    const statusResponse = await this.awaitUntilReady(createAssetResponse.asset_id, alignmentResponse.sub_id)
    const downloadResponse = await this.downloadResult(statusResponse.download.url, outPutFilePath)
    return downloadResponse
  }
}

export { Meshcapade }
