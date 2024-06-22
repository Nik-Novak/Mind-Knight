cd app

npx yarn install -y --network-timeout 100000
npx yarn prisma generate

if [[ ! -f "./.next/BUILD_ID" ]]; then
  npx yarn build:linux
fi

npx yarn start:linux