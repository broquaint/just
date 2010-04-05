/*=pod

=head1 NAME

JSAN - JavaScript Archive Network

=head1 SYNOPSIS

  <script type="text/javascript" src="/js/JSAN.js"></script>
  <script>
      JSAN.use('Test.Simple');
      plan({tests: 1});
      ok(1 == 1, 'one does equal one!');
  </script>

  // Or in a library.
  if (typeof JSAN != 'undefined') {
      JSAN.use('Some.Library');
  }

=head1 DESCRIPTION

This library allows JavaScript to behave more like traditional programming
languages and offers the programmer the abilility to create well-designed,
modular code.

=head1 DEPEDENCIES

slurp - some slurping function rather it be from XMLHttpRequest or ActiveXObject
eval - the ability to evaluate strings.

=cut*/

/*global self, document, alert, XMLHttpRequest, ActiveXObject */
/*jslint eqeqeq: true, nomen: true, newcap: true, white: true, onevar: true */



var Just, JSAN;

Just = JSAN = (function () {


	var slurp, convertPackageNameToPath, evaluatePackageName, extend, flatten, handleError, handleObservers, jsan;


	/** slurp(String url) Returns String

	This function reads the contents of a file into a string.

	**/
	slurp = function (url) {
		
		// Wrap the whole thing around a try so as to detect any errors.
		var requestObject, text;
		try {
			
			requestObject = typeof ActiveXObject !== "undefined" ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
		
			// Start using the requestObject
			requestObject.open("GET", url, false);
			
			requestObject.send(null);
			
			if (requestObject.status === 200 || requestObject.status === 0) {
				
				text = requestObject.responseText;
				
				if (typeof text === 'string') {
					return text;	
				}
				
			}
			
			
		} catch (e) {
			return '';
		}
		
		return '';

	};


	/** convertPackageNameToPath(String packageName) Returns String
	
	This will take something like Module.Stub and turn it into Module/Stub.js
	
	**/
	convertPackageNameToPath = function (packageName) {
		return packageName.replace(/\./g, "/") + ".js";
	};


	/** evaluatePackageName(String packageName) Returns Any

	This is essentially equivalent to eval(pkgname), however, eval is evil.

	*/
	evaluatePackageName = function (packageName) {
		
		var packageValue = self,
			keys = packageName.split('.'),
			
			i = 0,
			l = keys.length;
		
		while (i < l && typeof packageValue !== "undefined") {
		
			packageValue = packageValue[keys[i++]];
		
		}
		
		return packageValue;
		
		
	};


	/** extend(Any obj, Any props) Returns undefined

	This takes all the values of props and mixes them into obj.

	**/
	extend = function (obj, props) {
		for (var i in props) {
			if (props.hasOwnProperty(i)) {
				obj[i] = props[i];
			}
		}
	};


	/** flatten(Array list) Returns Array

	This turns a multidimensional array into a one dimensional one.

	**/
	flatten = function (list) {
		
		var flattenedList = [],
			currentElem = {},
			i = 0,
			l = list.length;
			
		while (i < l) {
			currentElem = list[i++];
			
			flattenedList = flattenedList.concat(typeof currentElem === 'object' ? flatten(currentElem) : currentElem);
		}
		
		return flattenedList;
		
	};
	

	/** handleError(String msg, String errorLevel = jsan.errorLevel) Returns undefined
	
	This handles errors according to a certain error level, see also jsan.errorLevel.
	
	**/
	handleError = function (jsan, msg, errorLevel) {
		errorLevel = errorLevel || jsan.errorLevel;
		
		jsan.errorMessage = msg;

		if (errorLevel === "warn") {
			alert(msg);
		} else if (errorLevel !== "none" && errorLevel !== "die") {
			throw new Error(msg);	
		}
		
	};


	/** handleObservers(Array observers, String packageName, Any packageValue, Array importList) Returns undefined
	
	This calls all of the values in observers, where as observers is meant to be jsan.observers.
	
	**/
	handleObservers = function (observers, packageName, packageValue, importList) {
		
		var i = 0,
			l = observers.length;
			
		while (i < l) {
			observers[i++](packageName, packageValue, importList);	
		}
		
	};






	jsan = function () { 
		jsan.addRepository(arguments);
	};

	jsan.prototype = {
		use: function () { 
			jsan.use.apply(jsan, arguments);
		}
	};
	

	extend(jsan, {
						
		VERSION:        0.15,
		errorLevel:     "none",
		errorMessage:   "",
		globalScope:    self,
		includePath:    ['.', 'lib'],
		
		loaded:         {
			addModule: function (packageName) {
				jsan.loaded[convertPackageNameToPath(packageName)] = evaluatePackageName(packageName);
			}	
		},
		observers:      [],
		
		// Try to find the url of a script tag that points to this script.
		cwd: (function () {
			
			if (document) {
				
				var scripts = document.getElementsByTagName('script'),
					currentScriptSource = '',
					inc = [],
					i = 0,
					l = scripts.length;
				
				while (i < l) {
					currentScriptSource = scripts[i++].getAttribute('src');
					
					if (currentScriptSource) {
						inc = currentScriptSource.match(/^(.*?)\/?JSAN.js/);
						
						if (inc && inc[1]) {
							return inc[1];
						}
					}
						
				}
				
			}		
			
			return '.';
		})(),
		
		addRepository: function () {
			
			// unshift( @INC, @_ );
			jsan.includePath = flatten(arguments).concat(jsan.includePath);
			
			return jsan;
		},

		require: function (packageName, disableObserverHandling) {
			
			var path = convertPackageNameToPath(packageName),
				pathDirectory = path.replace(/[^\/]*$/, ""),
				classdef = jsan.loaded[path],
				
				INC = jsan.includePath,
				i, l, pastCwd, js;
				
			// lets try to eval(packageName)
			if (typeof classdef === "undefined") {
				classdef = evaluatePackageName(packageName);				
			}
			
			// Now lets try to find the package file and eval it.
			if (typeof classdef === "undefined") {
			
				i = 0, l = INC.length, pastCwd = jsan.cwd.toString();
			
				// Start looping through INC
				for (; i < l; i++) {
					
					var js  = slurp(INC[i] + '/' + path);
					
					if (js) {
						
						try {
							// Give the file its cwd
							jsan.cwd = INC[i] + '/' + pathDirectory;
							eval.apply(null, [js]);
							jsan.cwd = pastCwd;					
						} catch (e) {
							handleError(jsan, "The javascript failed to execute.");
						}
						
						classdef = evaluatePackageName(packageName);
						jsan.loaded[path] = classdef;
						
						if (!disableObserverHandling) {
							handleObservers(jsan.observers, packageName, classdef);
						}

						break;
					}
					
				}
				
			}

			return typeof classdef !== "undefined" ? classdef : false;

		},
		
		use: function (packageName) {
			
			var classdef = jsan.require(packageName, true),
				importList;
				
			if (classdef) {
			
				// Handle slurpy arguments in JavaScript
				importList = Array.prototype.slice.apply(arguments, [1, arguments.length]);
				
				handleObservers(jsan.observers, packageName, classdef, importList);
				
				return classdef;
				
			}
			
			return null;
		}

	});



	// Add the cwd to the includePath if it is not already there.
	(function () {
		var i = 0, INC = jsan.includePath, l = INC.length;
		
		while (i < l) {
			if (INC[i++] === jsan.cwd) {
				return;
			}
		}
	
		jsan.addRepository(jsan.cwd.toString());
		
	})();





	return jsan;
	
})();














