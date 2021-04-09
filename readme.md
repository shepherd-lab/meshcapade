# Meshcapade TypeScript Package

### Introduction

Use this code to batch repose 3D "obj" or "ply" mesh files via Meshcapade. All files in an "inputs" folder will be reposed and output into an "outputs" folder according to options specified in an "options.json" file. To perform reposing it is necessary to have access to token credentials provided from Meshcapade.

This package uses NodeJS and TypeScript. If you don't have Node with the TS-Node (TypeScript) package follow the install instructions for either Windows or Linux below.


### Windows install instructions

Download and run the Node.js software installer for Windows from the website (https://nodejs.org/en/download/).

After installation launch the "Node.js command prompt".

From that command prompt use Node package manager (npm) to install required packages using the following commands:

    npm install -g typescript
    npm install -g ts-node
    npm install -g mkdirp

NOTE: if you receive peer dependency warnings, you may need the following command:

    npm install --save-dev @types/node

You are now ready to use the package (see "Using" instructions below) from the "Node.js command prompt".


### Linux install instructions

The recommended way of installing Node is with the `n` Node Version Manager: https://github.com/tj/n.

This will install `n` and then the latest version of Node.js, as well as the TS-Node package.

    git clone https://github.com/tj/n
    cd n
    make install
    n latest
    npm install -g ts-node

Once that is installed, clone this repo and then install the dependencies:

    git clone https://github.com/breckuh/meshcapade # Or https://github.com/shepherd-lab/meshcapade.git
    cd meshcapade
    npm install .

You are now ready to use the package (see "Using" instructions below).


### Using this package

1. Open a web browser to this URL: https://api.ganymede.meshcapade.com/ganymede/login.html
2. Login and then copy/replace the authorization response (all text) into an `authorizationResponse.json` file locally.
3. Create a folder for your batch like "batches/females/".
4. Create "inputs", "outputs", and "logs" folder in that batch folder like "batches/females/inputs". Put your raw mesh files (e.g., my_mesh.obj) in there.
5. Put an "options.json" file in your batch folder like "batches/females/options.json".
6. Update the file `runBatch.ts` to point to your batch folder.
7. Run `ts-node ./runBatch.ts` from the Node.js command line.
8. Look for results in an "outputs" folder. If processing appears to stop your credentials may have expired. Create a fresh `authorizationResponse.json` file and re-launch the same `runBatch.ts` code. The code should search your "logs" folder for pending jobs that can still be downloaded from Meshcapade if ready.


### Known issues
* When >1 scans are present the first in the file list fails to be processed. One workaround is to create a temporary "aaDeleteMe.obj" that is at the top of the file list, and that should be deleted after initially calling `ts-node ./runBatch.ts`.
* Circumference data will not initially be downloaded with the reposed scan. To get this data, keep all folders in the "logs" folder in place and just call `ts-node runBatch.ts` a second time after the reposed scans are downloaded. Results should be downloaded as files in the "outputs" folder ending "output.obj.info.json".
