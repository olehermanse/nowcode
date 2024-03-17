
COMMIT_DATE=$(git log --pretty="%cd" --date=short -n 1)
COMMIT_SHA=$(git log --pretty="%h" -n 1)

sed "s/COMMIT_DATE/$COMMIT_DATE/g" dist/index.html > tmp.html
sed "s/COMMIT_SHA/$COMMIT_SHA/g" tmp.html > dist/index.html
rm tmp.html
