my-account
==========

Data Broker sample UI for self-service account management


### Simple Deployment (within the Data Broker)

1. Extract the my-account.tar.gz file (found in the samples directory).
2. Use dsconfig to run the commands in the setup.dsconfig file.  This will create a Web Application Extension, assign
   the Web Application Extension to the HTTPS Connection Handler, and add the required Scope and OAuth Client objects to
   the Data Broker's configuration.
3. Restart the HTTP Connection Handler by disabling and re-enabling it, or by restarting the server.
4. Access the sample at the HTTP Connection Handler's address and the /samples/my-account context.  For example:
   "https://1.2.3.4:8443/samples/my-account/".


### Advanced Deployment (in an external servlet container such as Tomcat or Jetty)

1. Extract the my-account.tar.gz file (found in the samples directory).
2. Extract the source from the my-account-source.tar.gz file in a development environment.
3. Customize the configuration values and optionally the other application source files and build my-account.war (see
   the "Customization" section for additional details).
4. Deploy the custom my-account.war file into your servlet container as appropriate (e.g. copy it into the webapps
   directory of your Tomcat installation and restart).
5. Use dsconfig to run the commands in the setup.dsconfig file that add the required Scope and OAuth Client objects to
   the Data Broker's configuration.
6. Use dsconfig or the Management Console application to add the URI the sample application will be accessible at to the
   my-account Sample Application's Redirect URIs list.
7. Use dsconfig or the Management Console application to edit the HTTP Servlet Cross Origin Policy configuration to
   allow for cross-domain AJAX requests to the Data Broker's SCIM2 HTTP Servlet Extension. The sample application's
   origin and the Data Broker's origin should be added to "cors-allowed-origins", "authorization" should
   be added to "cors-allowed-headers", and "DELETE", "PUT" and "POST" should be added to "cors-allowed-methods".
8. Access the sample at your servlet container's address and the appropriate context.


### Scopes

The sample's default configuration depends on the urn:unboundid:scope:manage_account scope that is created by the
setup.dsconfig file.

This scope allows the full management of the user's account, including reading and modifying profile attributes,
reading and revoking consent records, resetting their password, etc.

This scope is configured with resource attributes that are defined by the Data Broker's reference app schema.  If
another schema is used this scope will need to be re-configured (see the "Customization" section for additional
details).


### Customization

The sample application source is available so that the application can be easily customized and rebuilt (it is not
recommended to edit the contents of the packaged war file directly).  The source is available in the
my-account-source.tar.gz file within the my-account.tar.gz file.

The build process requires node and npm to be installed on the development machine
(https://docs.npmjs.com/getting-started/installing-node).

Once node and npm are installed, the project's dependencies can be installed by running "npm install" within the source
directory.

The package.json file defines several project scripts that can be run via "npm run [SCRIPT NAME]".  Examples include
"prod" which will rebuild the project for packaging in a war file, "dev" for running the project in the development
environment, and "test" for running the referenced jasmine test spec files within the development environment.

Once the project has been rebuilt, the war file can be packaged from the command-line using a command such as
"jar cvf my-account.war app dist index.html callback.html package.json system.config.js".

The my-account Web Application Extension can then be updated to reference the custom my-account.war file (make sure
to remove "tmp/My Account Sample" so that the Data Broker will redeploy from the new war file when the HTTP connection
handler and/or the server are restarted).

Several configuration values are defined in the app/app.config.ts file for easy customization.  The configuration values
can be found near the top of the script (search for the "export" statements). Values include:
1. IDENTITY_PROVIDER_URL
   The URI of the Data Broker's OAuth connection handler.  A value like "https://1.2.3.4:8443" should be used.
2. RESOURCE_SERVER_URL
   The URI of the Data Broker's SCIM connection handler.  A value like "https://1.2.3.4:8443" should be used.
3. CLIENT_REDIRECT_URL
   The redirect URI for the client in the OAuth flow.  This should be the address used to view the sample, and
   should be one of the Redirect URIs configured for the sample application in the Data Broker.  A value like
   "https://1.2.3.4:8443/samples/my-account/" should be used.
4. CLIENT_ID
   The Client ID assigned to the my-account Sample Application in the Data Broker configuration.  This is
   set to a known value by the setup configuration script and should not typically need to be changed.
5. SCOPES
   The Scopes requested by the sample.  A space-separated value like "openid urn:unboundid:scope:manage_account"
   should be used.

Changes such as using a schema other than the Data Broker's reference app schema will require more extensive
customization of the sample's files and configuration.  This includes modifying the application files as well as
updating the configuration of the scope's resource attributes.


### Known issues

1. Google Chrome prior to version 34 had an issue that would cancel ORIGIN requests with headers.  If using
Google Chrome, make sure you are running version 34 or greater with the sample.  Please see the following issue reports
for additional information:

    https://code.google.com/p/chromium/issues/detail?id=96007
    http://bugs.jquery.com/ticket/12698

2. This sample uses the OAuth 2 implicit grant for retrieving access tokens, and sessionStorage for temporarily
persisting them for use by client scripts in the browser.  You should not do the same in your own applications without
considering the security implications of this approach.  When using the implicit grant, the access tokens are exposed to
the user and potentially other applications with access to the user's browser.  Additionally, sessionStorage is scoped
per origin and window/tab, which makes it accessible to other applications running on the same server and port (Data
Broker connection handler) loaded in the same tab.  An alternate approach would be to use the OAuth 2 authentication
code grant, which would keep the access token on the server so that it would not be exposed to the user or stored in the
browser.  Please see the following specifications for additional information on this issue:

    http://tools.ietf.org/html/rfc6749#section-1.3.2
    http://dev.w3.org/html5/webstorage/#the-sessionstorage-attribute
