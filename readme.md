# Meshcapade TypeScript Package

### Install Instructions

This package uses NodeJS.

If you don't have Node, the recommended way of installing it is with the `n` Node Version Manager: https://github.com/tj/n.

This will install `n` and then the latest version of Node.js, as well as the TS-Node package.

    git clone https://github.com/tj/n
    cd n
    make install
    n latest
    npm install -g ts-node

Once that is installed, clone this repo and then install the dependencies:

    git clone https://github.com/breckuh/meshcapade
    cd meshcapade
    npm install .

Then you should be ready to Mesh!

### Using this package

1. Visit the login URL: https://meshcapade.com/login/eu.html
2. Login and then copy/paste the authorization response into `authorizationResponse.json`.
3. Create a folder for your batch like "batches/females/".
4. Create an "inputs" folder in that batch folder like "batches/females/inputs". Put your raw mesh files in there.
5. Put an "options.json" file in your batch folder like "batches/females/options.json"
6. Update the file `runBatch.ts` to point to your batch folder
7. Run `./runBatch.ts` on the command line.

