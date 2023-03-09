 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://grb-pgc-dev/dcs_logs/lambda.zip
	aws s3 cp layer.zip s3://grb-pgc-dev/dcs_logs/layer.zip

clean:
	rm *.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name dcs_logs_layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name dcs_logs \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name dcs_logs \
	--environment "Variables={ \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		SEARCH_DCS_LOGS_INDEX=${SEARCH_DCS_LOGS_INDEX} \
	}" 