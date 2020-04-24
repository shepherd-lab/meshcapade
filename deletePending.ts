#!/usr/bin/env ts-node

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")

// If a batch gets stuck in the "pending state", this script will delete the logs for those.

const batchDir = `${__dirname}/batches/females/`

Meshcapade.deletePending(batchDir)
