# Secrets

Some secrets are needed to build the app. You will need to create the files yourself.

## Calypso Secrets

We use an OAuth connection to authenticate logins against the WordPress.com API. You can [create an application here](https://developer.wordpress.com/apps/). When you have the details,
create a `calypso/config/secrets.json` file:

```json
{
	"desktop_oauth_token_endpoint": "https://public-api.wordpress.com/oauth2/token",
	"desktop_oauth_client_id": "<YOUR CLIENT ID>",
	"desktop_oauth_client_secret": "<YOUR CLIENT SECRET>"
}
```
