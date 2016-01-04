
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

    describe( "Path conversion",
        function ( )
        {
            it( "Array to string (fixed)",
                function ( )
                {
                    expect( ch.toStringPath( ["$root", "str", 1, "str"] ) ).to.deep.equal( "/str/1/str" );
                }
            );

            it( "String to array (fixed)",
                function ( )
                {
                    expect( ch.fromStringPath( "/str/1/str" ) ).to.deep.equal( ["$root", "str", "1", "str"] );
                }
            );            
            
            it( "Array to string (wildcard)",
                function ( )
                {
                    expect( ch.toStringPath( ["$root", "str", "$one"] ) ).to.deep.equal( "/str/*" );
                }
            );

            it( "String to array (wildcard)",
                function ( )
                {
                    expect( ch.fromStringPath( "/str/*" ) ).to.deep.equal( ["$root", "str", "$one"] );
                }
            );            
            
            it( "Array to string (any)",
                function ( )
                {
                    expect( ch.toStringPath( ["$any"] ) ).to.deep.equal( "//" );
                }
            );

            it( "String to array (any)",
                function ( )
                {
                    expect( ch.fromStringPath( "//" ) ).to.deep.equal( ["$any"] );
                }
            );

            
        }
    );
    