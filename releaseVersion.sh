# set your token
#export GITHUB_TOKEN=...

USER="lguillaud"
REPO="transform_vis"
BUILD_VERSION="1"
SKIP_INSTALL_DEPS="false"

# get the params
while getopts b:k:u:s option
do
    case "${option}"
    in
        b) BUILD_VERSION=${OPTARG};;
        k) OSD_VERSION=${OPTARG};;
        u) USER=${OPTARG};;
        s) SKIP_INSTALL_DEPS="true"
    esac
done

# Check OSD version
if [ -z ${OSD_VERSION} ]; then 
    echo -e "Options: -k <OSD version> (mandatory)" 
    echo -e "         -b <Build increment> (default to 1)" 
    echo -e "         -u <User to log in Github> (default to '$USER')" 
    echo -e "         -s for skip dependencies install (default install deps)" 
    exit; 
fi

TAG_NAME=${OSD_VERSION}-${BUILD_VERSION}
TAG_NAME_LATEST=${OSD_VERSION}-latest

# Install (or not) dependencies
echo
if [ "${SKIP_INSTALL_DEPS}" = "false" ]; then 
    echo "Install OSD dependencies..."
    echo 
    yarn kbn bootstrap 
else
    echo "Skip installing OSD dependencies..."
fi

# Build packages
echo
echo "Build OSD plugin package..."
echo
yarn build -b ${TAG_NAME} -k ${OSD_VERSION}

echo
echo "Create a package copy as latest..."
echo
echo "cp build/${REPO}-${TAG_NAME}.zip build/${REPO}-${TAG_NAME_LATEST}.zip"
cp build/${REPO}-${TAG_NAME}.zip build/${REPO}-${TAG_NAME_LATEST}.zip


# Create tag and release

echo
echo "Create Git tag for the new release"
git tag -m "update to version ${OSD_VERSION}" ${OSD_VERSION} && git push --tags

# create a formal release
echo
echo "Create the release"
github-release release \
    --user ${USER} \
    --repo ${REPO} \
    --tag ${OSD_VERSION} \
    --name "v${OSD_VERSION}" \
    --description "Automatic plugin release for OSD v${OSD_VERSION}. " \
    --pre-release

# upload the package file
echo
echo "Upload the corresponding package file"
github-release upload \
  --user ${USER} \
  --repo ${REPO} \
  --tag  ${OSD_VERSION} \
  --name "${REPO}-${TAG_NAME}.zip" \
  --file build/${REPO}-${TAG_NAME}.zip

# upload the alias "latest" package file
echo
echo "Upload the corresponding package file"
github-release upload \
  --user ${USER} \
  --repo ${REPO} \
  --tag  ${OSD_VERSION} \
  --name "${REPO}-${TAG_NAME_LATEST}.zip" \
  --file build/${REPO}-${TAG_NAME_LATEST}.zip
