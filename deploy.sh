aws s3 sync --acl=public-read --delete --storage-class=REDUCED_REDUNDANCY --exclude '.git/*' ./ s3://shahon.dodgson.org
