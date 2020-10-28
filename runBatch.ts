#!/usr/bin/env ts-node

// todo: build a CLI client that takes options. For now just easier to update this script to run new batches.

const fs = require("fs")
const { Meshcapade } = require("./Meshcapade")
const authorizationResponse = require("./authorizationResponse")

// Meshcapade.deletePending(`${__dirname}/batches/astro/`, authorizationResponse)
// Meshcapade.deletePending(`${__dirname}/batches/v1bMales/`, authorizationResponse)

// Meshcapade.runBatch(`${__dirname}/batches/astro/`, authorizationResponse)
// Meshcapade.runBatch(`${__dirname}/batches/v1bMales/`, authorizationResponse)

// This version uses the "inputs/" and "outputs/" folders here, but could be specified.
Meshcapade.runBatch(`${__dirname}/`, authorizationResponse)

