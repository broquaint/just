/*

=head1 NAME

Manual.WritingLibraries - A guide on how to writing libraries on JSAN

=head1 DESCRIPTION

The JSAN repository allows you to submit modules of reusable code
for other people to use, this guide describes a method of building
those modules.

=head2 Compile Time

C<JSAN> creates an interesting sort of compile time for libraries loaded
through it. This means that code that does not exist inside of a function
is considered I<compile time> code. This has certain implications when
a library uses JSAN to import another library.

=head2 Namespaces

JavaScript - exempting version 2 anyway - does not have a notion of
namespaces. For this reason something very important has been missing.
However, JavaScript's object system is perfectly suited to create
namespaces for well written code.

The first thing you have to do when creating a library is define the
namespace. The namespace must match the library name as well so C<use()>
can import the classes and functions correctly.

The name of this library, C<JSAN>, or the name of our testing system,
C<Test.Simple>, are examples of namespaces. A namespace is built by
defining objects at each level until you reach the final name.

Defining a namespace for JSAN is simple.

  var JSAN = {};

Defining the namespace for C<Test.Simple> takes a little more work.
First you have to create an object at the variable named C<Test> if
it doesn't already exist. Then you can create an object, or place a
constructor, at the C<Test.Simple> location.

  if (typeof Test == 'undefined') Test = {};
  Test.Simple = {};

So far we've just been inserting blank objects at the final namespace.
That's fine if your library implements functions and does not
implement a class. However, if you implement a class you will want
to place a constructor in the final namespace instead.

  if (typeof Name == 'undefined') Name = {};
  
  Name.Space = function () {
      // This is the constructor.
  }

Further, you'll want to define your class. This is done by defining
the prototype in your namespace.

  Name.Space.prototype = {
      publicProperty: 'you see me',
      
      _privateProperty: 'boo',
      
      publicMethod: function (arg1, arg2) {
          // We do stuff man.
      },
      
      _privateMethod: function () {
          this._privateProperty = "no peaking";
      }
  };

=head2 Writing Libraries

=head3 Class Libraries

Class libraries implement a public class that will be exported to the caller.
The public class contains the same name as the package C<use()> was called
with.

First, you have to set up a namespace.

  if (typeof DOM == 'undefined') DOM = {};

  DOM.Display = function () {};

Next you can define the class's prototype.

  DOM.Display.prototype = {
      register: {},
  
      hideElement: function (id) {
          // Do stuff.
      },
  
      showElement: function (id) {
          // Do stuff.
      },
  
      showOnlyElement: function (id) {
          // Do stuff.
      },
  
      registerElement: function (id) {
          // Do stuff.
      }
  };


At this point your library may have dependencies. If that's the case you
can use C<JSAN> to try and import them. This works because you have,
theoretically, modified the C<JSAN.includePath> on your initial
invocation of the library. So your libraries being C<use()>d need not
know anything about C<includePath>s.

  if (typeof JSAN != 'undefined') {
      JSAN.use('Some.Dependency');
  }

=head3 Functional Libraries

Functional libraries strictly intend to export a set of functions to the
caller. While they may contain a class, or many classes, those classes are
not part of the publicly documented API. These are simple to create but a
few rules do apply.

First, you still have to set up a namespace.

  if (typeof Digest == 'undefined') Digest = {};
  Digest.MD5 = {};

Next you can define your export list.

  Digest.MD5.EXPORT_OK   = [  'md5', 'md5Hex', 'md5Base64' ];
  Digest.MD5.EXPORT_TAGS = { ':all': Digest.MD5.EXPORT_OK };

Now you may go on to define your functions. They must be fully qualified
just like the C<EXPORT_OK> and C<EXPORT_TAGS> variables.

  Digest.MD5.md5 = function (str) {
      // Do stuff.
  }

  Digest.MD5.md5Hex = function (str) {
      // Do stuff.
  }

  Digest.MD5.md5Base64 = function (str) {
      // Do stuff.
  }

At this point your library may have dependencies. If that's the case you can
use C<JSAN> to try and import them.

  if (typeof JSAN != 'undefined') {
      JSAN.use('Some.Dependency');
  } else {
      if (Digest.MD5.DEBUG == true
          && typeof Some.Dependency == 'undefined') {
          throw new Error("Some.Dependency not loaded.");
      }
  }

=head1 AUTHOR

Original author: Casey West, <F<casey@geeknest.com>>.

=head1 COPYRIGHT

  Copyright (c) 2005 Casey West.  All rights reserved.
  This module is free software; you can redistribute it and/or modify it
  under the terms of the Artistic license.

*/
