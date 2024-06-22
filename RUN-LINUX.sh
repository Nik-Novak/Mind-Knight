cd app

../node-binaries/linux/bin/npx yarn install -y --network-timeout 100000
../node-binaries/linux/bin/npx yarn prisma generate

if [[ ! -f "./.next/BUILD_ID" ]]; then
  ../node-binaries/linux/bin/npx yarn build:linux
fi

../node-binaries/linux/bin/npx yarn start:linux
