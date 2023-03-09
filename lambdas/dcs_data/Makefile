 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://grb-pgc-dev/dcs_data/lambda.zip
	aws s3 cp layer.zip s3://grb-pgc-dev/dcs_data/layer.zip

clean:
	rm *.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name grb-lambda-layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name dcs_data \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name dcs_data \
	--environment "Variables={ \
		DCS_GOES_ARN=${DCS_GOES_ARN}, \
		DCS_IRIDIUM_ARN=${DCS_IRIDIUM_ARN}, \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		SEARCH_DCS_CIDS_INDEX=${SEARCH_DCS_CIDS_INDEX}, \
		SEARCH_DCS_GOES_INDEX=${SEARCH_DCS_GOES_INDEX}, \
		SEARCH_DCS_IRIDIUM_INDEX=${SEARCH_DCS_IRIDIUM_INDEX}, \
		R2_ACCOUNT_ID=${R2_ACCOUNT_ID}, \
		R2_KEY=${R2_KEY}, \
		R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}, \
		R2_DCS_BUCKET=${R2_DCS_BUCKET}, \
		KAFKA_API_KEY=${KAFKA_API_KEY}, \
		KAFKA_API_SECRET=${KAFKA_API_SECRET}, \
		KAFKA_BOOTSTRAP_SERVER=${KAFKA_BOOTSTRAP_SERVER}, \
		S3_DCS_BUCKET=${S3_DCS_BUCKET}, \
		AWS_ACCOUNT=938337067586, \
		AWS_REGION=us-east-1 \
	}" 