# Secrets

Some secrets are needed to build the app. You will need to create the files yourself.

## Calypso Secrets

We use an OAuth connection to authenticate logins against the WordPress.com API.
You can [create an application here](https://developer.wordpress.com/apps/new/).

When creating your application, you'll need to fill in all the fields:

* Name: Any name of your choosing.
* Description: A description, e.g. "My wp-desktop testing app".
* Website URL: A URL. For testing the desktop app, you can use the repo URL
  `https://github.com/Automattic/wp-desktop`.
* Redirect URLs: The form requires a valid URL. You can use the origin `http://127.0.0.1:41050`.
* Javascript Origins: `http://127.0.0.1:41050`
* Answer the bot challenge correctly.
* Type: Native

When you've filled out the form, click the create button.

In the end, your application details should look similar to:
![application details](https://cld.wthms.co/EjNmEl+)

After your application is created, copy your client id and client secret, and add a
`calypso/config/secrets.json` file:

```json
{
	"desktop_oauth_token_endpoint": "https://public-api.wordpress.com/oauth2/token",
	"desktop_oauth_client_id": "<YOUR CLIENT ID>",
	"desktop_oauth_client_secret": "<YOUR CLIENT SECRET>"
}
```
