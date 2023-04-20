 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://grb-pgc-dev/dcs_graphql/lambda.zip
	aws s3 cp layer.zip s3://grb-pgc-dev/dcs_graphql/layer.zip

update_layer:
	aws lambda publish-layer-version \
	--layer-name dcs_graphql_layer \
	--zip-file fileb://layer.zip

update_code:
	aws lambda  update-function-code --function-name dcs_graphql \
	--zip-file fileb://lambda.zip

update_configuration:
	aws lambda update-function-configuration \
	--function-name dcs_graphql \
	--environment "Variables={ \
		ES_CLOUD_ID=${ES_CLOUD_ID}, \
		ES_USER=${ES_USER}, \
		ES_PWD=${ES_PWD}, \
		SEARCH_DCS_CIDS_INDEX=${SEARCH_DCS_CIDS_INDEX}, \
		SEARCH_DCS_GOES_INDEX=${SEARCH_DCS_GOES_INDEX}, \
		SEARCH_DCS_IRIDIUM_INDEX=${SEARCH_DCS_IRIDIUM_INDEX}, \
		SEARCH_GRB_CIDS_INDEX=${SEARCH_GRB_CIDS_INDEX}, \
		SEARCH_GRB_INDEX=${SEARCH_GRB_INDEX}, \
		R2_ACCOUNT_ID=${R2_ACCOUNT_ID}, \
		R2_KEY=${R2_KEY}, \
		R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}, \
		OPENAI_API_KEY=${OPENAI_API_KEY}, \
		CLOUDFRONT_DOMAIN_DCS=${CLOUDFRONT_DOMAIN_DCS}, \
		CLOUDFRONT_DOMAIN_GRB=${CLOUDFRONT_DOMAIN_GRB}, \
		CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}, \
		CLOUDFRONT_KEYPAIR=${CLOUDFRONT_KEYPAIR}, \
		CLOUDFRONT_PEM_SECRET=${CLOUDFRONT_PEM_SECRET} \
	}"

clean:
	rm *.zip