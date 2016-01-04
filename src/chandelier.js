
    /**
     * @file Chandelier 0.1.1
     * @author László Kardinál <xanadu.dreams@gmail.com>
     * @license MIT
     */

    /*

        The MIT License (MIT)

        Copyright (c) 2016 László Kardinál

        Permission is hereby granted, free of charge, to any person obtaining a copy
        of this software and associated documentation files (the "Software"), to deal
        in the Software without restriction, including without limitation the rights
        to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
        copies of the Software, and to permit persons to whom the Software is
        furnished to do so, subject to the following conditions:

        The above copyright notice and this permission notice shall be included in all
        copies or substantial portions of the Software.

        THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
        OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
        SOFTWARE.

    */

    (function(){

        "use strict";
    
        ////////////////////////////////////////////////////////////
        //  NEXT TICK
        ////////////////////////////////////////////////////////////

        /**
            Puts a function into the event queue
            @method _nextTick
            @param callback The function to invoke
        */
        var _nextTick;

        if ( typeof process !== "undefined" && "nextTick" in process )
        {
            _nextTick = process.nextTick;
        }
        else
        {
            _nextTick =
                function( callback )
                {
                    setTimeout( callback, 0 );
                };
        }

        ////////////////////////////////////////////////////////////
        //  OBJECT / ARRAY IDENTIFICATION
        ////////////////////////////////////////////////////////////

        /**
            Returns whether the parameter node is a plain object
            @method _isObject
            @param node The node to check
            @return Stores whether it matches the conditions
        */
        var _isObject = function ( node )
        {
            return ( ( typeof node == "object" && node != null ) && node.constructor == Object );
        };

        /**
            Returns whether the parameter node is an array
            @method _isArray
            @param node The node to check
            @return Stores whether it matches the conditions
        */
        var _isArray = function ( node )
        {
            return ( node instanceof Array );
        };

        /**
            Returns whether the parameter node is a plain object or an array
            @method _isContainer
            @param node The node to check
            @return Stores whether it matches the conditions
        */
        var _isContainer = function ( node )
        {
            return ( ( node instanceof Array ) || ( ( typeof node === "object" && node != null ) && node.constructor == Object ) );
        };

        ////////////////////////////////////////////////////////////
        //  DATA ACCESS HELPERS
        ////////////////////////////////////////////////////////////

        var _deepClone = function ( sourceObj )
        {
            return JSON.parse( JSON.stringify( sourceObj ) );
        };

        ////////////////////////////////////////////////////////////
        //  PATH COMPARISON
        ////////////////////////////////////////////////////////////

        /**
            Determines if the second path parameter suits to the first one
            @method _pathSuit
            @param path1 Parameter to suit ( can contain special elements )
            @param path2 Parameter to suit ( can contain special elements )
            @return Stores whether it matches the conditions
        */
        var _pathSuit = function ( path1, path2 )
        {
            // set match to false
            var match = false;

            // if the first path selects any element
            if ( path1.length == 1 && path1[ 0 ] == "$any" )
            {
                // that matches every path
                return true;
            }

            // if the second path selects any element
            if ( path2.length == 1 && path2[ 0 ] == "$any" )
            {
                // that matches every path
                return true;
            }

            // if they have the same length
            if ( path1.length == path2.length )
            {
                // set match to true
                match = true;

                // go through all elements
                for ( var k=0; k<path2.length; ++k )
                {
                    // if the path elements are not wildcards, or they are different
                    if ( path1[ k ] != "$one" && path2[ k ] != "$one" && path1[ k ] != path2[ k ] )
                    {
                        // we set match to false
                        match = false;
                        // and exit the loop
                        break;
                    }
                }
            }

            // returns if we had a match
            return match;
        };

        ////////////////////////////////////////////////////////////
        //  PATH CONVERSION
        ////////////////////////////////////////////////////////////

        /**
            Converts a string path to an array path
            @method _fromStringPath
            @param str The string path
            @return The array path
        */
        var _fromStringPath = function ( str )
        {
            // root selector
            if ( str == "/" )
            {
                return [ "$root" ];
            }

            // every node selector
            if ( str == "//" )
            {
                return [ "$any" ];
            }

            // replace wildcard character to special string
            str = str.replace( new RegExp( "[*]", "g" ), "$one" );

            // split the string by the / character
            var path = str.split( "/" );

            // if the first one is an empty string
            if ( path.length > 1 && path[ 0 ] == "" )
            {
                // overwrite it with "$root"
                path[ 0 ] = "$root";
            }

            return path;
        };

        /**
            Converts an array path to a string one
            @method _toStringPath
            @param path The array path
            @return The string path
        */
        var _toStringPath = function ( path )
        {
            // root selector
            if ( path.length == 1 && path[ 0 ] == "$root" )
            {
                return "/";
            }

            // every node selector
            if ( path.length == 1 && path[ 0 ] == "$any" )
            {
                return "//";
            }

            // concat path to string

            return path.join("/").replace( new RegExp( "[$]one", "g" ), "*" ).replace( new RegExp( "[$]root", "g" ), "" );
        };

        ////////////////////////////////////////////////////////////
        //  MIDDLEWARES
        ////////////////////////////////////////////////////////////

        /**
            Invoke registered middlewares of a method
            @method _callMiddlewares
            @param secret Private properties (binded)
            @param method The name of the method
            @param parameters Object of parameters
        */        
        var _callMiddlewares = function ( secret, method, parameters )
        {
            // array of middlewares
            var middlewares = secret.middlewares;

            // index of the current middleware
            var index = middlewares.length;

            var self = this;

            (
                function next()
                {
                    // matching middleware
                    var middleware = null;

                    while ( true )
                    {
                        // increase index
                        index--;

                        // if we have no middlewares left
                        if ( index < 0 )
                        {
                            // exit the loop
                            break;
                        }

                        // current element
                        var current = middlewares[ index ];

                        // if the current method is not in the object of methods
                        if ( !( method in current.methods ) )
                        {
                            // we have no match
                            continue;
                        }

                        // if the path is defined with the middleware
                        if ( "path" in current )
                        {
                            // and it is defined in the parameters
                            if ( "path" in parameters )
                            {
                                // if they are not suiting
                                if ( ! ( _pathSuit( current.path, parameters.path ) ) )
                                {
                                    // we have no match
                                    continue;
                                }
                            }
                            else
                            {
                                // if it's missing from the parameters, we have no match
                                continue;
                            }
                        }

                        // set the middleware
                        middleware = current.middleware;
                        // exit the loop
                        break;

                    }

                    if ( middleware != null )
                    {
                        // _nextTick(
                            // function ( )
                            // {
                                try
                                {
                                    middleware.call( self, parameters, next, method );
                                }
                                catch ( e )
                                {
                                    console.log( "Chandelier middleware threw exception" );
                                    console.log( e.stack || "" );
                                }
                            // }
                        // );
                    }

                }
            )();
        };

        /**
            Adds a middleware into the stack
            @method _use
            @param secret Private properties (binded)
            @param method The name(s) of the method (optional)
            @param path The path to suit (optional)
            @param middleware The middleware function ( parameters, next format )
        */
        var _use = function ( secret, methods, path, middleware )
        {
            var methods_obj = {};

            if ( typeof methods === "string" )
            {
                methods = [ methods ];
            }
            
            if ( methods instanceof Array )
            {
                for ( var i=0; i<methods.length; ++i )
                {
                    if ( typeof methods[i] === "string" )
                    {
                        methods_obj[ methods[i] ] = 0;
                    }
                    else
                    {
                        return;
                    }
                }
            }   
            else
            {
                return;
            }

            if ( typeof path === "function" )
            {
                middleware = path;
                path = null;
            }
            else
            {
                /*
                    ( method, path, middleware ) parameter format
                */

                if ( typeof middleware !== "function" )
                {
                    return;
                }

                // handle string path
                path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;
            }
            

            // object for wrapping the middleware
            var middlewareObj = 
            {
                "middleware": middleware,
                "methods": methods_obj
            };

            // if the path name is defined
            if ( path != null )
            {
                middlewareObj.path = path;
            }

            // add middleware
            secret.middlewares.push( middlewareObj );

        };


        ////////////////////////////////////////////////////////////
        //  PATH TRAVERSAR
        ////////////////////////////////////////////////////////////

        /**
            Traverse the data for nodes that suits the given path
            @method _traverse
            @param queryPath The original query path ( can contain special elements )
            @param i The counter of the part we check in the query path
            @param parentNode The parent node of the current node
            @param key The key in the parent node that refers to the current node
            @param node The current node
            @param path The path of the current node ( can only contain existing identifiers )
            @param found The callback function which we call if we found a match
        */
        var _traverse = function( queryPath, i, parentNode, key, node, path, found )
        {
            // if the path is empty
            if ( queryPath.length == 0 )
            {
                return;
            }

            // if the path is over
            if ( i == queryPath.length )
            {
                // we have a match
                found(
                    {
                        "parentNode": parentNode,
                        "key": key,
                        "node": node,
                        "path": path
                    }
                );
            }
            else
            {
                // if the node is a container
                if ( _isContainer( node ) )
                {
                    // if the current path part is a "*" string
                    if ( queryPath[ i ] == "$one" )
                    {
                        // we go through all elements in the container
                        for ( var k in node )
                        {
                            // and continue traversing with each one
                            _traverse( queryPath, i+1, node, k, node[ k ], path.concat( k ), found );
                        }
                    }
                    else
                    {
                        // if the current path element is in the container's keys
                        if ( queryPath[ i ] in node )
                        {
                            // key
                            var k2 = queryPath[ i ];

                            // we continue traversing with just the matching element
                            _traverse( queryPath, i+1, node, k2, node[ k2 ], path.concat( k2 ), found );
                        }
                    }
                }
            }

        };

        ////////////////////////////////////////////////////////////
        //  KEYS
        ////////////////////////////////////////////////////////////

        /**
            Generates a possibly unique key.
            @method _generateKey
            @return the generated key
        */
        var _generateKey = function ( )
        {
            return [ 
                Date.now().toString( 16 ),
                Math.floor( Math.random() * 2147483647 ).toString( 16 ),
                Math.floor( Math.random() * 2147483647 ).toString( 16 )
            ].join( "_" );
        };

        // list of illegal characters in object keys
        var _illegalCharacters = ["/", "*", ".", ",", "(", ")", "[", "]", "|", "\"", "'"];

        /**
            Determines if the key contains only legal characters.
            @method _legalKey
            @parameter key Key to inspect
            @return True if the given key has only legal characters.
        */
        var _legalKey = function ( key )
        {
            // if it is an empty string
            if ( key == "" )
            {
                return false;
            }

            // or it contains illegal characters
            for ( var i=0; i<_illegalCharacters.length; ++i )
            {
                if ( key.indexOf( _illegalCharacters[ i ] ) > -1 )
                {
                    return false;
                }
            }

            return true;
        };

        ////////////////////////////////////////////////////////////
        //  CREATE
        ////////////////////////////////////////////////////////////

        var _recursiveEmitCreated = function ( secret, path, node, key, options )
        {
            // new node's stuff
            var newNode = node[ key ];

            // create new message
            var newMessage = _deepClone( options.message );
            newMessage.value = _deepClone( newNode );

            // emit create event on the new element
            this.emit( "created", path, newMessage );

            // if it's a container, we recursively emit events for all subnodes
            if ( _isContainer( newNode ) )
            {
                // for all of the subnodes
                for ( var k in newNode )
                {
                    // emit
                    secret.recursiveEmitCreated( path.concat( k ), newNode, k, options );
                }
            }
        };

        var _createMiddleware = function( secret, parameters )
        {
            // parameter path
            var path = parameters.path;
            // parameter value
            var value = parameters.value;
            // parameter options
            var options = parameters.options;
            // parameter callback
            var callback = parameters.callback;

            /*
                TRAVERSE DATA
            */

            // result nodes from traversing
            var matches = [];

            // traverse data tree for nodes
            _traverse( path, 0, {}, "", secret.data, [],
                function ( match )
                {
                    matches.push( match );
                }
            );

            /*
                APPLY OPERATIONS
            */

            var self = this;

            if ( matches.length > 0 )
            {
                // current match in the loops
                var match;
                
                /*
                    key validation & error detection
                */
                for ( var i=0; i<matches.length; ++i )
                {
                    match = matches[ i ];

                    // if the matching node is an array
                    if ( _isArray( match.node ) )
                    {
                        if ( "key" in options )
                        {
                            // number key
                            var index = ( typeof options.key === "number" ) ? options.key : parseFloat( options.key );

                            // if the given key is a positive integer number
                            if ( !isNaN( index ) && ( index % 1 == 0 ) && index >= 0 )
                            {
                                match.key = index;
                            }
                            else
                            {
                                _nextTick(
                                    function ( )
                                    {
                                        callback(
                                            new Error(
                                                "Chandelier: the desired key \"" + index +
                                                "\" is not a non-negative integer at the following container: " +
                                                _toStringPath( match.path )
                                            )
                                        );
                                    }
                                );

                                return;
                            }
                        }
                        else
                        {
                            match.key = match.node.length;
                        }
                    }
                    else
                    {
                        // if the matching node is an object
                        if ( _isObject( match.node ) )
                        {
                            if ( "key" in options )
                            {
                                // if the given key is a string and it is legal
                                if ( typeof options.key === "string" && _legalKey( options.key ) )
                                {
                                    // if the key is in use
                                    if ( options.key in match.node )
                                    {
                                        _nextTick(
                                            function ( )
                                            {
                                                callback(
                                                    new Error(
                                                        "Chandelier: the desired key \"" + key +
                                                        "\" is already taken at the following container: " +
                                                        _toStringPath( match.path )
                                                    )
                                                );
                                            }
                                        );

                                        return;
                                    }
                                    else
                                    {
                                        match.key = options.key;
                                    }
                                }
                                else
                                {
                                    _nextTick(
                                        function ( )
                                        {
                                            callback(
                                                new Error(
                                                    "Chandelier: the desired key \"" + key +
                                                    "\" is not a string or contains illegal characters at the following container: " +
                                                    _toStringPath( match.path )
                                                )
                                            );
                                        }
                                    );

                                    return;
                                }
                            }
                            else
                            {
                                // otherwise we generate one
                                var key = this.generateKey();

                                if ( _legalKey( key ) )
                                {
                                    // if the key is in use
                                    if ( key in match.node )
                                    {
                                        _nextTick(
                                            function ( )
                                            {
                                                callback(
                                                    new Error(
                                                        "Chandelier: the generated key \"" + key +
                                                        "\" is already taken in the following container: " +
                                                        _toStringPath( match.path )
                                                    )
                                                );
                                            }
                                        );

                                        return;
                                    }
                                    else
                                    {
                                        match.key = key;
                                    }
                                }
                                else
                                {
                                    _nextTick(
                                        function ( )
                                        {
                                            callback( new Error( "Chandelier: the generated key \"" + key + "\" contains illegal characters" ) );
                                        }
                                    );
                                    
                                    return;
                                }
                            }
                        }
                        else
                        {
                            _nextTick(
                                function ( )
                                {
                                    callback( new Error( "Chandelier: the target node is not a container at the path: " + _toStringPath( match.path ) ) );
                                }
                            );
                            
                            return;
                        }
                    }
                }

                // array for return objects
                var retValues = [];

                // go through each match
                for ( var j=0; j<matches.length; ++j )
                {
                    match = matches[ j ];

                    var match_node_path = match.path.concat( match.key );

                    var newMessage;
                    
                    // if the matching node is an array
                    if ( _isArray( match.node ) )
                    {
                        // insert into the given position
                        match.node.splice( match.key, 0, value );

                        // // create new message
                        // var syncMessage = _deepClone( options.message );
                        // syncMessage.value = _deepClone( value );
                        // syncMessage.key = key;

                        // // emit create synchronization event
                        // self.emit( "syncCreate", match.path, syncMessage );

                        // emit created events
                        secret.recursiveEmitCreated( match_node_path, match.node, match.key, options );

                        // create new message
                        newMessage = _deepClone( options.message );
                        newMessage.value = _deepClone( match.node );

                        // emit create event on the new element
                        self.emit( "updated", match.path, newMessage );
                    }
                    else
                    {
                        // otherwise it is an object

                        // add the value to the object
                        match.node[ match.key ] = value;

                        // // create new message
                        // var syncMessage = _deepClone( options.message );
                        // syncMessage.value = _deepClone( value );
                        // syncMessage.key = key;

                        // // emit create synchronization event
                        // self.emit( "syncCreate", match.path, syncMessage );

                        // emit created events
                        secret.recursiveEmitCreated( match_node_path, match.node, match.key, options );

                        // create new message
                        newMessage = _deepClone( options.message );
                        newMessage.value = _deepClone( match.node );

                        // emit create event on the new element
                        self.emit( "updated", match.path, newMessage );
                    }

                    // toStringPath binding
                    match_node_path.toStringPath = _toStringPath.bind( match_node_path, match_node_path );

                    retValues.push( {"path": match_node_path } );
                }

                // callback without error
                _nextTick(
                    function ( )
                    {
                        callback( null, retValues );
                    }
                );
            }
            else
            {
                _nextTick(
                    function ( )
                    {
                        callback( new Error( "Chandelier: there are no elements matching the following path: " + _toStringPath( path ) ) );
                    }
                );
            }
        };

        var _create = function ( secret, path, value, paramOptions, paramCallback )
        {
            /*
                MANAGE PARAMETERS
            */

            // handle string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;
            // clone value
            value = _deepClone( value );
            // default options object
            var options = ( typeof paramOptions === "object" ) ? paramOptions : {};
            // default message object in options
            if ( ! ( "message" in options ) ) { options.message = {}; }

            // callback function
            var callback;

            // promise
            var promise;

            // determine which parameter is the callback function
            if ( typeof paramOptions === "function" )
            {
                callback = paramOptions;
            }
            else
            {
                if ( typeof paramCallback === "function" )
                {
                    callback = paramCallback;
                }
                else
                {
                    try
                    {
                        // make a promise
                        promise = new this.Promise(
                            function( resolve, reject )
                            {
                                // that is handled by this new callback function
                                callback = function ( err, val )
                                {
                                    if ( err )
                                    {
                                        reject( err );
                                    }
                                    else
                                    {
                                        resolve( val );
                                    }
                                };
                            }
                        );
                    }
                    catch ( e )
                    {
                        // empty callback
                        callback = function ( ){};
                    }
                }
            }

            // call middlewares
            secret.callMiddlewares( "create",
                {
                    "path": path,
                    "value": value,
                    "options": options,
                    "callback": callback
                }
            );

            return promise;

        };

        ////////////////////////////////////////////////////////////
        //  READ
        ////////////////////////////////////////////////////////////

        var _readMiddleware = function ( secret, parameters )
        {
            // parameter path
            var path = parameters.path;
            // parameter callback
            var callback = parameters.callback;

            /*
                TRAVERSE DATA
            */

            // result nodes from traversing
            var matches = [];

            // traverse data tree for nodes
            _traverse( path, 0, {}, "", secret.data, [],
                function ( match )
                {
                    matches.push( match );
                }
            );

            /*
                APPLY OPERATIONS
            */

            if ( matches.length > 0 )
            {
                // array for value objects
                var retValues = [];

                // go through each match
                for ( var i=0; i<matches.length; ++i )
                {
                    var match = matches[ i ];

                    // toStringPath binding
                    match.path.toStringPath = _toStringPath.bind( match.path, match.path );

                    // add the object to the array
                    retValues.push(
                        {
                            "value": _deepClone( match.node ),
                            "path": match.path
                        }
                    );
                }

                _nextTick(
                    function ( )
                    {
                        // we call the callback function with the array of retValues
                        callback( null, retValues );
                    }
                );
            }
            else
            {
                _nextTick(
                    function ( )
                    {
                        callback( new Error( "Chandelier: there are no elements matching the following path: " + _toStringPath( path ) ) );
                    }
                );
            }

        };

        var _read = function ( secret, path, paramOptions, paramCallback )
        {
            /*
                MANAGE PARAMETERS
            */

            // handle string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;
            // default options object
            var options = ( typeof paramOptions === "object" ) ? paramOptions : {};

            // callback function
            var callback;

            // promise
            var promise;

            // determine which parameter is the callback function
            if ( typeof paramOptions === "function" )
            {
                callback = paramOptions;
            }
            else
            {
                if ( typeof paramCallback === "function" )
                {
                    callback = paramCallback;
                }
                else
                {
                    try
                    {
                        // make a promise
                        promise = new this.Promise(
                            function( resolve, reject )
                            {
                                // that is handled by this new callback function
                                callback = function ( err, values )
                                {
                                    if ( err )
                                    {
                                        reject( err );
                                    }
                                    else
                                    {
                                        resolve( values );
                                    }
                                };
                            }
                        );
                    }
                    catch ( e )
                    {
                        // empty callback
                        callback = function ( ){};
                    }
                }
            }

            // call middlewares
            secret.callMiddlewares( "read",
                {
                    "path": path,
                    "options": options,
                    "callback": callback
                }
            );

            return promise;
        };

        ////////////////////////////////////////////////////////////
        //  UPDATE
        ////////////////////////////////////////////////////////////

        var _recursiveNodeUpdate = function ( secret, path, node, key, value, options )
        {
            var newMessage;
            
            var k;
            
            if ( _isContainer( node[ key ] ) )
            {
                if ( _isContainer( value ) )
                {
                    /*
                        BOTH NODES ARE CONTAINERS
                    */

                    // keys
                    var originalKeys = {};
                    var newKeys = {};
                    var intersectionKeys = {};

                    // get the node's keys
                    for ( k in node[ key ] ) { originalKeys[ k ] = null; }

                    // get the value node's keys
                    for ( k in value )
                    {
                        // if the node has it too
                        if ( k in originalKeys )
                        {
                            // remove it from the node
                            delete originalKeys[ k ];
                            // and add it to the intersection
                            intersectionKeys[ k ] = null;
                        }
                        else
                        {
                            // otherwise add it to the value node's keys
                            newKeys[ k ] = null;
                        }
                    }

                    var emitEvent = false;
                    var oldValue;

                    // delete nodes
                    for ( k in originalKeys )
                    {
                        secret.recursiveNodeDelete( path.concat( k ), node[ key ], k, { "message": options.message } );

                        if ( !emitEvent )
                        {
                            oldValue = _deepClone( node[ key ] );
                            emitEvent = true;
                        }
                    }

                    // create nodes
                    for ( k in newKeys )
                    {
                        // add the value to the object
                        node[ key ][ k ] = value[ k ];

                        // emit created events
                        secret.recursiveEmitCreated( path.concat( k ), node[ key ], k, { "message": options.message } );

                        if ( !emitEvent )
                        {
                            oldValue = _deepClone( node[ key ] );
                            emitEvent = true;
                        }
                    }

                    if ( !emitEvent )
                    {
                        if ( "forceUpdate" in options && options.forceUpdate )
                        {
                            oldValue = _deepClone( node[ key ] );
                            emitEvent = true;
                        }
                    }

                    if ( emitEvent )
                    {
                        // create new message
                        newMessage = _deepClone( options.message );
                        newMessage.value = _deepClone( value );
                        newMessage.oldValue = oldValue;

                        // emit updated event to the root node
                        this.emit( "updated", path, newMessage );
                    }

                    // update nodes
                    for ( k in intersectionKeys )
                    {
                        secret.recursiveNodeUpdate( path.concat( k ), node[ key ], k, value[ k ], options );
                    }
                }
                else
                {
                    /*
                        ONLY THE ORIGINAL NODE IS A CONTAINER, THE NEW NODE IS A VALUE
                    */

                    // create new message
                    newMessage = _deepClone( options.message );
                    newMessage.value = _deepClone( value );
                    newMessage.oldValue = _deepClone( node[ key ] );

                    // delete subnodes from the node
                    for ( k in node[ key ] )
                    {
                        secret.recursiveNodeDelete( path.concat( k ), node[ key ], k, { "message": options.message } );
                    }

                    // set value
                    node[ key ] = value;

                    // emit updated event to the root node
                    this.emit( "updated", path, newMessage );

                }
            }
            else
            {
                if ( _isContainer( value ) )
                {
                    /*
                        THE ORIGINAL NODE IS A VALUE, ONLY THE NEW NODE IS A CONTAINER
                    */

                    // create new message
                    newMessage = _deepClone( options.message );
                    newMessage.value = _deepClone( value );
                    newMessage.oldValue = _deepClone( node[ key ] );

                    // set value
                    node[ key ] = value;

                    // for all subnodes
                    for ( k in node[ key ] )
                    {
                        // emit created event
                        secret.recursiveEmitCreated( path.concat( k ), node[ key ], k, { "message": options.message } );
                    }

                    // emit updated event to the root node
                    this.emit( "updated", path, newMessage );

                }
                else
                {
                    /*
                        BOTH NODES ARE VALUES
                    */
                    if ( node[ key ] == value )
                    {
                        if ( "forceUpdate" in options && options.forceUpdate )
                        {
                            // create new message
                            newMessage = _deepClone( options.message );
                            newMessage.value = _deepClone( value );
                            newMessage.oldValue = _deepClone( node[ key ] );

                            // emit updated event to the root node
                            this.emit( "updated", path, newMessage );
                        }
                    }
                    else
                    {
                        // create new message
                        newMessage = _deepClone( options.message );
                        newMessage.value = _deepClone( value );
                        newMessage.oldValue = _deepClone( node[ key ] );

                        // emit updated event to the root node
                        this.emit( "updated", path, newMessage );

                        // set value
                        node[ key ] = value;
                    }
                }
            }

        };

        var _updateMiddleware = function( secret, parameters )
        {
            // parameter path
            var path = parameters.path;
            // parameter value
            var value = parameters.value;
            // parameter options
            var options = parameters.options;
            // parameter callback
            var callback = parameters.callback;

            /*
                TRAVERSE DATA
            */

            // result nodes from traversing
            var matches = [];

            // traverse data tree for nodes
            _traverse( path, 0, {}, "", secret.data, [],
                function ( match )
                {
                    matches.push( match );
                }
            );

            /*
                APPLY OPERATIONS
            */

            if ( matches.length > 0 )
            {
                // array for paths
                var retValues = [];

                // go through each match
                for ( var i=0; i<matches.length; ++i )
                {
                    // current match
                    var match = matches[ i ];

                    // toStringPath binding
                    match.path.toStringPath = _toStringPath.bind( match.path, match.path );

                    // add the path to the array
                    retValues.push( {"path":match.path, "oldValue":_deepClone( match.node ) } );

                    // recursive update nodes
                    secret.recursiveNodeUpdate( match.path, match.parentNode, match.key, value, options );

                    // // create new message
                    // var syncMessage = _deepClone( options.message );
                    // syncMessage.value = _deepClone( value );

                    // // emit create synchronization event
                    // this.emit( "syncUpdate", match.path, syncMessage );
                }

                _nextTick(
                    function ( )
                    {
                        // we call the callback function with the array of retValues
                        callback( null, retValues );
                    }
                );
            }
            else
            {
                _nextTick(
                    function ( )
                    {
                        callback( new Error( "Chandelier: there are no elements matching the following path: " + _toStringPath( path ) ) );
                    }
                );
            }
        };

        var _update = function ( secret, path, value, paramOptions, paramCallback )
        {
            /*
                MANAGE PARAMETERS
            */

            // handle string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;
            // clone value
            value = _deepClone( value );
            // default options object
            var options = ( typeof paramOptions === "object" ) ? paramOptions : {};
            // default message object in options
            if ( ! ( "message" in options ) ) { options.message = {}; }

            // callback function
            var callback;

            // promise to return
            var promise;

            // determine which parameter is the callback function
            if ( typeof paramOptions === "function" )
            {
                callback = paramOptions;
            }
            else
            {
                if ( typeof paramCallback === "function" )
                {
                    callback = paramCallback;
                }
                else
                {
                    try
                    {
                        // make a promise
                        promise = new this.Promise(
                            function( resolve, reject )
                            {
                                // that is handled by this new callback function
                                callback = function ( err, val )
                                {
                                    if ( err )
                                    {
                                        reject( err );
                                    }
                                    else
                                    {
                                        resolve( val );
                                    }
                                };
                            }
                        );
                    }
                    catch ( e )
                    {
                        // empty callback
                        callback = function ( ){};
                    }
                }
            }

            // call middlewares
            secret.callMiddlewares( "update",
                {
                    "path": path,
                    "value": value,
                    "options": options,
                    "callback": callback
                }
            );

            return promise;

        };

        ////////////////////////////////////////////////////////////
        //  DELETE
        ////////////////////////////////////////////////////////////

        var _recursiveNodeDelete = function ( secret, path, node, key, options )
        {
            // create new message
            var newMessage = _deepClone( options.message );
            newMessage.value = _deepClone( node[ key ] );

            // if the element is a container
            if ( _isContainer( node[ key ] ) )
            {
                // if this is an object
                if ( _isObject( node[ key ] ) )
                {
                    // we delete all subnodes recursively by their key
                    for ( var k in node[ key ] )
                    {
                        secret.recursiveNodeDelete( path.concat( k ), node[ key ], k, options );
                    }
                }
                else
                {
                    // we delete all subnodes recursively by their number
                    for ( var i=node[ key ].length-1; i>=0; --i )
                    {
                        secret.recursiveNodeDelete( path.concat( i ), node[ key ], i, options );
                    }
                }
            }

            // remove subnode
            if ( _isArray( node ) )
            {
                // apply modification
                node.splice( key, 1 );

                // emit deleted event of the element
                this.emit( "deleted", path, newMessage );
            }
            else
            {
                if ( _isObject( node ) )
                {
                    // apply modification
                    delete node[ key ];

                    // emit deleted event of the element
                    this.emit( "deleted", path, newMessage );
                }
            }

        };

        var _deleteMiddleware = function( secret, parameters )
        {
            // parameter path
            var path = parameters.path;
            // parameter options
            var options = parameters.options;
            // parameter callback
            var callback = parameters.callback;

            /*
                PREVENT DELETING ROOT
            */

            if ( path.length == 1 && path[ 0 ] == "$root" )
            {
                callback( new Error( "Chandelier: can't delete root" ) );
            }

            /*
                TRAVERSE DATA
            */

            // result nodes from traversing
            var matches = [];

            // traverse data tree for nodes
            _traverse( path, 0, {}, "", secret.data, [],
                function ( match )
                {
                    matches.push( match );
                }
            );

            /*
                APPLY OPERATIONS
            */

            if ( matches.length > 0 )
            {
                // array for value objects
                var retValues = [];

                // go through each match
                for ( var i=0; i<matches.length; ++i )
                {
                    // current match
                    var match = matches[ i ];

                    // toStringPath binding
                    match.path.toStringPath = _toStringPath.bind( match.path, match.path );

                    // add the object to the array
                    retValues.push(
                        {
                            "value": _deepClone( match.node ),
                            "path": match.path
                        }
                    );

                    // recursive update nodes
                    secret.recursiveNodeDelete( match.path, match.parentNode, match.key, options );

                    // create new message
                    var newMessage = _deepClone( options.message );
                    newMessage.value = _deepClone( match.parentNode );

                    // emit create event on the new element
                    this.emit( "updated", match.path.slice(0, -1), newMessage );

                    // // emit delete synchronization event
                    // this.emit( "syncDelete", match.path, _deepClone( options.message ) );
                }

                _nextTick(
                    function ( )
                    {
                        // we call the callback function with the array of retValues
                        callback( null, retValues );
                    }
                );
            }
            else
            {
                _nextTick(
                    function ( )
                    {
                        callback( new Error( "Chandelier: there are no elements matching the following path: " + _toStringPath( path ) ) );
                    }
                );
            }
        };

        var _delete = function ( secret, path, paramOptions, paramCallback )
        {
            /*
                MANAGE PARAMETERS
            */

            // handle string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;
            // default options object
            var options = ( typeof paramOptions === "object" ) ? paramOptions : {};
            // default message object in options
            if ( ! ( "message" in options ) ) { options.message = {}; }

            // callback function
            var callback;

            // promise
            var promise;

            // determine which parameter is the callback function
            if ( typeof paramOptions === "function" )
            {
                callback = paramOptions;
            }
            else
            {
                if ( typeof paramCallback === "function" )
                {
                    callback = paramCallback;
                }
                else
                {
                    try
                    {
                        // make a promise
                        promise = new this.Promise(
                            function( resolve, reject )
                            {
                                // that is handled by this new callback function
                                callback = function ( err, val )
                                {
                                    if ( err )
                                    {
                                        reject( err );
                                    }
                                    else
                                    {
                                        resolve( val );
                                    }
                                };
                            }
                        );
                    }
                    catch ( e )
                    {
                        // empty callback
                        callback = function ( ){};
                    }
                }
            }

            // call middlewares
            secret.callMiddlewares( "delete",
                {
                    "path": path,
                    "options": options,
                    "callback": callback
                }
            );

            return promise;

        };

        ////////////////////////////////////////////////////////////
        //  EVENTS
        ////////////////////////////////////////////////////////////

        /**
            Creates an event object
            @method _createEvent
            @param type Type
            @param path Source path
            @param message Message object to deliver
            @return The event object
        */
        var _createEvent = function ( type, path, message )
        {
            // deepclone path
            path = _deepClone( path );
            // toStringPath binding
            path.toStringPath = _toStringPath.bind( path, path );

            // create event object
            var event =
            {
                "type": type,
                "path": path,
                "message": _deepClone( message )
            };

            return event;
        };

        /**
            Calls the callback function with the events from the emitter queue in the next tick
            @method _emitFromQueue
            @param secret Private properties (binded)
        */
        var _emitFromQueue = function ( secret )
        {
            // while the queue is not empty
            while ( secret.emitterQueue.length > 0 )
            {
                // pop one from the beginning
                var obj = secret.emitterQueue.shift();

                try
                {
                    // emit event to the listener
                    obj.listener.callback( obj.e );
                }
                catch( e )
                {
                    console.log( "Chandelier event listener threw exception" );
                    console.log( e.stack || "" );
                    console.log( "Event:" );
                    console.log( JSON.stringify( obj.e, 0, 4 ) );
                }
            }

            // set the invoked flag to false
            secret.emitterInvoked = false;
        };

        /**
            Emits an event to the subscribed listener functions.
            @method _emit
            @param secret Private properties (binded)
            @param type {String} Id of the event type
            @param path {Array} Path of the event
            @param message Event message
        **/
        var _emit = function ( secret, type, path, message )
        {
            // string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;

            // event object
            var e = null;

            // stores if we have a matching event subscription
            var match = false;

            // go through all listeners
            for ( var i=0; i<secret.listeners.length; )
            {
                // the current listener
                var listener = secret.listeners[ i ];

                // if it has the type of the event, or wildcard and the path suits
                if ( ( type in listener.types || "*" in listener.types ) &&
                     _pathSuit( listener.path, path )                        )
                {
                    // if the event object is null
                    if ( e == null )
                    {
                        // we create one
                        e = _createEvent( type, path, message );
                    }

                    // we have a match
                    match = true;

                    // push the event into the emitter queue
                    secret.emitterQueue.push( {"listener": listener, "e": e } );

                    // if it is an one-of listener
                    if ( listener.once )
                    {
                        // we remove it
                        secret.listeners.splice( i, 1 );
                    }
                    else
                    {
                        // else we step to the next element
                        ++i;
                    }
                }
                else
                {
                    // else we step to the next element
                    ++i;
                }
            }

            // start emitting events if we had a match and the emitter has not invoked yet
            if ( match && !( secret.emitterInvoked ) )
            {
                _nextTick(
                    function ( )
                    {
                        secret.emitFromQueue();
                    }
                );

                // set the invoked flag to true
                secret.emitterInvoked = true;
            }

        };

        /**
            Subscribes a function to an event type.
            @method _on
            @param secret Private properties (binded)
            @param once Stores whether the callback is one-of or premanent (binded)
            @param type Id of the event type (String), or Ids of event types (Array of Strings). If it's "*", it will get all types of events.
            @param path {Array} Path of the event
            @param callback {Function} Event handler function.
        **/
        var _on = function ( secret, once, types, path, callback )
        {
            // if it is a single string, box it into an array
            if ( typeof types === "string" )
            {
                types = [ types ];
            }

            // string path
            path = ( typeof path === "string" ) ? _fromStringPath( path ) : path;

            // if the callback is not a function
            if ( typeof callback !== "function" )
            {
                return;
            }

            // object for the set of types
            var types_obj = {};

            // convert array to keys
            for ( var i=0; i<types.length; ++i )
            {
                types_obj[ types[ i ] ] = null;
            }

            // we add it
            secret.listeners.push( {"path": path, "types": types_obj, "callback": callback, "once": once } );
        };

        /**
            Unsubscribes a function from an event.
            @method _off
            @param secret Private properties (binded)
            @param callback {Function} Event handler function.
        **/
        var _off = function ( secret, callback )
        {
            // if the callback is not a function
            if ( typeof callback !== "function" )
            {
                return;
            }

            // go through all secret.listeners
            for ( var i=secret.listeners.length-1; i>=0; --i )
            {
                // if they have the same callback function
                if ( secret.listeners[ i ].callback == callback )
                {
                    // we remove it
                    secret.listeners.splice( i, 1 );
                }
            }
        };

        ////////////////////////////////////////////////////////////
        //  CONSTRUCTOR
        ////////////////////////////////////////////////////////////

        var Chandelier = function ( options )
        {
            options = ( typeof options === "undefined" || ! _isObject( options ) ) ? {} : options;

            // Object for private properties

                var secret = {};

            // Path conversion functions

                // Array to string path conversion
                this.toStringPath = _toStringPath;
                // String to array path conversion
                this.fromStringPath = _fromStringPath;

            // Middlewares

                // stack for middlewares
                secret.middlewares = [];

                // calls middlewares
                secret.callMiddlewares = _callMiddlewares.bind( this, secret );

                // adds a middleware function to the stack
                this.use = _use.bind( this, secret );

            // Key generation

                // bind generateKey to secret
                this.generateKey = _generateKey;

            // Promise

                if ( typeof Promise !== "undefined" )
                {
                    this.Promise = Promise;
                }

            // CRUD operations

                // data container
                secret.data = { "$root": { } };

                // Create

                // Emits created events on the created nodes
                secret.recursiveEmitCreated = _recursiveEmitCreated.bind( this, secret );
                // Create middleware to the bottom of the stack
                this.use( "create", _createMiddleware.bind( this, secret ) );
                // Front create function that invokes middlewares
                this.create = _create.bind( this, secret );

                // Read

                // Read middleware to the bottom of the stack
                this.use( "read", _readMiddleware.bind( this, secret ) );
                // Front read function that invokes middlewares
                this.read = _read.bind( this, secret );

                // Update

                // Recursively update the nodes in the data
                secret.recursiveNodeUpdate = _recursiveNodeUpdate.bind( this, secret );
                // Update middleware to the bottom of the stack
                this.use( "update", _updateMiddleware.bind( this, secret ) );
                // Front update function that invokes middlewares
                this.update = _update.bind( this, secret );

                // Delete

                // Recursively deletes the nodes in the data
                secret.recursiveNodeDelete = _recursiveNodeDelete.bind( this, secret );
                // Delete middleware to the bottom of the stack
                this.use( "delete", _deleteMiddleware.bind( this, secret ) );
                // Front delete function that invokes middlewares
                this["delete"] = _delete.bind( this, secret );

            // Events

                // Listeners array
                secret.listeners = [];
                // Emitter event queue
                secret.emitterQueue = [];
                // Stores whether we invoked the emitter callback yet
                secret.emitterInvoked = false;

                // Callback for emitting events
                secret.emitFromQueue = _emitFromQueue.bind( this, secret );

                // Emit event
                this.emit = _emit.bind( this, secret );
                // Subcribe permanent handler to event
                this.on = _on.bind( this, secret, false );
                // Subscribe one-off handler to event
                this.once = _on.bind( this, secret, true );
                // Unsubscribe from event
                this.off = _off.bind( this, secret );

        };
        
        if ( typeof window !== "undefined" )
        {
            window.Chandelier = Chandelier;
        }
        
        if ( typeof module !== "undefined" )
        {
            module.exports = Chandelier;
        }

    })();

