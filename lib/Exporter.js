/*=pod

=head1 NAME

Exporter - Implements default import methods for JSAN modules

=head1 SYNOPSIS

In your module: Module.js

  JSAN.require('Exporter');
	
  Module.EXPORT = [];
  Module.EXPORT_OK = ['Foo', 'Bar'];
  Module.EXPORT_TAGS = {
    ':all': ['Foo', 'Bar']
  };
	
In other files which wish to use your module:

  JSAN.use('Module', ':all');
  JSAN.use('Module', 'Foo', 'Bar');
	
=head1 DESCRIPTION

This module allows you to export things from your module's namespace into 
the global namespace.

=head1 DEPENDENCIES

None.

=cut*/


/*global JSAN self */
/*jslint eqeqeq: true, nomen: true, newcap: true, undef: true, white: true, onevar: true */



var Exporter;

Exporter = (function () {

	var extendByKeys, flatten, isValueInArray;

	/** extendByKeys(Any obj, Any props, Array of String keys) Returns undefined

	This is similar to extend, except it only takes values of props froms props[keys]

	**/
	extendByKeys = function (obj, props, keys) {
		
		var currentKey = '',
			i = 0,
			l = keys.length;
		
		while (i < l) {
			currentKey = keys[i++];
			
			obj[currentKey] = typeof obj[currentKey] !== "undefined" ? obj[currentKey] : props[currentKey];	
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


	/** isValueInArray(Array arr, Any value) Returns Boolean

	This is similar to the php in_array function. It returns rather or not value is in arr.

	**/
	isValueInArray = function (arr, value) {
		
		for (var i = 0, l = arr.length; i < l; i++) {
		
			if (arr[i] === value) {
				return true;
			}		

		}
		
		return false;
		
	};



	return {
		
		handleModule: function (classdef, importList) {
			
			var exportList  = [],
				EXPORT      = classdef.EXPORT,
				EXPORT_OK   = classdef.EXPORT_OK,
				EXPORT_TAGS = classdef.EXPORT_TAGS,
				i, l, request, newExportKeys;
			
			if (importList.length > 0) {
				
				importList = flatten(importList);

				for (i = 0, l = importList.length; i < l; i++) {
					
					request = importList[i];
					newExportKeys = [];

					if (isValueInArray(EXPORT, request) || isValueInArray(EXPORT_OK, request)) {
						newExportKeys = [request];
					} else if (typeof EXPORT_TAGS[request] !== 'undefined') {
						newExportKeys = EXPORT_TAGS[request];
					}

					exportList = exportList.concat(newExportKeys);

				}
				
			} else {
				exportList = EXPORT;
			}
			
			if (typeof exportList !== "undefined") {
				extendByKeys(self, classdef, exportList);
			}
			
		}
		
	};
	

	
})();



// If JSAN is around, tell it that we can do its exporting work
if (typeof JSAN !== "undefined") {

	JSAN.observers.push(function (packageName, packageValue, importList) {
		
		if (importList) {
			Exporter.handleModule(packageValue, importList);
		}
		
	});

}

















/*=pod

=head1 Properties

=head2 Module Properties

The C<use()> function supports an Exporter style system. This means that
you can create functions that will be exported to the caller
automatically, functions that will be exported when requested, and
groups of functions - called tags - that are exported when requested.

=head3 EXPORT

Set up functions that are auto-exported B<unless> the caller declares a
function list.

  Name.Space.EXPORT = [ 'functionOne', 'functionTwo' ];

Importing the default functions.

  jsan.use('Name.Space');

Importing specific functions.

  jsan.use('Name.Space', 'functionOne'); // Don't want functionTwo()

=head3 EXPORT_OK

Set up functions that are exported only by request.

  Name.Space.EXPORT    = [ 'functionOne', 'functionTwo' ];
  Name.Space.EXPORT_OK = [ 'specialOne',  'specialTwo'  ];

Import the default functions. This will B<not> import any functions inside
the C<EXPORT_OK> list.

  jsan.use('Name.Space');

Import some specific function from C<EXPORT_OK>. This will B<not> import any
functions from the C<EXPORT> list.

  jsan.use('Name.Space', 'specialOne');

=head3 EXPORT_TAGS

Set up a grouping of functions that can be exported all at once. This example
also illustrates something I dislike about JavaScript arrays. I'll leave that
for you to discover.

  function _expandTheFreakingLists () {
      var expanded = [];
      for (var i = 0; i <= arguments.length; i++ ) {
          var list = arguments[i];
          for (var j = 0; j <= list.length; j++) {
              expanded.push(list[j]);
          }
      }
      return expanded;
  }

  Name.Space.EXPORT_TAGS = {
      ":common": Name.Space.EXPORT,
      ":all":    _expandTheFreakingLists(Name.Space.EXPORT, Name.Space.EXPORT_OK)
  };

Now import all the functions.

  jsan.use('Name.Space', ':all');

Import the common functions and one special one.

  jsan.use('Name.Space', ':common', 'specialOne');

=head2 Exporter Properties

=head3 handleModule(Any classdef, Array importList) Returns undefined

This function will handle a module with an import list equivalent to what you put
in JSAN.use('').
	
  JSAN.use('Module', 'Foo', 'Bar', ':all' );
  handleModule(Module, ['Foo', 'Bar', ':all']);

=head1 AUTHORS

Jhuni, <jhuni_x@yahoo.com>

=head1 COPYRIGHT

This library is free software. You can redistribute it and/or modify it under the same terms as Perl itself.

=cut*/
