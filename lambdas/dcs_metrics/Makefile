 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://grb-pgc-dev/dcs_metrics/lambda.zip
	aws s3 cp layer.zip s3://grb-pgc-dev/dcs_metrics/layer.zip

clean:
	rm *.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name dcs_metrics_layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name dcs_metrics \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name dcs_metrics \
	--environment "Variables={ \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		SEARCH_DCS_METRICS_INDEX=${SEARCH_DCS_METRICS_INDEX} \
	}" 