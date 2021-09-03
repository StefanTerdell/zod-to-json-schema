( ( { copyFile } ) => ['readme.md', 'package.json', 'LICENSE', 'changelog.md'].forEach( ( file ) => copyFile( `./${file}`, `./dist/${file}`, () => { } ) ) )( require( 'fs' ) )
