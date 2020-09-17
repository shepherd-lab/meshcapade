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
3. Put all your `obj` files in the "inputs/" folder.
4. Adjust any parameter settings in `options.json`.
5. Then run `./runOnInputsFolder.ts`
