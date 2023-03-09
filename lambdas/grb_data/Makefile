 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://grb-pgc-dev/grb_data/lambda.zip
	aws s3 cp layer.zip s3://grb-pgc-dev/grb_data/layer.zip

clean:
	rm *.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name grb-lambda-layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name grb-lambda \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name grb-lambda \
	--environment "Variables={ \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		ES_SEARCH_CIDS=${SEARCH_GRB_CIDS_INDEX}, \
		ES_SEARCH_INDEX=${SEARCH_GRB_INDEX}, \
		R2_ACCOUNT_ID=${R2_ACCOUNT_ID}, \
		R2_KEY=${R2_KEY}, \
		R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}, \
		R2_GRB_BUCKET='geocloud-grb', \
		KAFKA_API_KEY=${KAFKA_API_KEY}, \
		KAFKA_API_SECRET=${KAFKA_API_SECRET}, \
		KAFKA_BOOTSTRAP_SERVER=${KAFKA_BOOTSTRAP_SERVER}, \
		S3_GRB_BUCKET=${S3_GRB_BUCKET}, \
		AWS_ACCOUNT=${AWS_ACCOUNT} \
		}" \