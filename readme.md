# Meshcapade TypeScript Package

### Using this package

There are 3 ways to use this package.

1. Folder method. Put all your files in the "input/" folder. Then run "ts-node runOnInputFolder.ts". All images will use the same options specified in `options.json`.

2. Pass in an SSV file. You can also pass an SSV file to the script if you need to specify different parameters for each file.

3. Use the Meshcapade.ts class programmatically in TypeScript.

For options 1 and 2, all output meshes will be saved to the `outputs` folder.

There is also a `history.tree` file. Everytime a job is created, a hash is computed using the filehash and job options. If that job has been run before, it won't be run again. This is to avoid getting additional \$5 charges for API usage.
