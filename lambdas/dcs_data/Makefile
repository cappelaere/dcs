 all: 
	zip
	aws

zip:
	cd lambda; npm run zip
	cd layer/nodejs; npm run zip

aws:
	aws s3 cp lambda.zip s3://dcs-pgc-dev/dcs_data/lambda.zip
	aws s3 cp layer.zip s3://dcs-pgc-dev/dcs_data/layer.zip

clean:
	rm *.zip