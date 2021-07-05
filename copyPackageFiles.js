( ( { copyFile } ) => ['readme.md', 'package.json', 'LICENSE'].forEach( ( file ) => copyFile( `./${file}`, `./dist/${file}`, () => { } ) ) )( require( 'fs' ) )
