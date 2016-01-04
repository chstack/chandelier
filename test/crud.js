
    // chai's expect
    var expect = require( "chai" ).expect;

    // Promise shim
    Promise = ( typeof Promise === "undefined" ) ? require( "promise" ) : Promise;

    // Chandelier
    var Chandelier = require( "../src/chandelier.js" );

    // Instance of chandelier
    var ch = new Chandelier();

    // Set Promise
    ch.Promise = Promise;

    // test data for operations
    var testStructure =
    {
        "nil": null,
        "correct": true,
        "goldenRatio": 1.6180339887498948482,
        "loremIpsum": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consectetur mi a massa pulvinar, vel sagittis libero varius.",
        "sub":
        {
            "systems": ["Solar System", "Alpha Centauri", "Barnard's Star", "Luhman 16", "WISE 0855−0714", "Wolf 359", "Lalande 21185", "Sirius"],
            "primes": [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113],
        },
        "points":
        [
            { "x": 1, "y": 0 },
            { "x": 0, "y": 1 },
            { "x": -1, "y": 0 },
            { "x": 0, "y": -1 },
        ],
        "colors":
        {
            "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
            "yellow":   { "hex": "#FFFF00", "rgb": [ 255, 255, 0 ] },
            "green":    { "hex": "#00FF00", "rgb": [ 0, 255, 0 ] },
            "cyan":     { "hex": "#00FFFF", "rgb": [ 0, 255, 255 ] },
            "blue":     { "hex": "#0000FF", "rgb": [ 0, 0, 255 ] },
            "magenta":  { "hex": "#FF00FF", "rgb": [ 255, 0, 255 ] }
        }
    };

    // default structure for tests
    var defaultStructure =
    {
        "update":
        {
            "prev":
            {
                "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
                "yellow":   { "hex": "#FFFF00", "rgb": [ 255, 255, 0 ] },
                "green":    { "hex": "#00FF00", "rgb": [ 0, 255, 0 ] },
                "cyan":     { "hex": "#00FFFF", "rgb": [ 0, 255, 255 ] },
                "blue":     { "hex": "#0000FF", "rgb": [ 0, 0, 255 ] },
                "magenta":  { "hex": "#FF00FF", "rgb": [ 255, 0, 255 ] }
            },
            "colors":
            {
                "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
                "yellow":   { "hex": "#80800", "rgb": [ 128, 128, 0 ] },
            },
            "points":
            [
                { "x": -1, "y": 1 },
                { "x": 0, "y": 1 },
                { "x": 1, "y": 1 },
            ],
        },
        "create":
        {
            "value": 5,
            "objects":
            {
                "a": { "a":5, "c":7 },
                "b": { "x":1 },
                "c": { "m":8 }
            },
            "arrays":
            {
                "a": [1,2,3],
                "b": [1],
                "c": [10,30,40]
            },
            "withoutKey":{}
        },
        "read":
        {
            "colors":
            {
                "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
                "yellow":   { "hex": "#FFFF00", "rgb": [ 255, 255, 0 ] },
                "green":    { "hex": "#00FF00", "rgb": [ 0, 255, 0 ] },
                "cyan":     { "hex": "#00FFFF", "rgb": [ 0, 255, 255 ] },
                "blue":     { "hex": "#0000FF", "rgb": [ 0, 0, 255 ] },
                "magenta":  { "hex": "#FF00FF", "rgb": [ 255, 0, 255 ] }
            }
        },
        "delete":
        {
            "obj": { "asd": 0, "fgs": 1, "fds": 2 },
            "arr": [ 0, 1, 2, 3 ],
            "points":
            [
                { "x": 1, "y": 0 },
                { "x": 0, "y": 1 },
                { "x": -1, "y": 0 },
                { "x": 0, "y": -1 }
            ],
            "val": {"lemon": "yellow", "apple": "red", "pear": "green"},
            "colors":
            {
                "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
                "green":    { "hex": "#00FF00", "rgb": [ 0, 255, 0 ] },
                "cyan":     { "hex": "#00FFFF", "rgb": [ 0, 255, 255 ] },
                "blue":     { "hex": "#0000FF", "rgb": [ 0, 0, 255 ] }
            },
            "pathTest":
            {
                "a": { "a1":null, "a2":null },
                "b": { "b1":null, "b2":null },
                "c": { "c1":null }
            }
        }
    }

    Math.random();
    
    describe( "CRUD Operations",
        function ( )
        {

            ////////////////////////////////////////////////////////////
            //  CREATE
            ////////////////////////////////////////////////////////////

            describe( "create()",
                function ( )
                {
                    it( "adds element to object using fixed path with key",
                        function ( )
                        {
                            return ch.create( "/", defaultStructure, {"key": "test"} ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( defaultStructure );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "adds element to object using fixed path without key",
                        function ( )
                        {
                            return ch.create( "/test/create/withoutKey", testStructure ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/withoutKey/*" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( testStructure );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "adds elements to objects using wildcard path with key",
                        function ( )
                        {
                            return ch.create( "/test/create/objects/*", testStructure, {"key": "z"} ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/objects" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "a": { "a":5, "c":7, "z": testStructure },
                                            "b": { "x":1, "z": testStructure },
                                            "c": { "m":8, "z": testStructure }
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "adds elements to objects using wildcard path without key",
                        function ( )
                        {
                            var expected_obj =
                            {
                                "a": { "a":5, "c":7, "z": testStructure },
                                "b": { "x":1, "z": testStructure },
                                "c": { "m":8, "z": testStructure }
                            };

                            return ch.create( "/test/create/objects/*", 100 ).then(
                                function ( matches )
                                {
                                    var abc = [];

                                    matches.forEach(
                                        function ( match )
                                        {
                                            abc.push( match.path[ match.path.length-2 ] );

                                            expected_obj[ match.path[ match.path.length-2 ] ][ match.path[ match.path.length-1 ] ] = 100;
                                        }
                                    );

                                    abc.sort();
                                    expect( abc ).to.deep.equal( ["a","b","c"] );

                                    return ch.read( "/test/create/objects" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( expected_obj );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "adds element to array using fixed path with key",
                        function ( )
                        {
                            return ch.create( "/test/create/arrays/c", 20, {"key": 1} ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/arrays/c" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( [10,20,30,40] );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );                    
                    
                    it( "adds element to array using fixed path without key",
                        function ( )
                        {
                            return ch.create( "/test/create/arrays/c", 50 ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/arrays/c" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( [10,20,30,40,50] );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "adds elements to arrays using wildcard path with key",
                        function ( )
                        {
                            return ch.create( "/test/create/arrays/*", 0.5, {"key": 1} ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/arrays" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "a": [ 1, 0.5, 2, 3 ],
                                            "b": [ 1, 0.5 ],
                                            "c": [ 10, 0.5, 20, 30, 40, 50 ]
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );                    
                    
                    it( "adds elements to arrays using wildcard path without key",
                        function ( )
                        {
                            return ch.create( "/test/create/arrays/*", 100 ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/create/arrays" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "a": [ 1, 0.5, 2, 3, 100 ],
                                            "b": [ 1, 0.5, 100 ],
                                            "c": [ 10, 0.5, 20, 30, 40, 50, 100 ]
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );



                    it( "provides the paths of the created elements",
                        function ( )
                        {
                            return ch.create( "/test/create/objects/*", "asd", {"key":"pathTest"} ).then(
                                function ( matches )
                                {
                                    var expected_paths =
                                    [
                                        "/test/create/objects/a/pathTest",
                                        "/test/create/objects/b/pathTest",
                                        "/test/create/objects/c/pathTest"
                                    ]

                                    var match_paths = [];

                                    matches.forEach(
                                        function( match )
                                        {
                                            match_paths.push( match.path.toStringPath() );
                                        }
                                    );

                                    expected_paths.sort();
                                    match_paths.sort();

                                    expect( expected_paths ).to.deep.equal( match_paths );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "indicates error on creating an element with already existing key to an object",
                        function ( done )
                        {
                            ch.create( "/test/create", testStructure, {"key": "existingKey"} ).catch(
                                function ( err )
                                {
                                    done( err );
                                }
                            ).then(
                                function ( matches )
                                {
                                    return ch.create( "/test/create", testStructure, {"key": "existingKey"} );
                                }
                            ).then(
                                function ( matches )
                                {
                                    done( new Error() );
                                }
                            ).catch(
                                function ( err )
                                {
                                    done();
                                }
                            );
                        }
                    );

                    it( "indicates error if the path points to a non-existent node",
                        function ( done )
                        {
                            ch.create( "/nonexistent", {"asd":"asd"},
                                function ( err )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                    it( "indicates error if the path does not points to a container node",
                        function ( done )
                        {
                            ch.create( "/test/create/value", {"asd":"asd"},
                                function ( err )
                                {
                                    done( !err );
                                }
                            );
                        }
                    );

                }
            );


            ////////////////////////////////////////////////////////////
            //  READ
            ////////////////////////////////////////////////////////////

            describe( "read()",
                function ( )
                {
                    it( "reads element using fixed path",
                        function ( )
                        {
                            return ch.read( "/test/read" ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( defaultStructure.read );
                                }
                            );
                        }
                    );

                    it( "reads elements using wildcard path",
                        function ( )
                        {
                            return ch.read( "/test/read/colors/*/hex" ).then(
                                function ( matches )
                                {
                                    var match_colors = [];

                                    matches.forEach(
                                        function( match )
                                        {
                                            match_colors.push( match.value );
                                        }
                                    );

                                    var expected_colors = [ "#FF0000",  "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF" ];

                                    match_colors.sort();
                                    expected_colors.sort();

                                    expect( match_colors ).to.deep.equal( expected_colors );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "provides the paths of the elements",
                        function ( )
                        {
                            return ch.read( "/test/read/colors/*/hex" ).then(
                                function ( matches )
                                {
                                    var expected_paths =
                                    [
                                        "/test/read/colors/red/hex",
                                        "/test/read/colors/yellow/hex",
                                        "/test/read/colors/green/hex",
                                        "/test/read/colors/cyan/hex",
                                        "/test/read/colors/blue/hex",
                                        "/test/read/colors/magenta/hex"
                                    ]

                                    var match_paths = [];

                                    matches.forEach(
                                        function( match )
                                        {
                                            match_paths.push( match.path.toStringPath() );
                                        }
                                    );

                                    expected_paths.sort();
                                    match_paths.sort();

                                    expect( expected_paths ).to.deep.equal( match_paths );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "indicates error on reading non-existent node",
                        function ( done )
                        {
                            return ch.read( "/test/read/nonexistent" ).then(
                                function ( matches )
                                {
                                    done( new Error("") );
                                }
                            ).catch(
                                function ( )
                                {
                                    done();
                                }
                            );
                        }
                    );

                }
            );

            ////////////////////////////////////////////////////////////
            //  UPDATE
            ////////////////////////////////////////////////////////////

            describe( "update()",
                function ( )
                {
                    it( "updates element using fixed path in object",
                        function ( )
                        {
                            return ch.update( "/test/update/colors", testStructure.colors ).then(
                                function ( matches )
                                {
                                    return ch.read( matches[ 0 ].path );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( testStructure.colors );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "updates elements using wildcard path in objects",
                        function ( )
                        {
                            var black = { "hex": "#000000", "rgb": [ 0, 0, 0 ] };

                            return ch.update( "/test/update/colors/*", black ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/update/colors" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "red": black,
                                            "yellow": black,
                                            "green": black,
                                            "cyan": black,
                                            "blue": black,
                                            "magenta": black
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "updates element using fixed path in array",
                        function ( )
                        {
                            var point = { "x":0, "y":0 };

                            return ch.update( "/test/update/points/0", point ).then(
                                function ( matches )
                                {
                                    return ch.read( matches[ 0 ].path );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( point );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "updates elements using wildcard path in arrays",
                        function ( )
                        {
                            var point = { "x":0, "y":0 };

                            return ch.update( "/test/update/points/*", point ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/update/points" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( [ point,point,point] );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "provides the paths of the updated elements",
                        function ( )
                        {
                            return ch.update( "/test/update/colors/*/hex", "#FF0000" ).then(
                                function ( matches )
                                {
                                    var expected_paths =
                                    [
                                        "/test/update/colors/red/hex",
                                        "/test/update/colors/yellow/hex",
                                        "/test/update/colors/green/hex",
                                        "/test/update/colors/cyan/hex",
                                        "/test/update/colors/blue/hex",
                                        "/test/update/colors/magenta/hex"
                                    ]

                                    var match_paths = [];

                                    matches.forEach(
                                        function( match )
                                        {
                                            match_paths.push( match.path.toStringPath() );
                                        }
                                    );

                                    expected_paths.sort();
                                    match_paths.sort();

                                    expect( expected_paths ).to.deep.equal( match_paths );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "provides the previous values of the updated elements",
                        function ( )
                        {
                            return ch.update( "/test/update/prev", testStructure.sub ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].oldValue ).to.deep.equal( defaultStructure.update.prev );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "indicates error on updating non-existent element",
                        function ( done )
                        {
                            return ch.update( "/test/update/nonexistent", testStructure ).then(
                                function ( matches )
                                {
                                    done( new Error("") );
                                }
                            ).catch(
                                function ( )
                                {
                                    done();
                                }
                            );
                        }
                    );

                }
            );

            ////////////////////////////////////////////////////////////
            //  DELETE
            ////////////////////////////////////////////////////////////

            describe( "delete()",
                function ( )
                {
                    it( "removes element using fixed path from object",
                        function ( )
                        {
                            return ch.delete( "/test/delete/colors/cyan" ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/delete/colors" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "red":      { "hex": "#FF0000", "rgb": [ 255, 0, 0 ] },
                                            "green":    { "hex": "#00FF00", "rgb": [ 0, 255, 0 ] },
                                            "blue":     { "hex": "#0000FF", "rgb": [ 0, 0, 255 ] }
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "removes element using fixed path from array",
                        function ( )
                        {
                            return ch.delete( "/test/delete/points/2" ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/delete/points" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        [
                                            { "x": 1, "y": 0 },
                                            { "x": 0, "y": 1 },
                                            { "x": 0, "y": -1 }
                                        ]
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "removes elements using wildcard path from object",
                        function ( )
                        {
                            return ch.delete( "/test/delete/colors/*/rgb" ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/delete/colors" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        {
                                            "red":      { "hex": "#FF0000" },
                                            "green":    { "hex": "#00FF00" },
                                            "blue":     { "hex": "#0000FF" }
                                        }
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "removes elements using wildcard path from array",
                        function ( )
                        {
                            return ch.delete( "/test/delete/points/*/y" ).then(
                                function ( matches )
                                {
                                    return ch.read( "/test/delete/points" );
                                }
                            ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal(
                                        [
                                            { "x": 1 },
                                            { "x": 0 },
                                            { "x": 0 }
                                        ]
                                    );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "provides the paths of the removed elements",
                        function ( )
                        {
                            return ch.delete( "/test/delete/pathTest/*/*" ).then(
                                function ( matches )
                                {
                                    var expected_paths =
                                    [
                                        "/test/delete/pathTest/a/a1",
                                        "/test/delete/pathTest/a/a2",
                                        "/test/delete/pathTest/b/b1",
                                        "/test/delete/pathTest/b/b2",
                                        "/test/delete/pathTest/c/c1"
                                    ]

                                    var match_paths = [];

                                    matches.forEach(
                                        function( match )
                                        {
                                            match_paths.push( match.path.toStringPath() );
                                        }
                                    );

                                    expected_paths.sort();
                                    match_paths.sort();

                                    expect( expected_paths ).to.deep.equal( match_paths );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "provides the values of the removed elements",
                        function ( )
                        {
                            return ch.delete( "/test/delete/val" ).then(
                                function ( matches )
                                {
                                    expect( matches[ 0 ].value ).to.deep.equal( {"lemon": "yellow", "apple": "red", "pear": "green"} );

                                    return ch.Promise.resolve("");
                                }
                            );
                        }
                    );

                    it( "indicates error on deleting non-existent node",
                        function ( done )
                        {
                            return ch.delete( "/test/delete/nonexistent" ).then(
                                function ( matches )
                                {
                                    done( new Error("ASD") );
                                }
                            ).catch(
                                function ( )
                                {
                                    done();
                                }
                            );
                        }
                    );

                    it( "indicates error on deleting root",
                        function ( done )
                        {
                            return ch.delete( "/" ).then(
                                function ( )
                                {
                                    done( new Error("deleting root was successful") );
                                }
                            ).catch(
                                function ( )
                                {
                                    done();
                                }
                            );
                        }
                    );

                }
            );



        }
    );






