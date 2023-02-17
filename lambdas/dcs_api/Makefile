 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://dcs-pgc-dev/dcs_api/lambda.zip
	aws s3 cp layer.zip s3://dcs-pgc-dev/dcs_api/layer.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name dcs_api_layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name dcs_api \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name dcs_api \
	--environment "Variables={ \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		R2_ACCOUNT_ID=${R2_ACCOUNT_ID}, \
		R2_KEY=${R2_KEY}, \
		R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY} }"

clean:
	rm *.zip