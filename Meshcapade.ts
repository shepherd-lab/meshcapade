const superagent = require("superagent")
const { jtree } = require("jtree")
const { Disk } = require("jtree/products/Disk.node.js")
const util = require("util")
const exec = util.promisify(require("child_process").exec)

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
declare type username = string
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
  constructor(username: username, token: token, filePath: string) {
    if (!token) {
      throw new Error(`Get a token first from ${this.loginUrl}`)
    }
    this.token = token
    this._jobId = jtree.Utils.getFileName(filePath) + "-" + Date.now().toString()
    this._print(`If authorization expires you can get a new token here: ${this.loginUrl}`)
  }

  public token: string
  private _jobId: string
  public rootUrl = "https://api-eu.meshcapade.com/ganymede-beta"
  public loginUrl = "https://meshcapade.com/login/eu.html"
  private verbose = true
  private _logging = true
  _print(message) {
    if (this.verbose) console.log(message)
  }

  private _log(step: string, message: string) {
    const folder = `logs/${this._jobId}`
    if (!Disk.exists(folder)) Disk.mkdir(folder)

    Disk.write(`${folder}/${step}.tree`, message)
  }

  async _post(url: url, body: any, step: string) {
    const response = await superagent
      .post(`${this.rootUrl}${url}`)
      .send(body)
      .set("Authorization", this.token)
      .set("Content-Type", "application/json")

    if (this._logging) {
      const logMessage = new jtree.TreeNode(`POST ${url}
 REQUEST
  {body}
 RESPONSE
  {response}`).templateToString({ url, body: JSON.stringify(body, null, 2), response: JSON.stringify(response, null, 2) })
      this._log(step, logMessage)
    }
    return response
  }

  async _get(url: url, step: string) {
    const response = await superagent
      .get(`${this.rootUrl}${url}`)
      .set("Authorization", this.token)
      .set("Content-Type", "application/json")

    if (this._logging) {
      const logMessage = new jtree.TreeNode(`GET ${url}
 RESPONSE
  {response}`).templateToString({ url, response: JSON.stringify(response, null, 2) })
      this._log(step, logMessage)
    }
    return response
  }

  async createAsset(filePath: filePath): Promise<CreateAssetResponse> {
    const filename = jtree.Utils.getFileName(filePath)
    this._print(`Creating asset`)
    const res = await this._post(
      "/asset",
      {
        filename
      },
      "createAsset"
    )
    return JSON.parse(res.text)
  }

  async uploadAsset(filePath: filePath, signedPutUrl: url): Promise<UploadAssetResponse> {
    this._print(`Uploading asset`)
    const command = `curl -sXPUT --upload-file ${filePath} "${signedPutUrl}"`
    const { stdout, stderr } = await exec(command)
    if (this._logging) {
      const logMessage = new jtree.TreeNode(`PUT ${signedPutUrl}
 FILE {filePath}
 stderr
  {stderr}
 stdout
  {stdout}`).templateToString({ stderr, stdout, filePath })
      this._log("uploadAsset", logMessage)
    }
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

  async checkStatus(assetId: assetId, sub_id: string, attempt = 1): Promise<StatusResponse> {
    this._print(`Checking Status`)
    const res = await this._get(`/asset/${assetId}/${sub_id}`, `checkStatus-${attempt}`)
    const parsed = JSON.parse(res.text)
    if (parsed.state === "error") throw new Error(`Error: checkStatus attempt ${attempt}: ${parsed.message}`)
    return parsed
  }

  async downloadResult(url: url, outputFilePath: filePath) {
    this._print(`Downloading Result`)
    const command = `curl -sXGET "${url}" >> ${outputFilePath}`
    const { stdout, stderr } = await exec(command)
    if (this._logging) {
      const logMessage = new jtree.TreeNode(`GET ${url}
 FILE {url}
 stderr
  {stderr}
 stdout
  {stdout}`).templateToString({ stderr, stdout, url })
      this._log("downloadResult", logMessage)
    }
    return {}
  }

  async awaitUntilReady(asset_id: string, sub_id: string): Promise<StatusResponse> {
    let statusResponse = await this.checkStatus(asset_id, sub_id)
    const sleepDuration = 10
    let attempt = 1
    while (!statusResponse.download) {
      this._print(`Alignment not ready. Sleeping for ${sleepDuration} seconds.`)
      await Disk.sleep(sleepDuration * 1000)
      statusResponse = await this.checkStatus(asset_id, sub_id, attempt)
      attempt++
    }
    return statusResponse
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
