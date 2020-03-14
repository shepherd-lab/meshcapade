#!/usr/bin/env ts-node

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")

const authorizationResponse = require("./authorizationResponse")
const options = require("./options")

const inputFolder = __dirname + "/inputs"

const runAll = async () => {
  const username = "SRLbodycomplab"

  const results = fs
    .readdirSync(inputFolder)
    .filter(filePath => filePath.endsWith(".obj"))
    .map(filePath => {
      const inputFilePath = `${inputFolder}/${filePath}`
      const outPutFilePath = `outputs/${filePath}.output.obj`
      const session = new Meshcapade(username, authorizationResponse.token, inputFilePath)
      return session.checkExistingJobOrStartNewAlignment(inputFilePath, outPutFilePath, options)
    })

  await Promise.all(results)
}

runAll()
