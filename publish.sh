git checkout master
npm version $1 -m "Bumped to version %s"
git push
npm publish