/*=pod

=head1 INTERFACE

=head2 OOP Interface

You can instantiate JSAN yourself and use it from there:

  var jsan = new JSAN("./lib/");
	
  jsan.use("Module");

=head2 Properties

=head3 cwd

The property jsan.cwd will allow you to access the current working directory
of the script being evaluated

  var Module = (function () {
		
    var cwd = jsan.cwd.toString(),
        cssDirectory = cwd + "./css/",
        cssFile = slurp(cssDiretory + "main.css");
		
  })();

=head3 errorLevel

  JSAN.errorLevel = "die";

By default the C<errorLevel> is set to I<none>. This will supress errors
when trying to load libraries.

I<die> will throw an exception and it is the responsibility of the calling
code to catch it.

I<warn> will use the C<alarm()> function, usually present in web browsers,
to alert a user on error. This is good for debugging (in web browsers).

=head3 errorMessage

  var error = JSAN.errorMessage;

This contains the text of any error, no matter what the C<errorLevel>. Inspect
it to discover problems.

=head3 globalScope

  JSAN.globalScope = _player;

By default C<globalScope> is set to the value of C<self>. This works
great in web browswers, however other environments may not have C<self>
(an alias for C<window> in web browswers) for a global context. In those
cases, such as embedded JavaScript, you should reset C<globalScope>
before calling C<use()>.

=head3 includePath

  JSAN.includePath = [];

The C<includePath> is a list of URLs that should be used as prefixes
for libraries when they are C<use()>d. If you are adding repositories
please consider using the C<addRepository()> method.

=head3 loaded

  JSAN.loaded["Foo/Bar.js"] = Foo.Bar;

This object lists path to class definition mappings. The object is populated
with members by C<JSAN.require()>. The class definition is the one found
when evaluating the package name during namespace creation. It is the
same class definition that C<JSAN.require()> and C<JSAN.use()> returns.

  JSAN.loaded["Module/Stub.js"] = Module.Stub;
  JSAN.loaded.addModule("Module.Stub");

You can also add modules to loaded, via the addModule function, which
is essentially equivalent to using the loaded interface.

=head3 observers

  JSAN.observers.push(function(packageName,packageValue,importList) {
    alert("The package" + packageName + "got loaded!");	
  });
	
JSAN.observers allows you to add plugins, such as the Exporter into JSAN,
that way the loader can be completely independent of the exporter's functions.

=head2 Functions

=head3 addRepository(*repositories) returns JSAN

  JSAN.addRepository('js/private');

Add any number of paths to C<includePath>. This will move the repository to the
beginning of the list and it will be checked first for libraries. Calling
C<addRepository()> will add your include path for the entirety of the
request, no matter how many times you call C<JSAN.use()>.

As with use(), it will accept any combination of arrays and strings.

=head3 require(packageName) returns Any

  JSAN.require('Some.Class');

Loads a class into your scope. This will not export any symbols.

=head3 use(packageName, *importList) returns Any

    JSAN.use('Test.Simple');
    JSAN.use('DOM.Display');

Download and import a library. There is a mapping that is done with the
library name: it must be converted into a URL. Here is how it works.

  Test.Simple        Test/Simple.js
  HTTP.Request       HTTP/Request.js
  Foo.Bar.Baz        Foo/Bar/Baz.js

Each C<includePath> is then prepended, and the file requested, until it is
found.  The first working path in C<includePath> is used.

The library's constructor and prototype are imported into the calling
context. You can also request certain functions, or groups of functions,
to be imported explicitly. These groups can be done either singly or in
an array, whichever is more convenient. You can also explicitly choose to import nothing.
Here is an example of each.

  // Explicitly choose certain functions
  JSAN.use('Test.More', 'plan', 'ok', 'is');
  
  // Explicitly choose a certain tag
  JSAN.use('Digest.MD5', ':all');

  // Explicitly choose nothing
  JSAN.use('Digest.MD5', []);

  // Be really weird
  var stuff = [ 'h', 'i', ['j'] ];
  stuff.push( 'abc' );
  JSAN.use('Some.Module', 'a', 'b', [ 'c', 'd' ], stuff, 'f' );

=head1 SEE ALSO

JavaScript Namespaces,
L<http://justatheory.com/computers/programming/javascript/emulating_namespaces.html>.

Original JSAN Brainstorming,
L<http://use.perl.org/~schwern/journal/24112>.

OpenJSAN,
L<http://openjsan.org>.

Signed JavaScript,
L<http://www.mozilla.org/projects/security/components/jssec.html>.

=head1 AUTHOR

Current maintainer: John Cappiello <F<jcap@openjsan.org>>.
Original author: Casey West, <F<casey@geeknest.com>>.
Contributor: Jhuni, <F<jhuni_x@yahoo.com>>

=head1 COPYRIGHT

  Copyright (c) 2005 Casey West.  All rights reserved.
  This module is free software; you can redistribute it and/or modify it
  under the terms of the Artistic license.

=cut*/
