#!/usr/bin/env ts-node

// todo: build a CLI client that takes options. For now just easier to update this script to run new batches.

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")

// If a batch gets stuck in the "pending state", this script will delete the logs for those.

//const batchDir = `${__dirname}/batches/females/`
const batchDir = `${__dirname}/test_folder/`

Meshcapade.deletePending(batchDir)
