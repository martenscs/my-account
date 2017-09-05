[![Build Status](https://travis-ci.org/pingidentity/my-account.svg?branch=master)](https://travis-ci.org/pingidentity/my-account)

my-account
==========

Data Governance Server sample UI for self-service account management


### Customization

This sample application's source contains configuration values that must be customized before it can be built and
deployed.  These values are defined near the top of the app/app.config.ts file for easy customization (search for the
"export" statements).

Some of these configuration values depend on how the sample application is being deployed.  See the "Deployment" section
below for more details.

These values always need to be changed:

1. `IDENTITY_PROVIDER_URL`
   The absolute URL of the PingFederate server that is configured as the Data Governance Server's IDP.  A value like
   "https://my-pingfed-server:9031" (https://[ping-federate-hostname]:[oath-port]) should be used.  See the
   "PingFederate Configuration" section below for more details.
2. `CLIENT_REDIRECT_URL`
   The absolute URL of the sample application's callback.html page.  The correct value to use depends on how the
   application is being deployed.  If the sample will be deployed using the Data Governance Server as the servlet
   container, this constant should be set to the URL of the Web Application Extension in the HTTPS Connection Handler,
   such as "https://1.2.3.4:8443/samples/my-account/callback.html".  If the sample will be deployed using an external
   servlet container such as Tomcat or Jetty then this value should use that server's URL and the path for the
   application's callback.html file.  If the sample will be run in the development environment ("npm run dev"), this
   constant should be set to "http://localhost:3006/callback.html".

This value may need to be changed, depending on how the application is deployed:

1. `RESOURCE_SERVER_URL`
   The URL of the Data Governance Server's SCIM connection handler.  If the sample will be deployed using the Data
   Governance Server as the servlet container, this constant can use the relative URL `/` and does not need to be
   customized.  If the sample will be deployed using an external servlet container such as Tomcat or Jetty -OR- the
   sample will be run in the development environment ("npm run dev"), this constant should be set to the Data Governance
   Server's absolute URL.  A value like "https://1.2.3.4:8443" (https://[data-governance-hostname]:[https-port]/) should
   be used.

These values should not need to be changed for a typical deployment:

1. `CLIENT_ID`
   The Client ID assigned to the My Account OAuth2 Client in the PingFederate configuration.
2. `URN_PREFIX`
   A prefix used by various URNs in the Data Governance Server and the PingFederate configuration.
3. `SCOPES`
   The Scopes requested by the sample.  A space-separated value like "scope1 scope2 scope3" should be used.

The sample's default configuration depends on scopes that are created by the setup.dsconfig file:

1. `urn:pingidentity:scope:manage_profile`
   Allows reading and modifying the user's profile attributes.  This scope is configured with resource attributes
   that are defined by the Data Governance Server's reference app schema.
2. `urn:pingidentity:scope:change_password`
   Allows changing the user's password.  This scope is configured with a resource attribute that is defined by the Data
   Governance Server's reference app schema.

Changes such as using a schema other than the Data Governance Server's reference app schema will require more extensive
customization of the sample's files and configuration.  This includes modifying the application files as well as
updating the configuration of the scopes' resource attributes.


### Building the project

The build process requires node and npm to be installed on the development machine
(https://docs.npmjs.com/getting-started/installing-node).  This project was verified to work with node v6.2.2 and
npm v3.10.2, but there are not currently any known version compatibility issues.

Once node and npm are installed, the project's dependencies can be installed by running "npm install" within the source
directory.  When executed as root on linux, use "npm install --unsafe-perm" instead.

The package.json file defines several project scripts that can be run via "npm run [SCRIPT NAME]".  Examples include
"prod" which will rebuild the project and package it in a war file, "dev" for running the project in the development
environment, and "test" for running the referenced jasmine test spec files within the development environment.  NOTE:
The scripts assume a UNIX-based operating system.  They will need to be modified if you are using a Windows development
environment.

When ready to deploy a customization in a servlet container, run "npm run prod" from the command-line to rebuild the
project and package it into a war file.


### Deployment

The sample can be deployed as a war file in the Data Governance Server itself or in an external servlet container such
as Tomcat or Jetty.  It can also be run in the development environment without a servlet container using the
"npm run dev" script.


###### Using Data Governance Server as the servlet container

1. Configure PingFederate as per the "PingFederate Configuration" section below.
2. Clone this git project in your development environment.
3. Customize the necessary configuration values as per the "Customization" section above.
4. Build and package the application in a war file using the "npm run prod" script as per the "Building the project"
   section above.
5. Edit the setup.dsconfig file and uncomment the commands to create a Web Application Extension and assign it to the
   HTTPS Connection Handler (make sure you update the "war-file" parameter value to point to your war file).
6. Use dsconfig to run the commands in the setup.dsconfig file.  This will create a Web Application Extension, assign
   the Web Application Extension to the HTTPS Connection Handler, and add the required Scopes to
   the Data Governance Server's configuration.  If you are installing the sample on a Data Governance Server
   group, you can apply the script to the entire server group using the "--applyChangeTo server-group" argument. For
   Data Governance Servers added later, copy the war file into place before cloning the configuration from an existing
   server.
7. Restart the HTTP Connection Handler by disabling and re-enabling it, or by restarting the server.
8. Access the sample at the HTTP Connection Handler's address and the /samples/my-account context.  For example:
   "https://1.2.3.4:8443/samples/my-account/".

If you need to re-build/deploy the sample in the future, you can simply copy the new war file over the existing sample
war file, remove the "tmp/My Account" directory so that the Data Governance Server will redeploy from the new war file,
and restart the HTTP Connection Handler by disabling and re-enabling it or by restarting the server.


###### Using an external servlet container such as Tomcat or Jetty

1. Configure PingFederate as per the "PingFederate Configuration" section below.
2. Clone this git project in your development environment.
3. Customize the necessary configuration values as per the "Customization" section above.
4. Build and package the application in a war file using the "npm run prod" script as per the "Building the project"
   section above.
5. Deploy the custom my-account.war file into your servlet container as appropriate (e.g. copy it into the webapps
   directory of your Tomcat installation and restart).
6. Use dsconfig to run the commands in the setup.dsconfig file.  This will add the required Scopes to the Data
   Governance Server's configuration.  If you are installing the sample on a Data Governance Server
   group, you can apply the script to the entire server group using the "--applyChangeTo server-group" argument.
7. Use dsconfig or the console application to edit the HTTP Servlet Cross Origin Policy configuration to allow for
   cross-domain AJAX requests to the Data Governance Server's SCIM2 HTTP Servlet Extension. The sample application's
   origin and the Data Governance Server's origin should be added to "cors-allowed-origins", and "GET", "DELETE", "POST"
   and "PUT" should be added to "cors-allowed-methods". E.g.,
```
dsconfig create-http-servlet-cross-origin-policy --policy-name my-account \
   --set cors-allowed-origins:http://localhost:3004 --set cors-allowed-origins:https://localhost:8445 \
   --set cors-allowed-methods:GET --set cors-allowed-methods:DELETE --set cors-allowed-methods:POST \
   --set cors-allowed-methods:PUT

dsconfig set-http-servlet-extension-prop --extension-name SCIM2 --set cross-origin-policy:my-account
```
8. Access the sample at your servlet container's address and the appropriate context.


###### Running in the development environment ("npm run dev")

1. Configure PingFederate as per the "PingFederate Configuration" section below.
2. Clone this git project in your development environment.
3. Customize the necessary configuration values as per the "Customization" section above.
4. Use dsconfig to run the commands in the setup.dsconfig file.  This will add the required Scopes to the Data
   Governance Server's configuration.  If you are installing the sample on a Data Governance Server
   group, you can apply the script to the entire server group using the "--applyChangeTo server-group" argument.
5. Use dsconfig or the console application to edit the HTTP Servlet Cross Origin Policy configuration to allow for
   cross-domain AJAX requests to the Data Governance Server's SCIM2 HTTP Servlet Extension. The sample application's
   origin and the Data Governance Server's origin should be added to "cors-allowed-origins", and "GET", "DELETE", "POST"
   and "PUT" should be added to "cors-allowed-methods". E.g.,
```
dsconfig create-http-servlet-cross-origin-policy --policy-name my-account \
   --set cors-allowed-origins:http://localhost:3004 --set cors-allowed-origins:https://localhost:8445 \
   --set cors-allowed-methods:GET --set cors-allowed-methods:DELETE --set cors-allowed-methods:POST \
   --set cors-allowed-methods:PUT

dsconfig set-http-servlet-extension-prop --extension-name SCIM2 --set cross-origin-policy:my-account
```
6. Run the "npm run dev" script in the development environment (see the "Building the project" section above for more
   details).
7. Access the sample at "http://localhost:3004" in the development environment.


### PingFederate Configuration

The sample application's default configuration assumes that a PingFederate server is performing the Identity Provider
(IDP) role (Data Governance Server is performing the Resource Server role).

This requires that both the Data Governance Server and PingFederate server have been configured so that the Data
Governance Server's SCIM endpoint can accept and validate the PingFederate server's access tokens.  Refer to the Data
Governance Server documentation for the required configuration to enable this feature.

Additionally, the following should be configured in PingFederate:

   * Under Scope Management, configure scopes with names that match those listed in the "Customization" section above.
   * Configure an OAuth Client for this application.  The Client ID should match the `CLIENT_ID` value in the
     application's app.config.ts configuration file.  Client Authentication should be set to "None".  The Redirect URI
     should be the address the sample application will be accessible at (see the "Deployment" section above), and should
     match the `CLIENT_REDIRECT_URL` value in the application's app.config.ts configuration file.  Allowed Grant Type
     should be "Implicit".
   * The OAuth Client must use an Access Token Manager of type "JSON Web Tokens".
   * To allow Sign Out from the application, configure Asynchronous Front-Channel Logout settings in the
     OAuth Settings > Authorization Server Settings screen. Select the Track User Sessions for Logout and Revoke User
     Session on Logout check boxes.  Add the application's domain and path to the allowed redirect list in the Server
     Configuration > Redirect Validation screen.


### Known issues

1. Google Chrome prior to version 34 had an issue that would cancel ORIGIN requests with headers.  If using
   Google Chrome, make sure you are running version 34 or greater with the sample.  Please see this issue report for
   additional information:

   https://code.google.com/p/chromium/issues/detail?id=96007

2. This sample uses the OAuth 2 implicit grant for retrieving access tokens, and sessionStorage for temporarily
   persisting data for use by client scripts in the browser.  You should not do the same in your own applications
   without considering the security implications of this approach.  When using the implicit grant, the access tokens are
   exposed to the user and potentially other applications with access to the user's browser.  Additionally,
   sessionStorage is scoped per origin and window/tab, which makes it accessible to other applications running on the
   same server and port (Data Governance Server connection handler) loaded in the same tab.  An alternate approach would
   be to use the OAuth 2 authentication code grant, which would keep the access token on the server so that it would not
   be exposed to the user or stored in the browser.  Please see the following specifications for additional information
   on this issue:

   http://tools.ietf.org/html/rfc6749#section-1.3.2
   https://html.spec.whatwg.org/multipage/webstorage.html#the-sessionstorage-attribute


### Support and reporting bugs

This is unsupported sample code. Help will be provided on a best-effort basis through GitHub. Please report issues 
using the project's [issue tracker](https://github.com/pingidentity/my-account/issues).


### License

This is licensed under the Apache License 2.0.
