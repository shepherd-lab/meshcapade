#!/usr/bin/env ts-node

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")
const authorizationResponse = require("./authorizationResponse")

const batchDir = `${__dirname}/batches/plys/`

Meshcapade.runBatch(batchDir)
