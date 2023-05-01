cd frontend
npm run build-production
cd ../iac
cdk deploy --profile production --output prod
cd ..