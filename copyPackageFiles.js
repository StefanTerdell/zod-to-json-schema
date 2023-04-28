const { copyFileSync } = require("fs");

for (const file of ["README.md", "package.json", "LICENSE", "changelog.md"]) {
  copyFileSync(`./${file}`, `./dist/${file}`);
}
