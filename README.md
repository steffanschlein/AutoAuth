# AutoAuth
AutoAuth is a simple Firefox Addon based on WebExtension that submits HTTP authentication credentials automatically. It **does not** send credentials to pages that have a custom login form.

## Installation
The extension is available on Firefox' Addon portal or as a signed release on GitHub:
* [Firefox Addon portal](https://addons.mozilla.org/firefox/addon/autoauth/)
* [GitHub Releases](https://github.com/steffanschlein/AutoAuth/releases)

## Features
The Addon intercepts all responses asking for HTTP authentication. If there are credentials stored, they will be sent to the server without promting the user.
* Store credentials per host or port
* Ignore hosts or ports on hosts so user has to enter credentials normally
* View hosts for which credentials are stored

## Security
The entered credentials are stored in the local storage of the addon. Thus, the passwords are *not* encrypted. Currently, Firefox does not offer a secure way of storing credentials for Addons.

This, however, is not seen as a security problem: The main use case of the Addon is to avoid manually submitting Firefox' auth form. Thus, it is assumed the user does not use a master password to encrypt his or her credentials.
