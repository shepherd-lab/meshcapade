#!/usr/bin/env ts-node

// todo: build a CLI client that takes options. For now just easier to update this script to run new batches.

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")
const authorizationResponse = require("./authorizationResponse")

// Meshcapade.deletePending(`${__dirname}/batches/astro/`, authorizationResponse)
// Meshcapade.deletePending(`${__dirname}/batches/v1bMales/`, authorizationResponse)

// Meshcapade.runBatch(`${__dirname}/batches/astro/`, authorizationResponse)
// Meshcapade.runBatch(`${__dirname}/batches/v1bMales/`, authorizationResponse)

// This version uses folders within "test_folder":
Meshcapade.runBatch(`${__dirname}/test_folder`, authorizationResponse)

