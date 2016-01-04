
    // chai's expect
    var expect = require( "chai" ).expect;

    // Promise shim
    Promise = ( typeof Promise === "undefined" ) ? require( "promise" ) : Promise;

    // Chandelier
    var Chandelier = require( "../src/chandelier.js" );

    // Instance of chandelier
    var ch;

    var EXPECTED_TIMEOUT = 2000;

    var testMessage =
    {
        "primes": [2, 3, 5, 7, 11, 13, 17],
        "loremIpsum": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas consectetur mi a massa pulvinar, vel sagittis libero varius.",
        "obj": {"a":0, "b":1}
    };

    describe( "Event emitter",
        function ( )
        {
            beforeEach(
                function( done ) 
                {            
                    // Instance of chandelier
                    ch = new Chandelier();

                    // Set Promise
                    ch.Promise = Promise;         

                    done();
                }
            );
            
            it( "delivers events for \"on\" handler",
                function ( done )
                {
                    var count = 3;

                    function onHandler( e )
                    {
                        try
                        {
                            expect( e.message ).to.deep.equal( testMessage );

                            count--;

                            if ( count==0 ) done();
                        }
                        catch ( e )
                        {
                            done( e );
                        }
                    }

                    ch.on( "onTest", "/", onHandler );
                    ch.emit( "onTest", "/", testMessage );
                    ch.emit( "onTest", "/", testMessage );
                    ch.emit( "onTest", "/", testMessage );
                    
                    ch.off( onHandler );
                }
            );

            it( "delivers events for \"once\" handler",
                function ( done )
                {
                    ch.once( "onceTest", "/", 
                        function ( e )
                        {
                            try
                            {
                                expect( e.message ).to.deep.equal( testMessage );

                                done();
                            }
                            catch ( e )
                            {
                                done( e );
                            }
                        }
                    );

                    ch.emit( "onceTest", "/", testMessage );
                }
            );

            it( "has the proper path in the event object",
                function ( done )
                {
                    var path = ["$root","asd","fgh",5];

                    ch.once( "xyz", path,
                        function ( e )
                        {
                            try
                            {
                                expect( e.path.slice() ).to.deep.equal( path );
                                done();
                            }
                            catch ( e )
                            {
                                done( e );
                            }
                        }
                    );

                    ch.emit( "xyz", path, testMessage );
                }
            );

            it( "has the proper string path in the event object",
                function ( done )
                {
                    var path = "/asd/fgs/5";

                    ch.once( "xyz", "/asd/fgs/5",
                        function ( e )
                        {
                            try
                            {
                                expect( e.path.toStringPath() ).to.deep.equal( path );
                                done();
                            }
                            catch ( e )
                            {
                                done( e );
                            }
                        }
                    );

                    ch.emit( "xyz", path, testMessage );
                }
            );

            it( "delivers messages in the emitting order",
                function ( done )
                {
                    var nums = [];
                    
                    function eventHandler( e )
                    {
                        nums.push( e.message.num );
                        
                        if ( nums.length<100 ) return;
                        
                        try
                        {
                            expect( nums ).to.deep.equal( nums.sort() );
                            done();
                        }
                        catch ( e )
                        {
                            done( e );
                        }
                    }

                    ch.on( "order", "/", eventHandler );

                    for ( var i=0; i<100; ++i )
                    {
                        ch.emit( "order", "/", {"num":i} );
                    }
                    
                    ch.off( eventHandler );
                }
            );            
            
            it( "removes \"once\" handler after using it once",
                function ( done )
                {
                    var delivered = 0;

                    ch.once( "onceTest2", "/",
                        function ( e )
                        {
                            delivered++;
                        }
                    );

                    ch.once( "finished", "/",
                        function( e )
                        {
                            if ( delivered==1 )
                            {
                                done();
                            }
                            else
                            {
                                done( new Error( "" ) );
                            }
                        }
                    );
                    
                    ch.emit( "onceTest2", "/", testMessage );
                    ch.emit( "onceTest2", "/", testMessage );
                    ch.emit( "finished", "/", {} );
                }
            );

            it( "removes \"on\" handler by calling off()",
                function ( done )
                {
                    var delivered = 0;

                    function onHandler( e )
                    {
                        delivered++;
                    }

                    ch.once( "finished", "/",
                        function( e )
                        {
                            if ( delivered==1 )
                            {
                                done();
                            }
                            else
                            {
                                done( new Error( "" ) );
                            }
                        }
                    );                    
                    
                    ch.on( "onTest2", "/", onHandler );
                    ch.emit( "onTest2", "/", testMessage );
                    ch.off( onHandler );
                    ch.emit( "onTest2", "/", testMessage );
                    ch.emit( "finished", "/", {} );
                }
            );

            it( "removes \"once\" handler by calling off()",
                function ( done )
                {
                    var delivered = 0;

                    function onceHandler( e )
                    {
                        delivered++;
                    }

                    ch.once( "finished", "/",
                        function( e )
                        {
                            if ( delivered==0 )
                            {
                                done();
                            }
                            else
                            {
                                done( new Error( "" ) );
                            }
                        }
                    );                    
                    
                    ch.once( "onceTest3", "/", onceHandler );
                    ch.off( onceHandler );
                    ch.emit( "onceTest3", "/", testMessage );
                    ch.emit( "finished", "/", {} );
                }
            );

            it( "does not delivers event to the handler that added after emitting the event",
                function( done )
                {
                    var delivered = 0;

                    function onceHandler( e )
                    {
                        delivered++;
                    }

                    ch.once( "finished", "/",
                        function( e )
                        {
                            if ( delivered==0 )
                            {
                                done();
                            }
                            else
                            {
                                done( new Error( "" ) );
                            }
                        }
                    );                    
                    
                    ch.emit( "asd", "/", testMessage );
                    ch.once( "asd", "/", onceHandler );
                    ch.emit( "finished", "/", {} );
                }
            );
            
            it( "emits event on virtual path for \"on\" handler",
                function ( done )
                {
                    function onHandler( e )
                    {
                        done();
                    }

                    ch.on( "test", "/asdf/fgs", onHandler );
                    ch.emit( "test", "/asdf/fgs", testMessage );
                    ch.off( onHandler );
                }
            );

            it( "emits event on virtual path for \"once\" handler",
                function ( done )
                {
                    ch.once( "test", "/asdf/fgs/5",
                        function ( e )
                        {
                            done();
                        }
                    );

                    ch.emit( "test", "/asdf/fgs/5", testMessage );
                }
            );

            it( "emits events for wildcard type \"on\" handler",
                function ( done )
                {
                    var count = 3;

                    function onHandler( e )
                    {
                        count--;

                        if ( count==0 ) done();
                    }

                    ch.on( "*", "/wildcard/*", onHandler );
                    ch.emit( "*", "/wildcard/a", testMessage );
                    ch.emit( "*", "/wildcard/b", testMessage );
                    ch.emit( "*", "/wildcard/c", testMessage );
                    ch.off( onHandler );
                }
            );

            it( "emits events for wildcard type \"once\" handler",
                function ( done )
                {
                    var count = 3;

                    function onceHandler( e )
                    {
                        count--;

                        if ( count==0 ) done();
                    }

                    ch.once( "*", "/wildcard/*", onceHandler );
                    ch.emit( "*", "/wildcard/a", testMessage );
                    ch.once( "*", "/wildcard/*", onceHandler );
                    ch.emit( "*", "/wildcard/b", testMessage );
                    ch.once( "*", "/wildcard/*", onceHandler );
                    ch.emit( "*", "/wildcard/c", testMessage );
                }
            );

            it( "emits events for wildcard event path \"on\" handler",
                function ( done )
                {
                    var expected_paths = [ "/x/asd/0", "/x/asd/1", "/x/asd/2", "/y/asd/0" ];
                    var emitted_paths = [];

                    function onHandler( e )
                    {
                        emitted_paths.push( e.path.toStringPath() );

                        if ( emitted_paths.length == 4 )
                        {
                            expected_paths.sort();
                            emitted_paths.sort();

                            try
                            {
                                expect( expected_paths ).to.deep.equal( emitted_paths );

                                done();
                            }
                            catch( e )
                            {
                                done( e );
                            }
                        }
                    }

                    ch.on( "onTest", "/*/asd/*", onHandler );
                    ch.emit( "onTest", "/x/asd/0", testMessage );
                    ch.emit( "onTest", "/x/asd/1", testMessage );
                    ch.emit( "onTest", "/x/asd/2", testMessage );
                    ch.emit( "onTest", "/y/asd/0", testMessage );
                    ch.off( onHandler );
                }
            );

            it( "emits events for wildcard event path \"once\" handler",
                function ( done )
                {
                    var expected_paths = [ "/x/asd/0", "/x/asd/1", "/x/asd/2", "/y/asd/0" ];
                    var emitted_paths = [];

                    function onceHandler( e )
                    {
                        emitted_paths.push( e.path.toStringPath() );

                        if ( emitted_paths.length == 4 )
                        {
                            expected_paths.sort();
                            emitted_paths.sort();

                            try
                            {
                                expect( expected_paths ).to.deep.equal( emitted_paths );

                                done();
                            }
                            catch( e )
                            {
                                done( e );
                            }
                        }
                    }

                    ch.once( "onceTest", "/*/asd/*", onceHandler );
                    ch.emit( "onceTest", "/x/asd/0", testMessage );
                    ch.once( "onceTest", "/*/asd/*", onceHandler );
                    ch.emit( "onceTest", "/x/asd/1", testMessage );
                    ch.once( "onceTest", "/*/asd/*", onceHandler );
                    ch.emit( "onceTest", "/x/asd/2", testMessage );
                    ch.once( "onceTest", "/*/asd/*", onceHandler );
                    ch.emit( "onceTest", "/y/asd/0", testMessage );
                }
            );

        }
    );






